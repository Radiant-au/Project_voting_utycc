## 1. Student selection

- [x] 1.1 Extend the admin codes page selection logic with a student-only select-all/clear control that works against the currently loaded rows and preserves other selections.
- [x] 1.2 Add accessible selection labels and selected-count/action availability states for student-code printing.

## 2. Print sheet

- [x] 2.1 Render a print-only spreadsheet-style table for selected student records using existing code fields.
- [x] 2.2 Add a native browser print action and A4 landscape print CSS that excludes the admin shell and controls.

## 3. Verification

- [x] 3.1 Add or extend one focused admin-code check covering student bulk selection and the student print data set.
- [x] 3.2 Run the focused check, `npm run typecheck`, `npm run build`, `openspec validate --changes`, and `git diff --check`.
- [ ] 3.3 In a desktop browser, select student codes and verify the print preview is A4 landscape, contains only the selected student rows, and hides controls.
