## Context

The admin Codes page lists protected rows through `list_voting_codes`, but `voting_codes` has no printed-state field and the page has no code search. The supplied workbook contains 1,000 unique uppercase seven-character student codes, and the visitor JSON contains 100 unique uppercase seven-character visitor codes with no overlap between those files. Both files currently sit under Next.js `public/`, which would expose active codes as downloadable static assets.

The replacement affects live authentication credentials and rows referenced by votes, voter sessions, and idempotency records. It therefore needs a validated, transactional import rather than ordinary code generation.

## Goals / Non-Goals

**Goals:**

- Make the printed student and visitor codes the exact live inventory for those categories.
- Preserve teacher codes, projects, and voting settings.
- Track and administer printed state on every code.
- Find any code by full or partial text and filter by printed state in the existing admin page.
- Keep active code values out of public assets and committed source files.

**Non-Goals:**

- Import or regenerate teacher codes.
- Add batch history, printer integration, or automatic printed-state changes when a browser download begins.
- Add a spreadsheet parsing dependency to the deployed application.

## Decisions

### Keep source files private and perform a one-time controlled import

Move the supplied files to a git-ignored non-public directory before deployment. Extract and validate their values during implementation, then execute the live data replacement without checking generated code literals into a migration or OpenSpec artifact. A schema migration will contain only schema and RPC changes.

Alternative considered: keep the files in `public/` or embed all codes in a checked-in SQL migration. Both make active credentials easier to retrieve, so they are rejected.

### Replace only student and visitor inventory

In one transaction, identify student and visitor code IDs; delete dependent idempotency records, voter sessions, and votes for those IDs; delete those voting codes; and insert the validated 1,000 student and 100 visitor codes as `unused` and printed. Teacher records and unrelated application data remain unchanged.

The import MUST validate exact source counts, seven-character uppercase-alphanumeric format, uniqueness within and across both sources, and collisions with preserved teacher codes before deleting anything. Any failure rolls back the transaction.

Alternative considered: delete every voting code. This would discard teacher inventory without a replacement source and exceeds the supplied data scope.

### Store printed state on `voting_codes`

Add `is_printed boolean not null default false`. Existing generated codes and future calls to `generate_voting_codes` use the default; imported student and visitor codes explicitly use `true`. A narrow administrator-only `set_voting_code_printed(text, boolean)` RPC updates the selected row.

Alternative considered: infer printed state from file membership. That cannot represent later manual printing or correction and couples live UI behavior to private import files.

### Extend the existing listing RPC for server-side search

Replace the current `list_voting_codes(text, text)` RPC with a backward-compatible parameter set that adds nullable code query and printed-state filters. Search normalizes input and uses case-insensitive partial matching. The existing admin check and category/status validation remain in the shared function.

Server-side search is required because generated inventories can exceed the API's normal row response limit; filtering only the currently loaded rows could incorrectly report that a code does not exist.

Alternative considered: filter the React array only. It is shorter but cannot reliably find rows omitted by the response cap.

### Reuse the Codes tab and current controls

Add one search input, one All/Printed/Not printed filter, and one per-row printed toggle to `/utyccadmin/codes`. Keep the existing category/status filters, selection, downloads, and disable action.

## Risks / Trade-offs

- [A malformed or incomplete source could erase valid inventory] → Validate all source and preserved-teacher constraints before the transactional delete.
- [The reset invalidates active student or visitor sessions and votes] → Treat this as an explicit destructive reset, delete only dependent rows for replaced categories, and verify post-import counts and zero dependent votes before handoff.
- [Active codes could leak through static hosting or Git] → Move source files outside `public/`, git-ignore the private directory, and never write code literals into tracked artifacts.
- [Changing an RPC signature can temporarily mismatch deployed UI and database] → Keep defaults for new parameters, apply the schema first, then deploy the UI and verify both old and new calls.
- [A printed toggle can be changed accidentally] → Make the control explicit, accessible, admin-only, and update only one exact normalized code.

## Migration Plan

1. Move both source files from `public/Printed/` to a git-ignored private import directory.
2. Add and apply the schema/RPC migration for `is_printed`, searchable listing, and printed-state update.
3. Extract source values locally and validate format, exact counts, uniqueness, cross-source overlap, and teacher collisions.
4. Run the student/visitor replacement in one live transaction and mark every imported row printed.
5. Regenerate local Supabase TypeScript types and deploy the Codes tab update.
6. Verify 1,000 student and 100 visitor codes, all imported rows printed and unused, preserved teacher count, zero dependent student/visitor votes and sessions, and successful admin search/toggle behavior.

Rollback before import is unnecessary because validation makes no changes. After import, restore the database from a pre-import backup if the removed code/vote history is required; otherwise rerun the validated import from the private source files.

## Open Questions

None. The inspected source counts and the category-preservation boundary are recorded above.
