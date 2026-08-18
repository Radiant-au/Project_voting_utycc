## MODIFIED Requirements

### Requirement: Voter journey
The application SHALL provide a connected voter journey for students and teachers using manual seven-character code entry and for visitors using automatic `/access?code=...` entry, with every category continuing through the same project discovery, project details, vote confirmation, and success views using only same-origin voter API requests.

#### Scenario: Student or teacher completes the voting flow
- **WHEN** a student or teacher enters an unused assigned code, chooses one project, and confirms the vote
- **THEN** the Next.js server derives the code's category, commits the vote through Supabase, and the preserved success view displays its safe receipt

#### Scenario: Visitor completes the QR voting flow
- **WHEN** a visitor opens a valid visitor pass URL
- **THEN** `/access` sends the code to the verification API, removes it from the visible URL, and redirects the verified visitor to the shared `/projects` page without manual entry

### Requirement: Project discovery
The application SHALL preserve responsive project cards, search, category filtering, sorting, project details, selection state, and already-voted state while loading active public project data only through `GET /api/voter/projects` and `GET /api/voter/projects/[id]`.

#### Scenario: Voter filters projects
- **WHEN** an authorized voter enters a query or selects a project category
- **THEN** only matching active projects returned by the same-origin API are displayed and filters can be cleared

#### Scenario: Voter opens projects without authorization
- **WHEN** a browser opens a protected project route without a valid voter session
- **THEN** the application does not prerender or display protected database-dependent state and returns the voter to code entry

### Requirement: Demonstration data boundary
The application SHALL persist voting-code verification and voting through the Vercel voter API and Supabase while keeping unrelated prototype capabilities clearly identified as local demonstration data until separately migrated.

#### Scenario: Real vote completes
- **WHEN** a verified voter confirms a project choice
- **THEN** the vote and used-code state are persisted atomically in Supabase and are not represented as browser-only state or a frontend counter increment

#### Scenario: Unmigrated administration action completes
- **WHEN** an administrator uses a prototype feature outside the connected Supabase capabilities
- **THEN** the UI does not present that action as Supabase-persisted unless its own backend integration exists

