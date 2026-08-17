## MODIFIED Requirements

### Requirement: Voter journey
The application SHALL provide a connected voter journey from a 7-character uppercase alphanumeric category-bound voting code through project discovery, project details, vote confirmation, and success acknowledgement; users SHALL NOT manually select a voter category.

#### Scenario: Visitor completes the demonstration flow
- **WHEN** a visitor enters a valid demo PIN, chooses a project, and confirms the vote
- **THEN** the application assigns the PIN's mock category, records the demonstration choice locally, and displays the success view

#### Scenario: Invalid entry cannot reach voting
- **WHEN** a visitor enters an invalid PIN or has no valid mock session
- **THEN** the application remains on or redirects to the PIN login page and does not reveal or permit category selection

### Requirement: Demonstration data boundary
The application SHALL clearly operate on local mock services and browser state without presenting those actions as live authenticated, server-persisted, or secure PIN operations.

#### Scenario: Demonstration action completes
- **WHEN** a project, setting, category, or vote action is performed
- **THEN** the UI provides feedback while remaining safe to use without live backend credentials and labels mock-only behavior where relevant

#### Scenario: Future integration boundary
- **WHEN** a production implementation replaces the mock PIN or voting behavior
- **THEN** the named frontend service/session boundaries can be connected to real verification, category assignment, used-PIN validation, voting persistence, logout expiration, and translations without changing the voter journey contract

### Requirement: Responsive and accessible interaction
The application SHALL support mobile and desktop layouts, visible focus, keyboard-operable controls, sufficient contrast, usable touch targets, reduced-motion preferences, and PIN entry without horizontal overflow.

#### Scenario: Application is used on a narrow viewport
- **WHEN** a voter route is opened on a mobile-width screen around 360px
- **THEN** navigation, seven voting-code boxes, project content, and sticky voting controls reflow without inaccessible controls or horizontal page overflow
