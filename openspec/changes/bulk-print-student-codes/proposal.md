## Why

Administrators can bulk-select visitor codes for pass generation, but cannot quickly prepare the full student-code list for paper distribution. A printable spreadsheet-style page avoids manual copying while keeping code management in the existing admin screen.

## What Changes

- Add a control that selects or clears every loaded student voting code.
- Add a print action for selected student codes that opens a clean, spreadsheet-style A4 landscape print view.
- Include each selected code's code, category, status, creation time, and use time when available; exclude admin controls and unrelated code categories from the printed sheet.
- Preserve existing code generation, filtering, disabling, and visitor-pass PDF behavior.

## Capabilities

### New Capabilities

- `student-code-print-sheet`: Selection and A4-landscape printing of student voting codes from the authorized admin code list.

### Modified Capabilities

- `supabase-voting-codes`: Extend administrator code management to support selecting and printing student code records.

## Impact

- Affects `src/features/exhibition/pages/admin/codes-page.tsx` and its focused admin-code checks.
- Uses the browser's native print flow and print CSS; no database migration, API change, or new dependency is required.
