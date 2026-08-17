## Why

The current UTYCC voting flow accepts only hard-coded demo PINs and stores votes in browser state, so it cannot enforce category assignment or one-vote-per-code rules. The existing `Voting_show` Supabase project is healthy but its public schema is empty, making this the right point to establish the real data and security boundary without migrating conflicting records.

## What Changes

- Replace demo PIN verification and local vote persistence with server-controlled Supabase voting codes and atomic vote submission.
- Add secure generation, verification, disabling, and single-use enforcement for 7-character uppercase alphanumeric codes assigned to `student`, `teacher`, or `visitor`.
- Add `/access?code=...` for automatic visitor verification while keeping `/projects` as the shared voting page for every category.
- Add `/admin/codes` for category-based generation, filtering, status review, disabling unused codes, and printable visitor QR passes.
- Preserve the existing glassmorphism UI and MY/EN language switch while removing manual category selection from the voter journey.
- Protect code and vote data with Row Level Security and narrow database functions so public clients cannot enumerate voting codes or submit duplicate votes.

## Capabilities

### New Capabilities

- `supabase-voting-codes`: Secure code lifecycle, fixed voter categories, visitor QR access, atomic single-use voting, and administrator code/pass management.

### Modified Capabilities

- `school-exhibition-voting-app`: Replace the demonstration category-selection and browser-only vote flow with one shared, Supabase-backed code verification and voting journey.

## Impact

- Affects the voter routes `/`, `/access`, `/projects`, and `/vote/success`, plus the new admin route `/admin/codes`.
- Replaces `src/features/exhibition/data/pin-session.ts` and mock vote submission paths with Supabase RPC calls and minimal session state.
- Adds the first public-schema migration to Supabase project `Voting_show` (`mbvneopqdrhuyrtmbsuk`) for `voting_codes`, `votes`, constraints, RLS, and database functions.
- Reuses the installed Supabase client and existing project/admin UI; QR rendering should use the smallest compatible implementation and avoid a second site or authentication system.
