## 1. Database and Security Boundary

- [x] 1.1 Inspect the live Supabase schema, grants, RLS, functions, active `connect-supabase-voting-codes` artifacts, and current project/image sources; document the compatible authoritative project and voting-open records to reuse.
- [x] 1.2 Add an additive migration for any missing project/voting-state records, the centralized expiring rate-limit store/function, and safe data seeding using the current stable project IDs.
- [x] 1.3 Replace the public-code vote RPC contract with a server-secret-only atomic function that accepts voting-code ID and project ID, locks/rechecks code state, checks voting-open and active-project state, derives category/points, inserts one uniquely constrained vote, and consumes the code in one transaction.
- [x] 1.4 Revoke obsolete anonymous voter RPC/table access while preserving authenticated admin grants, RLS, Supabase Auth, management functions, and Realtime behavior required by the existing dashboard.
- [x] 1.5 Apply the reviewed migration, regenerate database types, and run Supabase security/performance checks without dropping existing codes or votes.

## 2. Server-Only Voter Foundation

- [x] 2.1 Read the installed Next.js 16 guidance for every touched Route Handler, cookie, dynamic-rendering, and image response convention before editing application code.
- [x] 2.2 Separate the existing admin browser Supabase client from a `server-only` voter client that validates `SUPABASE_URL` and `SUPABASE_SECRET_KEY`; add placeholder-only environment documentation including `VOTER_SESSION_SECRET`.
- [x] 2.3 Implement minimal signed-cookie helpers using HMAC-SHA-256 with version, code ID, category, session ID, issue/expiry times, production cookie flags, safe verification, logout expiry, and post-vote receipt state; add one focused tamper/expiry/raw-code-exclusion check.
- [x] 2.4 Implement shared voter request validation, safe response/error mapping, no-store headers, and Supabase-backed rate-limit calls keyed by a secret-derived fingerprint without storing raw IP addresses or codes.

## 3. Public Voter Route Handlers

- [x] 3.1 Implement `POST /api/voter/verify-code` with uppercase normalization, exact format validation, centralized rate limiting, generic invalid-code behavior, enabled/unused database verification, category derivation, and secure cookie creation without consuming or returning the code.
- [x] 3.2 Implement protected `GET /api/voter/session` and `POST /api/voter/logout` with safe session fields and cookie expiration.
- [x] 3.3 Implement protected no-store `GET /api/voter/projects` and `GET /api/voter/projects/[id]` with active-only bounded data and public-field allowlists.
- [x] 3.4 Audit project image origins and either move Supabase-hosted voter images to a reachable public host or add a same-origin streaming proxy with active-project lookup, origin/type/size validation, and voter-facing URL rewriting.
- [x] 3.5 Implement rate-limited `POST /api/voter/vote` accepting only `projectId`, invoking the atomic database function from session identity, mapping concurrency/precondition failures safely, and rotating the cookie to receipt state only after commit.
- [x] 3.6 Implement protected no-store `GET /api/voter/receipt` using only server-controlled receipt state and returning the safe fields required by the success view.

## 4. Existing Voter UI Migration

- [x] 4.1 Replace manual homepage browser-Supabase verification and stored-code authorization with same-origin `POST /api/voter/verify-code` and `GET /api/voter/session` calls while preserving segmented input, MY/EN controls, glassmorphism, and current feedback layout.
- [x] 4.2 Update `/access` to read the QR query once, call the same verification endpoint, require the returned visitor category, remove the code from the visible URL, and replace-navigate directly to `/projects`.
- [x] 4.3 Replace static/direct project reads on `/projects` and `/projects/[id]` with no-store same-origin project endpoints while preserving cards, search/filter/sort, selection state, details, and the confirmation dialog.
- [x] 4.4 Submit only `{ projectId }` through `/api/voter/vote`, prevent repeated UI submissions, remove frontend counter/code/session authorization state, and render `/vote/success` from `/api/voter/receipt`.
- [x] 4.5 Remove all voter imports/use of the Supabase browser client, `createBrowserClient`, `supabase.from`, `supabase.rpc`, `supabase.channel`, raw-code storage, and localStorage/sessionStorage authorization; keep admin browser client/Auth/Realtime code behavior unchanged.
- [x] 4.6 Ensure protected voter pages use request-time state where required and confirm `next.config` does not use `output: "export"`.

## 5. Verification and Deployment

- [x] 5.1 Add focused handler/session contract checks for malformed and generic invalid codes, rate limits, cookie tampering/expiry/logout, protected-route authorization, safe project/receipt fields, and rejection of extra vote authorization fields.
- [x] 5.2 Extend the database concurrency check to prove verification does not consume a code, failed preconditions roll back, trusted category/points are copied, and simultaneous submissions commit exactly one vote.
- [x] 5.3 Run static searches proving voter modules contain no Supabase client/direct RPC/Realtime calls or raw-code persistence; verify admin modules still compile against their separate client.
- [x] 5.4 Run focused checks, `npm run typecheck`, and `npm run build`, and validate the OpenSpec change without representing configured-state builds as live Supabase verification.
- [ ] 5.5 Deploy Vercel server functions with `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and a strong `VOTER_SESSION_SECRET`, retaining public Supabase variables only where the admin frontend requires them.
- [ ] 5.6 Without a VPN, complete manual code login through receipt and visitor QR through receipt; inspect the Network panel and confirm public voter routes contact only the Vercel origin with no `*.supabase.co` HTTP or WebSocket request.
- [x] 5.7 Reconcile the superseded direct-voter requirements in `connect-supabase-voting-codes`, preserving its incomplete live-test history before sync/archive decisions.
