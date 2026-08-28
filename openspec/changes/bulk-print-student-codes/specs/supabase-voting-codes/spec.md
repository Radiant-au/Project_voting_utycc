## MODIFIED Requirements

### Requirement: Administrator code management
The system SHALL allow an authenticated administrator to generate a bounded quantity of codes by category, list codes and categories, filter by category and status, inspect unused and used state, disable an unused code, print visitor QR passes, select loaded student codes, and print selected student code records in a spreadsheet-style A4 landscape sheet.

#### Scenario: Administrator filters codes
- **WHEN** an administrator selects a category or status filter
- **THEN** `/admin/codes` displays only matching authorized results

#### Scenario: Administrator disables an unused code
- **WHEN** an administrator confirms disabling an `unused` code
- **THEN** Supabase changes its status to `disabled` and the code can no longer verify or vote

#### Scenario: Administrator tries to disable a used code
- **WHEN** an administrator requests disabling a `used` code
- **THEN** Supabase rejects the state change and preserves the vote history

#### Scenario: Administrator prints visitor passes
- **WHEN** an administrator selects generated visitor codes and prints passes
- **THEN** each printed pass shows `UTYCC Project Exhibition`, its unique QR, `Visitor Voting Pass`, `Backup Code: <CODE>`, and `Single Use Only`

#### Scenario: Administrator prints selected student codes
- **WHEN** an administrator selects loaded student codes and chooses the student print action
- **THEN** the browser print flow displays only those student records in an A4 landscape spreadsheet-style table
