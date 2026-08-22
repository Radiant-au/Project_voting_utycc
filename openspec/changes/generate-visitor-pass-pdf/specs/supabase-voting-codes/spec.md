## MODIFIED Requirements

### Requirement: Visitor QR access
The system SHALL generate one downloadable PDF pass per selected visitor code using the approved `Visitor_frame.pdf` artwork, whose QR contains the same site's absolute `/access?code=<CODE>` URL and whose printed content includes the matching seven-character backup code.

#### Scenario: Visitor scans an unused pass
- **WHEN** `/access` receives an unused code assigned to `visitor`
- **THEN** the application verifies it automatically, stores the visitor voting session, skips the manual form, and redirects to `/projects`

#### Scenario: Non-visitor code is placed in an access URL
- **WHEN** `/access` receives a valid student or teacher code
- **THEN** the application rejects automatic visitor access and does not change the code

#### Scenario: Visitor uses backup code
- **WHEN** QR scanning is unavailable
- **THEN** the visitor can enter the printed seven-character backup code in the homepage's shared manual form

#### Scenario: Visitor pass PDF uses the approved layout
- **WHEN** an administrator generates visitor passes
- **THEN** every QR and backup code is drawn in its calibrated slot on an unchanged copy of the approved landscape A4 frame

### Requirement: Administrator code management
The system SHALL allow an authenticated administrator to generate a bounded quantity of codes by category, list codes and categories, filter by category and status, inspect unused and used state, disable an unused code, select visitor codes, and download their QR passes as one PDF with up to three passes per page.

#### Scenario: Administrator filters codes
- **WHEN** an administrator selects a category or status filter
- **THEN** `/admin/codes` displays only matching authorized results

#### Scenario: Administrator disables an unused code
- **WHEN** an administrator confirms disabling an `unused` code
- **THEN** Supabase changes its status to `disabled` and the code can no longer verify or vote

#### Scenario: Administrator tries to disable a used code
- **WHEN** an administrator requests disabling a `used` code
- **THEN** Supabase rejects the state change and preserves the vote history

#### Scenario: Administrator downloads selected visitor passes
- **WHEN** an administrator selects visitor codes and activates the PDF action with a configured site origin
- **THEN** the browser downloads one PDF containing each selected code exactly once with its unique QR and matching backup code

#### Scenario: Administrator selects all visitor codes
- **WHEN** an administrator activates the select-all visitor action while visitor codes are shown in the authorized code list
- **THEN** every shown visitor code is selected for the combined PDF without selecting any student or teacher code, and the same action can clear those visitor selections

#### Scenario: Four visitor passes are selected
- **WHEN** an administrator generates a PDF for four selected visitor codes
- **THEN** the PDF contains two template pages, with three populated slots on the first page and only the first populated slot on the second page

#### Scenario: Visitor PDF cannot be generated
- **WHEN** no visitor code is selected, the site origin is unavailable, the template cannot be loaded, or PDF generation fails
- **THEN** the application prevents or fails the download with actionable administrator feedback and does not change any voting-code state
