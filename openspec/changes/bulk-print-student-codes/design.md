## Context

The admin codes page already maintains a selected-code set for visitor PDF passes and loads authorized records through `list_voting_codes`. Student codes need the equivalent bulk-selection flow, but in a tabular sheet that staff can print and hand out.

## Goals / Non-Goals

**Goals:**

- Reuse the current filtered, authorized code list and selection state.
- Print selected student records in a legible A4 landscape table using the browser print dialog.
- Keep printing separate from visitor QR-pass generation.

**Non-Goals:**

- Generating XLSX/CSV files, changing code records, or printing teacher/visitor code sheets.
- Adding server endpoints, database changes, or dependencies.

## Decisions

- Add student-only bulk select/clear alongside the existing visitor selection action. It operates only on currently loaded student rows, avoiding a new all-records query and preserving the user’s filters.
- Render a dedicated print-only table and call native `window.print()`. Print CSS supplies A4 landscape sizing and hides the admin shell; this produces the requested Excel-style layout without an XLSX library or export format ambiguity.
- Include only display-safe fields already present in the authorized result: code, category, status, created timestamp, and nullable used timestamp. The printed document carries no controls or unrelated categories.

## Risks / Trade-offs

- [A filter limits the loaded selection] → Present selection counts and retain the current filters so the administrator can intentionally print that subset.
- [Browser print rendering varies] → Use semantic table markup and `@page { size: A4 landscape; }`, then verify in a supported desktop browser.
