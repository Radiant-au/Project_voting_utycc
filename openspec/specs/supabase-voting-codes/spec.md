# Purpose

Define the Supabase voting-code and vote persistence contract used by the server-side voter flow and admin code management.

## Requirements

### Requirement: Fixed secure voting codes
The system SHALL generate cryptographically random, unique, seven-character codes using only uppercase `A-Z` and digits `0-9`, and SHALL assign each code exactly one immutable category of `student`, `teacher`, or `visitor` with an initial `unused` status.

#### Scenario: Administrator generates category codes
- **WHEN** an authorized administrator requests a valid quantity of teacher codes
- **THEN** Supabase creates that quantity of unique valid codes assigned to `teacher` and returns the created codes

#### Scenario: User attempts to choose a category
- **WHEN** a voter accesses the code login flow
- **THEN** the application provides no category selector and uses only the category returned for the verified code

### Requirement: Safe code verification
The system SHALL normalize typed letters to uppercase, validate the seven-character format, verify codes through a narrow server-side Supabase function, and SHALL NOT mark a code used during verification.

#### Scenario: Unused code is verified
- **WHEN** a voter submits a valid unused code
- **THEN** the system returns its assigned category, opens the shared projects flow, and leaves the code status `unused`

#### Scenario: Invalid code is rejected
- **WHEN** a submitted code does not exist or has an invalid format
- **THEN** the application displays a clear invalid-code error without exposing other voting codes

#### Scenario: Used code is rejected
- **WHEN** a submitted code already has status `used`
- **THEN** the application displays a clear already-used error and does not open a voting session

#### Scenario: Disabled code is rejected
- **WHEN** a submitted code has status `disabled`
- **THEN** the application displays a clear disabled-code error and does not open a voting session

#### Scenario: Verification request fails
- **WHEN** Supabase cannot be reached during verification
- **THEN** the application displays a network error and allows the voter to retry without changing code state

### Requirement: Atomic single-use vote submission
The system SHALL submit a vote and change its voting code from `unused` to `used` with `used_at` in one database transaction, copy the database-assigned category into the vote, and enforce one vote per voting code with a unique database constraint.

#### Scenario: Vote succeeds
- **WHEN** a verified unused code submits one valid project selection
- **THEN** Supabase inserts one vote, records the code's category, marks the code used, and the application opens `/vote/success`

#### Scenario: Concurrent duplicate submissions occur
- **WHEN** the same code is submitted from double-clicks, refreshed pages, multiple tabs, or direct API calls
- **THEN** exactly one vote is committed and every later or concurrent attempt receives an already-used result

#### Scenario: Vote insert fails
- **WHEN** the vote cannot be inserted
- **THEN** the transaction rolls back and the code remains `unused`

### Requirement: Visitor QR access
The system SHALL generate one QR pass per visitor code whose QR contains the same site's absolute `/access?code=<CODE>` URL and whose printed content includes the exhibition title, visitor label, backup code, and single-use warning.

#### Scenario: Visitor scans an unused pass
- **WHEN** `/access` receives an unused code assigned to `visitor`
- **THEN** the application verifies it automatically, stores the visitor voting session, skips the manual form, and redirects to `/projects`

#### Scenario: Non-visitor code is placed in an access URL
- **WHEN** `/access` receives a valid student or teacher code
- **THEN** the application rejects automatic visitor access and does not change the code

#### Scenario: Visitor uses backup code
- **WHEN** QR scanning is unavailable
- **THEN** the visitor can enter the printed seven-character backup code in the homepage's shared manual form

### Requirement: Protected voting data
The system SHALL enable Row Level Security on voting codes and votes, deny public direct table access, and expose public voters only to server-mediated code verification and atomic vote submission.

#### Scenario: Public client attempts code enumeration
- **WHEN** an anonymous client selects from `voting_codes` or `votes`
- **THEN** Row Level Security returns no protected rows

#### Scenario: Public client calls an admin operation
- **WHEN** an unauthenticated or non-admin client requests generation, listing, or disabling
- **THEN** Supabase denies the operation without returning voting-code data

### Requirement: Administrator code management
The system SHALL allow an authenticated administrator to generate a bounded quantity of codes by category, list codes and categories, filter by category and status, inspect unused and used state, disable an unused code, and print visitor QR passes.

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
