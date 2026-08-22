# Purpose

Define the university voting prototype's voter and administration experience.
## Requirements
### Requirement: Voter journey
The application SHALL provide a connected voter journey for students and teachers using manual seven-character code entry and for visitors using automatic `/access?code=...` entry, with every voter category continuing through the same localized project discovery, project details, vote confirmation, and success views using only same-origin voter API requests and without displaying project numbers, hidden project codes, or weighted voting points.

#### Scenario: Student or teacher completes the voting flow
- **WHEN** a student or teacher enters an unused assigned code, chooses one project while voting is open, and confirms the vote
- **THEN** the Next.js server derives the code's voter category, commits the weighted vote through Supabase, and the localized success view confirms the selected project without displaying its project number, hidden code, or awarded points

#### Scenario: Visitor completes the QR voting flow
- **WHEN** a visitor opens a valid visitor pass URL
- **THEN** `/access` sends the code to the verification API, removes it from the visible URL, and redirects the verified visitor to the localized shared `/projects` page without manual entry or any visible point value

#### Scenario: Voting availability changes while browsing
- **WHEN** the voter project page first loads or the browser regains focus
- **THEN** the page fetches current voting availability through the same-origin voter status API before enabling vote actions

#### Scenario: Voting is closed or unavailable
- **WHEN** the latest voting-status request reports closed or cannot confirm the current state
- **THEN** project browsing remains available but project selection, Vote Now, and vote confirmation are disabled with a localized status explanation

### Requirement: Project discovery
The application SHALL preserve responsive project cards, search, category filtering, sorting, project details, selection state, and already-voted state while loading active public project data only through `GET /api/voter/projects` and `GET /api/voter/projects/[id]`, SHALL identify projects to voters by their public content rather than internal project number or hidden project code, and SHALL expose only `Earth & Environment` and `Design & Technology` as project category filters.

#### Scenario: Voter browses projects
- **WHEN** an authorized voter views project cards, details, or vote confirmation
- **THEN** titles, teams, canonical categories, descriptions, features, and images may be shown while internal project numbers, hidden project codes, vote totals, and weighted point values remain absent

#### Scenario: Voter filters projects
- **WHEN** an authorized voter selects `Earth & Environment` or `Design & Technology`
- **THEN** only matching active projects returned by the same-origin API are displayed and the filter can be cleared to show all projects

#### Scenario: Voter opens projects without authorization
- **WHEN** a browser opens a protected project route without a valid voter session
- **THEN** the application does not prerender or display protected database-dependent state and returns the voter to code entry

### Requirement: Administration flow
The application SHALL provide navigable admin overview, code management, project management, results, settings, and full-screen live-display views that match the current Supabase-backed voting setup, SHALL provide a persisted voting open/close control, and SHALL remove, disable, or clearly mark unsupported mock-only administration actions.

#### Scenario: Administrator reviews the current setup
- **WHEN** an authenticated administrator navigates among admin sections
- **THEN** each visible admin route renders data, controls, responsive navigation, and feedback states that correspond to connected voting, code, project, result, settings, or live-display behavior

#### Scenario: Administrator changes voting availability
- **WHEN** an authenticated administrator changes the voting open/close control
- **THEN** the application persists the setting to Supabase and shows saving, success, or failure feedback that reflects the confirmed database state

#### Scenario: Unsupported admin action is encountered
- **WHEN** a prototype-only admin action has not been connected to the current setup
- **THEN** the UI removes it, disables it, or labels it as not connected without presenting it as Supabase-persisted

### Requirement: Demonstration data boundary
The application SHALL persist voting-code verification, voting, and migrated admin project management through the current Supabase/Vercel setup while keeping unrelated prototype capabilities clearly identified as local demonstration data until separately migrated.

#### Scenario: Real vote completes
- **WHEN** a verified voter confirms a project choice
- **THEN** the vote and used-code state are persisted atomically in Supabase and are not represented as browser-only state or a frontend counter increment

#### Scenario: Admin project action completes
- **WHEN** an authenticated administrator creates, edits, archives, or uploads a photo for a project
- **THEN** the project data or image URL is persisted through the connected Supabase/Cloudinary setup and is not represented as a local demo action

#### Scenario: Unmigrated administration action completes
- **WHEN** an administrator uses a prototype feature outside the connected Supabase capabilities
- **THEN** the UI does not present that action as Supabase-persisted unless its own backend integration exists

### Requirement: Futuristic university presentation
The application SHALL apply a coherent dark academic sci-fi visual system across voter and admin views using restrained neon accents, clear hierarchy, and consistent controls.

#### Scenario: Visitor moves between public and admin pages
- **WHEN** different application routes are rendered
- **THEN** they share recognizable identity, visual tokens, and interaction treatment

### Requirement: Responsive and accessible interaction
The application SHALL support mobile and desktop layouts, visible focus, keyboard-operable controls, sufficient contrast, usable touch targets, and reduced-motion preferences.

#### Scenario: Application is used on a narrow viewport
- **WHEN** a voter or admin route is opened on a mobile-width screen
- **THEN** navigation and content reflow without inaccessible controls or horizontal page overflow

### Requirement: Minimal migration footprint
The main app SHALL include only prototype modules and dependencies used by the complete migrated flow.

#### Scenario: Migration dependencies are reviewed
- **WHEN** implementation is complete
- **THEN** Vite preview plugins and unused generic UI component dependencies are absent from the main application dependency list
