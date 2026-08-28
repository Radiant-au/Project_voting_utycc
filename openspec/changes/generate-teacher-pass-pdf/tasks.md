## 1. Teacher PDF generation

- [x] 1.1 Add a focused teacher-pass PDF generator that loads Teacher_frame.pdf, validates a Letter-portrait first page, and draws selected teacher codes at the calibrated four-slot positions.
- [x] 1.2 Group selected codes into four-pass pages, retaining blank unused slots on the final page and returning downloadable PDF bytes.

## 2. Administrator workflow

- [x] 2.1 Add selected-teacher-code derivation and a teacher PDF download action to the existing administrator codes page.
- [x] 2.2 Fetch the public Teacher_frame.pdf, show a safe generation error on failure, and retain the current visitor PDF flow unchanged.

## 3. Verification

- [x] 3.1 Extend the focused PDF check to assert one, four, and five teacher codes produce the expected page count and preserve each code.
- [x] 3.2 Run the focused PDF check, typecheck, production build, and OpenSpec validation.
