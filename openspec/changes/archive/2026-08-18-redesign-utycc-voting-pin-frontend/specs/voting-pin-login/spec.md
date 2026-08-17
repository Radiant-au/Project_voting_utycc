## ADDED Requirements

### Requirement: Category-bound demo PIN verification
The frontend SHALL expose an isolated mock `verifyVotingPin(pin: string)` service for the seven-character demo codes `STU2601`, `TCH2602`, and `VST2603`, mapping them to Student, Teacher, and Visitor categories without requiring backend or authentication services.

#### Scenario: Valid demo PIN
- **WHEN** a user submits one of the three valid seven-character demo codes
- **THEN** the service returns a session containing only `pinId`, `category`, and `hasVoted`, and the UI routes the user to `/projects` after the verifying state

#### Scenario: Invalid PIN
- **WHEN** a user submits a seven-character value that is not a valid demo code
- **THEN** the UI stays on the login page and announces `This voting code is invalid. Please check all seven characters and try again.`

#### Scenario: Used PIN preview
- **WHEN** the mock service marks a demo session as already used
- **THEN** the UI announces `This voting code has already been used. Each code can submit only one vote.` and does not enter the voting flow

### Requirement: Minimal mock session
The frontend SHALL store a temporary namespaced mock session containing no raw PIN and SHALL restore only valid session data for the project route.

#### Scenario: Session restoration
- **WHEN** a user opens `/projects` with a valid stored mock session
- **THEN** the project page displays the assigned voter category without allowing it to be changed

#### Scenario: Missing or malformed session
- **WHEN** a user opens `/projects` without a valid mock session
- **THEN** the frontend redirects to the PIN login page

### Requirement: Complete PIN interaction
The login SHALL provide seven touch-friendly input boxes accepting uppercase `A-Z` and `0-9` only, with automatic focus movement, Backspace navigation, complete-code paste, keyboard navigation, Enter submission, visible focus, and a disabled submit button until all seven characters are present.

#### Scenario: PIN entry on mobile
- **WHEN** a user enters code characters at approximately 360px viewport width
- **THEN** all seven boxes fit without horizontal overflow and accept only uppercase letters and digits

#### Scenario: Paste and correction
- **WHEN** a user pastes a seven-character alphanumeric value or presses Backspace between boxes
- **THEN** the characters distribute correctly, normalize to uppercase, and focus moves or clears predictably

### Requirement: Login state feedback
The login SHALL show empty, partial, complete, verifying, invalid, valid, and mock error states with accessible status messaging.

#### Scenario: Verification feedback
- **WHEN** a complete PIN is submitted
- **THEN** the button shows `Verifying code...`, prevents duplicate submission during the simulated delay, and then displays the appropriate result

### Requirement: Demo code disclosure
The login SHALL include a collapsed `View Demo Codes` section labeled `Demo access only — remove before production.` with copy controls for each demo code.

#### Scenario: Demo panel use
- **WHEN** a user opens the demo PIN panel and selects copy
- **THEN** the corresponding PIN is copied or the UI provides an equivalent browser feedback state without exposing demo codes in the primary login focus

### Requirement: Exit voting portal
The frontend SHALL provide an `Exit Voting Portal` action that confirms before clearing the mock session and returning to the PIN login page.

#### Scenario: Confirmed logout
- **WHEN** a user confirms exit from the project page
- **THEN** the mock session is cleared and the user returns to the PIN login page
