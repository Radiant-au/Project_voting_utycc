## MODIFIED Requirements

### Requirement: Voter journey
The application SHALL provide one connected voter journey for students, teachers, and visitors from verified voting-code entry through shared project discovery, one-project selection, vote confirmation, and success acknowledgement, without manual category selection.

#### Scenario: Student or teacher completes the voting flow
- **WHEN** a student or teacher enters an unused assigned code, chooses one project, and confirms the vote
- **THEN** the application derives the code's category, commits the vote through Supabase, and displays the success view

#### Scenario: Visitor completes the QR voting flow
- **WHEN** a visitor opens a valid visitor pass URL, chooses one project, and confirms the vote
- **THEN** the application skips manual login, uses the same projects page, commits the vote through Supabase, and displays the success view

### Requirement: Demonstration data boundary
The application SHALL use the connected Supabase project for voting-code verification and vote persistence while keeping unrelated prototype capabilities clearly identified as local demonstration data until separately migrated.

#### Scenario: Real vote completes
- **WHEN** a verified voter confirms a project choice
- **THEN** the vote and used-code state are persisted atomically in Supabase and are not represented as a browser-only demonstration action

#### Scenario: Unmigrated administration action completes
- **WHEN** an administrator uses a prototype feature outside voting-code management
- **THEN** the UI does not present that action as Supabase-persisted unless its own backend integration exists
