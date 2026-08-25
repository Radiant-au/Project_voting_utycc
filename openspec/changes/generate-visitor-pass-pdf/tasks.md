## 1. PDF generation

- [x] 1.1 Add `pdf-lib`, `qrcode`, and its TypeScript declarations using the existing npm setup.
- [x] 1.2 Implement a browser-compatible visitor-pass PDF generator that loads `public/Visitor_frame.pdf`, uses the calibrated three-slot coordinates, embeds each absolute visitor access QR and centered backup code, and returns one page per group of three codes.

## 2. Administrator workflow

- [x] 2.1 Replace the current browser-print visitor-pass action in `/admin/codes` with a busy-aware PDF download action for selected visitor codes, preserving the site-origin guard and reporting generation failures.
- [x] 2.2 Remove the superseded hidden visitor-pass markup, `qrcode.react` usage from the codes page, and print-only pass styles without changing code generation, filtering, selection, or disable behavior.
- [x] 2.3 Add one action that selects every visitor code in the loaded authorized list and clears those selections when all are selected.

## 3. Verification

- [x] 3.1 Add one focused runnable check that generates PDFs for one and four codes from the real frame and verifies one-page and two-page output respectively.
- [x] 3.2 Run the focused check, TypeScript typecheck, production build, OpenSpec change validation, and `git diff --check`.
- [x] 3.3 Download a four-code PDF from the admin page and visually verify the first page has three aligned QR/code pairs, the second has only the first pair, and a generated QR resolves to its matching `/access?code=<CODE>` URL.
