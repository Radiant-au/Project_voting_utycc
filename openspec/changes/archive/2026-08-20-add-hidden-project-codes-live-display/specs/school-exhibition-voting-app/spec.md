## MODIFIED Requirements

### Requirement: Voter journey
The application SHALL provide a connected voter journey for students and teachers using manual seven-character code entry and for visitors using automatic `/access?code=...` entry, with every category continuing through the same project discovery, project details, vote confirmation, and success views using only same-origin voter API requests and without displaying project numbers, hidden project codes, or weighted voting points.

#### Scenario: Student or teacher completes the voting flow
- **WHEN** a student or teacher enters an unused assigned code, chooses one project, and confirms the vote
- **THEN** the Next.js server derives the code's category, commits the weighted vote through Supabase, and the success view confirms the selected project without displaying its project number, hidden code, or awarded points

#### Scenario: Visitor completes the QR voting flow
- **WHEN** a visitor opens a valid visitor pass URL
- **THEN** `/access` sends the code to the verification API, removes it from the visible URL, and redirects the verified visitor to the shared `/projects` page without manual entry or any visible point value

### Requirement: Project discovery
The application SHALL preserve responsive project cards, search, category filtering, sorting, project details, selection state, and already-voted state while loading active public project data only through `GET /api/voter/projects` and `GET /api/voter/projects/[id]`, and SHALL identify projects to voters by their public content rather than internal project number or hidden project code.

#### Scenario: Voter browses projects
- **WHEN** an authorized voter views project cards, details, or vote confirmation
- **THEN** titles, teams, categories, descriptions, features, and images may be shown while internal project numbers, hidden project codes, vote totals, and weighted point values remain absent

#### Scenario: Voter filters projects
- **WHEN** an authorized voter enters a query or selects a project category
- **THEN** only matching active projects returned by the same-origin API are displayed and filters can be cleared

#### Scenario: Voter opens projects without authorization
- **WHEN** a browser opens a protected project route without a valid voter session
- **THEN** the application does not prerender or display protected database-dependent state and returns the voter to code entry

### Requirement: Administration flow
The application SHALL provide navigable admin overview, code management, project management, results, settings, and full-screen live-display views that match the current Supabase-backed voting setup, and SHALL remove, disable, or clearly mark unsupported mock-only administration actions.

#### Scenario: Administrator reviews the current setup
- **WHEN** an authenticated administrator navigates among admin sections
- **THEN** each visible admin route renders data, controls, responsive navigation, and feedback states that correspond to connected voting, code, project, result, settings, or live-display behavior

#### Scenario: Unsupported admin action is encountered
- **WHEN** a prototype-only admin action has not been connected to the current setup
- **THEN** the UI removes it, disables it, or labels it as not connected without presenting it as Supabase-persisted
