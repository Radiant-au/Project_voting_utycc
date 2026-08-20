## Why

Public voter devices cannot reliably reach Supabase without a VPN, and the current voter flow imports the browser Supabase client and retains the voting code in browser storage. The voter browser must instead use only same-origin Vercel endpoints while Next.js performs protected Supabase operations server-side.

## What Changes

- **BREAKING** for the public voter data-access layer: replace voter-side Supabase RPC calls and browser-held voting credentials with `/api/voter/*` Route Handlers and a short-lived signed HTTP-only cookie.
- Add server-only Supabase configuration using `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `VOTER_SESSION_SECRET`; keep public Supabase configuration only for the unchanged admin frontend.
- Add voter endpoints for code verification, session inspection, logout, project listing/detail, atomic vote submission, and receipt retrieval.
- Make manual and visitor-QR verification normalize and validate the code, apply rate limiting, derive category from Supabase, create the secure session, and remove the raw code from browser-visible state and URLs.
- Load active, safe project data and project images through Vercel so public voter devices never request Supabase HTTP or Realtime domains directly.
- Preserve database-enforced one-code-one-vote behavior, weighted points, and atomic code consumption while moving voter authorization inputs from the browser to the verified server session.
- Keep the existing admin dashboard, Supabase Auth, browser client, Realtime behavior, visual design, MY/EN controls, cards, confirmation dialog, and success page unchanged except where shared voter data types require compatibility updates.
- Require server-rendered Vercel functions, dynamic protected routes where needed, generic safe failures, rate limiting, and production/network verification without a VPN.

## Capabilities

### New Capabilities

- `voter-server-api`: Same-origin voter Route Handlers, server-only Supabase access, secure cookie sessions, rate limiting, safe project/image delivery, vote submission, and receipts.

### Modified Capabilities

- `school-exhibition-voting-app`: Route the existing manual-code and visitor-QR journeys through the Vercel voter API while preserving the presentation and shared `/projects` flow.
- `supabase-client-configuration`: Separate the admin browser client from a server-only voter client and prevent voter/client bundles from receiving secret configuration.
- `vercel-deployment`: Require server functions and private voter environment variables rather than a static export.

## Impact

- Affects public voter pages under `/`, `/access`, `/projects`, `/projects/[id]`, and `/vote/success`; new handlers live under `src/app/api/voter/`.
- Replaces voter use of `src/lib/supabase/client.ts` and `src/features/exhibition/data/pin-session.ts` with a small same-origin API/session boundary while retaining a clearly separate admin Supabase client.
- Updates the Supabase migration/function contract so the server submits a voting-code ID and project ID atomically, validates voting/project state, derives category and points, and returns a safe receipt.
- Requires Vercel server environment configuration, rate-limit storage appropriate for deployed instances, proxied or relocated project images, focused concurrency/session/API checks, `npm run build`, and browser Network-panel verification without a VPN.
