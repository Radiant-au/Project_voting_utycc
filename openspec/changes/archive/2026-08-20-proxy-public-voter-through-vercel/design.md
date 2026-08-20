## Context

The current Next.js 16 voter pages are client components. They import one browser Supabase client, call `verify_voting_code` and `submit_vote` directly, and keep the raw code plus category in `sessionStorage`. Supabase RLS and an atomic vote function already form part of the database boundary, while the admin dashboard uses the browser client and may continue doing so through a VPN.

Public voters cannot reliably reach Supabase in the deployment region. Their only dependable origin is the Vercel-hosted application, so all voter authorization, data reads, images, and vote writes must cross a Next.js Route Handler boundary. The existing appearance and admin behavior are constraints, as are seven-character codes, database-derived categories, weighted points, and first-commit-wins concurrency.

## Goals / Non-Goals

**Goals:**

- Ensure public voter browsers communicate only with the Next.js origin.
- Keep the Supabase secret and original verified code out of client bundles and browser storage.
- Provide short-lived, tamper-evident voter authorization through an HTTP-only cookie.
- Preserve atomic one-code-one-vote enforcement and calculate category/points from trusted data.
- Preserve existing voter presentation and the existing direct-Supabase admin boundary.
- Leave focused, runnable checks for session tampering, API contracts, and concurrent voting.

**Non-Goals:**

- Redesigning admin pages, replacing admin Supabase Auth/Realtime, or proxying admin traffic.
- Introducing voter accounts, OAuth, user-selectable categories, or a second visitor site.
- Adding a general API framework, ORM, session package, or custom image-storage service.
- Providing public Supabase Realtime results.

## Decisions

### Separate server and admin Supabase clients

