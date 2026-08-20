## MODIFIED Requirements

### Requirement: Administration flow
The application SHALL provide navigable admin overview, code management, project management, results, and settings views that match the current Supabase-backed voting setup, and SHALL remove, disable, or clearly mark unsupported mock-only administration actions.

#### Scenario: Administrator reviews the current setup
- **WHEN** an authenticated administrator navigates among admin sections
- **THEN** each visible admin route renders data, controls, responsive navigation, and feedback states that correspond to connected voting, code, project, result, or settings behavior

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
