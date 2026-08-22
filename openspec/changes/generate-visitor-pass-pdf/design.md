## Context

`/admin/codes` already loads authorized voting codes, tracks selected visitor codes, and builds each visitor URL from `NEXT_PUBLIC_SITE_ORIGIN`. Its current `window.print()` output is generic HTML. The approved artwork is the one-page landscape A4 `public/Visitor_frame.pdf`; `../qr-pdf-test/src/main.tsx` proves the PDF dimensions, three slot coordinates, QR settings, and backup-code typography.

## Goals / Non-Goals

**Goals:**

- Download one PDF for the currently selected visitor codes.
- Preserve the approved frame and calibrated placement exactly.
- Fill three slots per page in selection/list order and leave unused final-page slots unchanged.
- Keep visitor codes and PDF generation in the authenticated administrator's browser.

**Non-Goals:**

- Changing code generation, code status, database RPCs, or the public `/access` contract.
- Adding a PDF preview/editor, coordinate controls, alternate templates, or server-side PDF storage.
- Generating passes for student or teacher codes.

## Decisions

### Generate the PDF in the browser

Use `pdf-lib` to load `/Visitor_frame.pdf`, copy its first page once per three selected codes, draw the QR images and backup-code text, and trigger a Blob download. Use `qrcode` to create PNG data URLs with error correction `M`, margin `4`, width `600`, and black-on-white colors. This directly reuses the proven reference implementation and avoids a new API route or sending protected codes to another service.

### Keep the calibrated layout as fixed constants

Use a QR size of 125 points and Helvetica Bold at 18 points. Slots are:

- QR `(97.0, 312)`, code area `(141.38, 265, width 136.74)`
- QR `(364.4, 312)`, code area `(408.8, 265, width 136.74)`
- QR `(633.9, 312)`, code area `(678.24, 265, width 136.74)`

Center each seven-character backup code in its code area using the embedded font's measured width. These values come from the completed coordinate test, so the admin UI will not expose calibration controls.

### Chunk selected codes into groups of three

For each group, copy a clean template page and populate only the corresponding slots. Four selected codes therefore create two pages: slots 1–3 on page one and slot 1 on page two, with slots 2–3 left as the untouched frame.

### Replace the browser-print pass path

Change the existing selected-pass action to `Download visitor PDF`, disable it while generating or when no valid site origin is configured, and surface a concise generation error. Remove the hidden print-only pass markup and CSS after the PDF path is working; the code table and selection behavior remain unchanged.

### Select all loaded visitor codes in one action

Derive visitor rows from the code list already returned by the authorized RPC. A single button adds all of those visitor codes to the existing selection set, and changes to a clear action when they are all selected. This reuses the current data and selection state without another query or selection model.

## Risks / Trade-offs

- **Template or coordinate changes make output misaligned** → Keep the approved PDF and calibrated constants together and add a focused generation check for page count and slot placement inputs.
- **Large selections use browser memory while embedding QR images** → The current code-generation limit is bounded at 100, so sequential browser generation is sufficient.
- **A bad public origin creates unusable QR links** → Preserve the existing required `NEXT_PUBLIC_SITE_ORIGIN` guard and normalize its trailing slash before generating.
- **Browser download APIs fail** → Revoke the object URL after triggering the download and show an actionable admin error when generation fails.
