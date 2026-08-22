## Why

Administrators currently print generic browser-rendered visitor passes, so the output does not use the approved `public/Visitor_frame.pdf` artwork or the calibrated QR and backup-code positions. They need one downloadable PDF containing the selected visitor codes in that exact three-pass layout.

## What Changes

- Add an admin action that generates and downloads visitor passes for the selected visitor codes as one PDF.
- Add one-click selection and clearing of all visitor codes currently shown in the authorized code list.
- Use `public/Visitor_frame.pdf` as the fixed landscape A4 page template and place each QR URL and backup code at the calibrated coordinates from the `qr-pdf-test` reference project.
- Put up to three visitor passes on each page, preserving empty template slots on the final page; for example, four selected codes produce one full page and a second page with only the first slot filled.
- Replace the current generic browser-print pass output with the template-based PDF download and show actionable errors when the site origin, template, or PDF generation is unavailable.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `supabase-voting-codes`: Change administrator visitor-pass output from generic browser printing to a downloadable, template-based, multi-page PDF for selected visitor codes.

## Impact

- Affects `/admin/codes`, its visitor-code selection and output controls, and the obsolete print-only styles.
- Uses the existing `NEXT_PUBLIC_SITE_ORIGIN` visitor access URL contract and `public/Visitor_frame.pdf` asset.
- Adds the minimal browser-side PDF and QR generation dependencies already proven by `../qr-pdf-test`; no database or voter API contract changes are required.
