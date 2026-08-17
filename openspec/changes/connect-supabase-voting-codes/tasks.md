## 1. Database Security Boundary

- [x] 1.1 Read the installed Next.js 16 guidance relevant to the touched App Router, navigation, and server/client boundaries before editing application code.
- [x] 1.2 Add a versioned Supabase migration for `voting_codes` and `votes` with seven-character/category/status checks, timestamps, foreign key, and unique single-vote constraints.
- [x] 1.3 Add fixed-search-path `SECURITY DEFINER` functions for cryptographic bounded code generation, read-only verification, atomic row-locked vote submission, authorized code listing, and disabling only unused codes.
- [x] 1.4 Enable RLS, remove public table access, grant only the required voter RPCs to public clients, and restrict management RPCs to authenticated JWTs with `app_metadata.role = admin`.
- [x] 1.5 Apply the reviewed migration to Supabase project `Voting_show` through Supabase MCP, generate TypeScript database types, and run security and performance advisors.

## 2. Shared Voter Flow

- [x] 2.1 Replace demo PIN helpers and mock vote persistence with typed Supabase RPC calls, seven-character uppercase input normalization, explicit invalid/used/disabled/network results, and minimal `sessionStorage` voter state.
- [x] 2.2 Update `/` to verify a manual code without category selection, and guard `/projects` so every category uses the same existing project catalogue and selection UI.
- [x] 2.3 Add `/access` to validate the URL code, require the verified `visitor` category, store the same voter session, and redirect to `/projects` without showing the manual form.
- [x] 2.4 Submit the confirmed project through the atomic vote RPC, prevent repeated client submissions, route only a committed vote to `/vote/success`, and clear the used voter credential.
- [x] 2.5 Preserve the current glassmorphism design, responsive/accessibility behavior, and MY/EN translations for all new labels, states, and errors.

## 3. Admin Code Management

- [x] 3.1 Protect `/admin/codes` with Supabase email/password Auth and the admin role claim, including a minimal sign-in state for an unauthenticated administrator.
- [x] 3.2 Build the existing-dashboard code section for bounded generation by category, authorized listing, category/status filtering, and confirmed disabling of unused codes.
- [x] 3.3 Add the smallest maintained QR dependency, construct URLs from the configured public site origin, and render selectable printable visitor passes with the required title, QR, backup code, visitor label, and single-use warning.
- [x] 3.4 Add print-only styling that produces one usable visitor pass per selected code without exposing unrelated dashboard content.

## 4. Verification

- [x] 4.1 Add one focused database concurrency check proving verification does not consume a code, failed inserts roll back, and simultaneous submissions commit exactly one vote.
- [ ] 4.2 Verify student, teacher, visitor QR, invalid, already-used, disabled, network, unauthorized-admin, filtering, disabling, and print flows against the connected Supabase project.
- [x] 4.3 Run the app's focused checks, TypeScript check, and production build; confirm direct anonymous table queries cannot enumerate codes or votes.
- [x] 4.4 Record the configured site origin and initial admin setup steps without committing credentials or service-role secrets.
