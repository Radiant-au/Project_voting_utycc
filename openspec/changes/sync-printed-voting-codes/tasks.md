## 1. Secure and Validate Printed Sources

- [x] 1.1 Move the workbook and visitor JSON from `public/Printed/` to a non-public git-ignored import directory and verify they are absent from deployable static assets and Git status.
- [x] 1.2 Extract the source codes without adding a runtime dependency and verify exactly 1,000 unique valid student codes, 100 unique valid visitor codes, no cross-source overlap, and no collision with preserved teacher codes.
- [x] 1.3 Record pre-import live counts for teacher codes, projects, voting settings, student/visitor codes, votes, sessions, and idempotency rows so preservation and destructive scope can be verified.

## 2. Database Contract

- [x] 2.1 Add a Supabase migration for `voting_codes.is_printed`, the administrator-only exact-code printed-state update RPC, and the extended administrator listing RPC with optional code-query and printed-state filters.
- [x] 2.2 Preserve the existing admin authorization, category/status validation, ordering, grants, generated-code behavior, and fixed seven-character code constraints in the updated RPCs.
- [x] 2.3 Regenerate or minimally update Supabase TypeScript types for `is_printed` and the changed RPC arguments and returns.

## 3. Administrator Codes UI

- [x] 3.1 Add a labeled code search input and All/Printed/Not printed filter to the existing `/utyccadmin/codes` filter row and load results through the shared listing RPC.
- [x] 3.2 Add an accessible per-row printed-state control that calls the protected update RPC, handles failures, and refreshes the saved row state.
- [x] 3.3 Keep category/status filters, selection state, code downloads, visitor/teacher PDFs, and unused-code disabling working with the new search and printed filter.

## 4. Controlled Live Inventory Replacement

- [x] 4.1 Apply the schema/RPC migration before importing data and verify the old Codes UI remains compatible through defaulted RPC parameters.
- [x] 4.2 Revalidate source counts and teacher collisions, then transactionally delete only student/visitor dependent idempotency rows, sessions, votes, and codes before inserting the printed source codes as `unused` with `is_printed = true`.
- [x] 4.3 Verify the live database has exactly 1,000 printed unused student codes and 100 printed unused visitor codes, no dependent student/visitor voting activity, and unchanged teacher, project, and voting-setting counts/state.

## 5. Verification

- [x] 5.1 Add one focused runnable regression check covering migration security, printed defaults and updates, server-side case-insensitive search, printed filtering, and required Codes-tab controls.
- [x] 5.2 Run the focused code-management checks, typecheck, production build, strict OpenSpec validation, and `git diff --check`.
- [ ] 5.3 Authenticated-browser verify full and partial code search, printed filtering, one toggle round trip, and unchanged student/visitor/teacher download actions; restore the tested toggle to its original state.
