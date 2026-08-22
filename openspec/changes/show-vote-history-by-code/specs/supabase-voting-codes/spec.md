## MODIFIED Requirements

### Requirement: Safe code verification
The system SHALL normalize typed letters to uppercase, validate the seven-character format, verify codes through a narrow server-side Supabase function, and SHALL NOT change code state during verification. An unused code SHALL open a voting session, while a used code SHALL open only a restricted session for viewing the vote already linked to that code.

#### Scenario: Unused code is verified
- **WHEN** a voter submits a valid unused code
- **THEN** the system returns its assigned category, opens the shared projects flow, and leaves the code status `unused`

#### Scenario: Used code is verified
- **WHEN** a voter submits a valid used code with a recorded vote
- **THEN** the system returns its assigned category and used state, leaves the code status unchanged, and permits access only to that code's voted-project view

#### Scenario: Invalid code is rejected
- **WHEN** a submitted code does not exist or has an invalid format
- **THEN** the application displays a clear invalid-code error without exposing other voting codes

#### Scenario: Disabled code is rejected
- **WHEN** a submitted code has status `disabled`
- **THEN** the application displays a clear invalid-code error and does not open a session

#### Scenario: Verification request fails
- **WHEN** Supabase cannot be reached during verification
- **THEN** the application displays a network error and allows the voter to retry without changing code state

### Requirement: Administrator code management
The system SHALL allow an authenticated administrator to generate a bounded quantity of codes by category, list codes and categories, filter by category and status, inspect unused and used state, view the selected project and recorded time for used codes, disable an unused code, and print visitor QR passes.

#### Scenario: Administrator filters codes
- **WHEN** an administrator selects a category or status filter
- **THEN** `/admin/codes` displays only matching authorized results

#### Scenario: Administrator follows vote history
- **WHEN** an administrator opens the vote-history page or searches for a used code
- **THEN** the authorized result identifies the single linked vote and selected project without changing either record

#### Scenario: Administrator disables an unused code
- **WHEN** an administrator confirms disabling an `unused` code
- **THEN** Supabase changes its status to `disabled` and the code can no longer verify or vote

#### Scenario: Administrator tries to disable a used code
- **WHEN** an administrator requests disabling a `used` code
- **THEN** Supabase rejects the state change and preserves the vote history

#### Scenario: Administrator prints visitor passes
- **WHEN** an administrator selects generated visitor codes and prints passes
- **THEN** each printed pass shows `UTYCC Project Exhibition`, its unique QR, `Visitor Voting Pass`, `Backup Code: <CODE>`, and `Single Use Only`

