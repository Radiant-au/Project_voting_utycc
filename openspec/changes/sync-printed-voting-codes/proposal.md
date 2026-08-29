## Why

The printed student and visitor passes contain fixed voting codes that must match the live database, but the current database inventory can drift when new random batches are generated. Administrators also cannot see which codes have already been printed or quickly find a specific code in the Codes tab.

## What Changes

- **BREAKING** Replace the current student and visitor voting-code inventories and their dependent voting activity with the codes in `public/Printed/student_codes_merged_bordered.xlsx` and `public/Printed/visitor_codes.json`.
- Move the printed-code source files out of `public/` into a git-ignored private import location so deployed visitors cannot download active voting codes.
- Preserve teacher codes, projects, and voting settings because no replacement teacher-code source was supplied.
- Record whether each voting code has been printed; imported student and visitor codes start as printed, while newly generated codes start as not printed.
- Add an administrator-only control to toggle a code between printed and not printed.
- Add printed-state filtering and case-insensitive full or partial code search to the existing `/utyccadmin/codes` page.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `supabase-voting-codes`: Define printed-code inventory replacement, printed-state tracking and administration, and searchable code management.

## Impact

- Supabase migration and admin RPC contracts for `voting_codes`.
- Destructive replacement of live student and visitor codes and their dependent votes, voter sessions, and idempotency records during the controlled import.
- `src/features/exhibition/pages/admin/codes-page.tsx` and generated Supabase TypeScript types.
- Local printed-code source files, moved from `public/Printed/` to a git-ignored non-public import location.
- Focused code-management checks; no new runtime dependency is required.