Keep the existing public-key browser client in an explicitly admin-only module and add a `server-only` voter client built from `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. Only Route Handlers and server voter modules may import the latter. Voter client components import a typed same-origin fetch helper, never either Supabase module. A build/static scan checks that voter modules contain no browser-client import, `supabase.from`, `supabase.rpc`, or `supabase.channel` usage.

Alternative considered: reuse the publishable browser client in Route Handlers. Rejected because it retains public RPC exposure and does not establish a server authorization boundary.

### Use the required Route Handlers as a small backend-for-frontend

Implement `POST verify-code`, `GET session`, `POST logout`, `GET projects`, `GET projects/[id]`, `POST vote`, and `GET receipt` under `src/app/api/voter/`. Handlers validate JSON/parameters, enforce method-specific limits, validate the session on every protected route, set `Cache-Control: no-store`, and map internal failures to small generic response unions. The browser sends credentials automatically with same-origin fetches and sends only `{ projectId }` when voting.

Next.js 16 Route Handlers are request-time by default when they access cookies, request data, or databases. Protected pages also use request-time session state rather than static export or build-time database reads. `output: "export"` remains absent.

Alternative considered: Server Actions. Rejected because the requested stable HTTP API is also needed by QR entry, retries, tests, and client-side interactions.

### Sign a minimal short-lived cookie with the standard crypto API

After verification, issue a compact payload containing a version, voting-code row ID, database category, issued/expiry times, and a random session ID. Sign it with HMAC-SHA-256 using `VOTER_SESSION_SECRET`; compare signatures safely and reject malformed, expired, or unknown-version payloads. Store no raw voting code or point value. Set the cookie `httpOnly`, `sameSite: "lax"`, `path: "/"`, `secure` in production, and with a short `maxAge`. Logout expires it. Successful voting rotates it to a short receipt state containing only the committed vote ID, preventing reuse while permitting `GET receipt`.

Alternative considered: add a session/JWT dependency or store sessions in a new table. Rejected because a signed, short-lived, revocable-by-code-state cookie covers this bearer-code flow with less code; protected operations still recheck Supabase state.

### Centralize rate limiting in Supabase

Use a narrow server-only PostgreSQL rate-limit function/table keyed by an HMAC-derived request fingerprint and action (`verify` or `vote`) with bounded windows and expiry. The Route Handler computes the fingerprint from normalized client address signals plus `VOTER_SESSION_SECRET`; raw IP addresses and submitted codes are not stored. Because Vercel instances are ephemeral, an in-memory limiter alone would not enforce limits across instances. The limiter returns only allow/deny/retry timing and is callable only by the server secret role.

Alternative considered: an in-memory map. Rejected because simultaneous or cold Vercel instances bypass it. A new hosted rate-limit vendor is unnecessary while Supabase already provides centralized storage.

### Keep verification generic and code consumption deferred

`verify-code` uppercases and checks `^[A-Z0-9]{7}$` before any database lookup, applies the verification limit, and invokes a server-only function/query that returns the code ID and category only for enabled, unused codes. Invalid, missing, disabled, and used codes share one public invalid-code response. Verification never mutates code status. `/access` posts the URL value to the same endpoint, accepts only a returned visitor session, immediately calls `history.replaceState` or navigates with `router.replace` to remove the query, and continues to `/projects`.

Alternative considered: preserve distinct used/disabled errors. Rejected because generic failures leak code lifecycle information and conflict with the requested security boundary.

### Make PostgreSQL the final voting authority

Revise the atomic function so only the server secret role can invoke it and its inputs are the session's voting-code ID plus the browser's project ID. In one transaction it locks/rechecks the enabled unused code, checks the authoritative voting-open setting, checks that the project exists and is active, derives category and points (`student=1`, `teacher=2`, `visitor=3`), inserts one vote including copied category/points, and marks the code used. Retain a unique constraint on `votes.voting_code_id`. No frontend counter mutation participates in totals.

The schema must contain authoritative active projects and a voting-open setting for these checks. Reuse existing tables if present at apply time; otherwise add the smallest compatible `projects` record and singleton voting setting, with a data migration from the current stable catalogue before enabling voting. Admin contracts remain compatible with these records.

Alternative considered: validate projects only against a TypeScript array before calling the function. Rejected because concurrent/deployed state could differ and the explicit atomic contract requires PostgreSQL to confirm project and voting state.

### Return safe project and receipt views; proxy Supabase images only when needed

Project handlers select only the public fields required by the existing cards/details and return active records with bounded pagination. They never return vote rows, code fields, internal ownership, or admin metadata. If an image URL targets a Supabase host, rewrite it to a same-origin Next.js image proxy/Route Handler that validates the referenced active project and streams the allowlisted object; non-Supabase public assets may remain on their reachable host. Current-state fetches use `cache: "no-store"` and response no-store headers.

`GET receipt` uses the post-vote cookie's vote ID and returns only display-safe receipt fields. It never accepts a voting code or arbitrary vote ID from the browser.

Alternative considered: expose signed Supabase Storage URLs. Rejected because the voter device would still contact a Supabase domain.

### Preserve the admin boundary explicitly

Admin modules continue importing the public-key browser client and may keep Supabase Auth and Realtime. Database grants/RLS retain authenticated admin operations but revoke public voter RPC/table access made obsolete by the server API. Shared types may be extracted only where both boundaries genuinely use the same response shape; no admin redesign or proxy is added.

## Risks / Trade-offs

- [The Supabase-backed limiter adds one database operation per protected mutation] → Keep the function narrow, indexed, windowed, and periodically delete expired buckets.
- [A signed cookie can remain valid after an administrator disables a code] → Recheck enabled/unused state in protected database reads and always in the atomic vote function.
- [Forwarded client addresses can be spoofed outside Vercel] → Trust only the documented Vercel forwarding header in production and combine it with action/session context; treat rate limiting as defense in depth, not voting integrity.
- [Migrating static projects can drift from the displayed catalogue] → Seed stable IDs once, compare catalogue IDs during migration, and make Supabase authoritative before switching voter reads.
- [Proxying large images increases Vercel bandwidth and latency] → Prefer moving public assets to an accessible host; when proxying is required, stream only allowlisted active-project images with conservative size/type limits.
- [The secret role bypasses RLS] → Restrict it to server-only modules, expose minimal fixed queries/functions, validate every input, and never serialize database errors or secrets.
- [The existing active OpenSpec change describes direct voter RPC access] → Apply this change as the superseding voter architecture and reconcile/archive the older change without restoring its browser-RPC requirements.

## Migration Plan

1. Inventory the live Supabase schema and reconcile the unfinished direct-client change; add an additive migration for authoritative projects/voting state, server-only rate limiting, tightened grants, and the revised atomic vote function.
2. Add server-only environment validation, separated Supabase clients, cookie/session helpers, safe response types, and focused checks without committing values.
3. Add the voter Route Handlers, then switch voter pages from browser Supabase/session storage to same-origin fetches while preserving current markup and styles.
4. Remove raw-code persistence, clean the visitor URL before navigation, proxy any Supabase-hosted images, and verify admin imports/Realtime remain unchanged.
5. Run database concurrency/security checks, session/API checks, typecheck, and `npm run build`; deploy with all three private variables.
6. Test manual and visitor flows without a VPN and inspect the Network panel for any Supabase HTTP/WebSocket request from public routes before opening voting.

Rollback by deploying the prior application while retaining additive database objects. Do not drop votes, codes, or project data during rollback. Restore public RPC grants only through a separately reviewed migration if an emergency rollback truly requires direct voter access.

## Open Questions

- Confirm the live table names/columns for projects and voting-open state during apply; reuse them when compatible rather than creating duplicates.
- Choose the short session and receipt lifetimes during deployment configuration; default implementation targets minutes for voting and enough time to display the immediate receipt.
- Decide whether existing project images will be moved to a reachable public host or proxied after auditing their current URLs.
