## Why

Teacher voting codes are currently generated and listed but have no bulk printable pass flow. The calibrated Teacher_frame.pdf already exists in public, so administrators need the same selected-code PDF workflow used for visitor passes.

## What Changes

- Add an administrator action to select teacher codes and download a multi-page teacher-pass PDF.
- Generate four teacher passes per Letter-portrait page from public/Teacher_frame.pdf.
- Reuse the calibrated teacher code positions from the sibling QR/PDF alignment tool.
- Keep visitor QR-pass generation unchanged; teacher passes contain only the assigned code on the supplied frame.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- supabase-voting-codes: Extend administrator code management with selected teacher-code PDF generation.

## Impact

- The existing visitor PDF generator or a small adjacent teacher PDF generator.
- The administrator codes page.
- public/Teacher_frame.pdf.
- Existing pdf-lib and qrcode dependencies; no database or API changes.
