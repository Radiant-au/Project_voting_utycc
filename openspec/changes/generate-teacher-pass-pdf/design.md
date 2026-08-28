## Context

The administrator codes page already downloads selected visitor passes using pdf-lib and the public Visitor_frame.pdf template. Teacher_frame.pdf is a calibrated Letter-portrait template, and the sibling QR/PDF alignment tool records four teacher code centers: (154.68, 577.59), (462.82, 576.37), (154.49, 192.95), and (462.63, 188.74), with a 6.2 point baseline adjustment.

## Goals / Non-Goals

**Goals:**

- Download selected teacher codes as a multi-page PDF using the supplied teacher frame.
- Preserve every selected code, with four codes per page and blank unused slots on the final page.
- Reuse the existing client-side PDF download pattern and dependencies.

**Non-Goals:**

- Changing code generation, Supabase RPCs, code status, or voter verification.
- Adding QR codes to teacher frames; the calibrated teacher frame requires code text only.
- Adding another PDF library or a database-backed PDF endpoint.

## Decisions

- Add a focused teacher PDF generator beside the visitor generator. This keeps the incompatible page sizes and layouts separate without changing the proven visitor output.
- Load public/Teacher_frame.pdf in the administrator browser and copy its first page once per group of four selected teacher codes. This matches the existing visitor workflow and keeps templates versioned with the app.
- Validate that the template has at least one page and that its first page is Letter portrait (612 by 792 points, with a small tolerance). The sibling calibration is valid only for that frame.
- Render the code in Helvetica Bold at the calibrated centers after applying the shared baseline adjustment. The sibling alignment tool is the source of truth for those coordinates.

## Risks / Trade-offs

- A replacement frame can change dimensions or artwork → reject an unexpected page size with a clear error rather than creating misaligned passes.
- Frame artwork can move while retaining page dimensions → retain coordinates as named constants and recalibrate them with the sibling tool before changing production values.
- Large selected batches require sequential PDF/QR-style work in the browser → teacher output only draws text, and page groups are bounded at four codes.
