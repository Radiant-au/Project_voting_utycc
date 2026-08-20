## MODIFIED Requirements

### Requirement: Safe project delivery
The projects endpoints SHALL return only active project records and the minimum public display fields using bounded pagination or an active-project bound, SHALL omit internal project numbers, hidden project codes, vote totals, and point values, and SHALL prevent a voter device from fetching project images from a Supabase domain.

#### Scenario: Voter lists projects
- **WHEN** a valid session requests `/api/voter/projects`
- **THEN** the response contains only active safe project summaries and no internal project number, hidden project code, vote data, voting code, private project, point value, or admin field

#### Scenario: Voter opens project details
- **WHEN** a valid session requests `/api/voter/projects/[id]`
- **THEN** the response contains the active project's public content without its internal project number, hidden project code, vote total, or point value

#### Scenario: Project image is stored on Supabase
- **WHEN** a returned project uses a Supabase-hosted image
- **THEN** its voter-facing URL resolves through Next.js/Vercel or an accessible non-Supabase host so the browser makes no Supabase request

### Requirement: Safe receipt retrieval
After a successful vote, the application SHALL authorize `GET /api/voter/receipt` from short-lived server-controlled receipt state and return only the project content, category, receipt identifier, and timestamp needed by the success page, without returning project numbers, hidden project codes, vote totals, or awarded points.

#### Scenario: Successful voter opens the receipt
- **WHEN** the browser requests the receipt immediately after a committed vote
- **THEN** the endpoint returns the selected public project, voter category, safe receipt identifier, and timestamp without returning the voting code, project number, hidden project code, vote total, or awarded points

#### Scenario: Arbitrary receipt is requested
- **WHEN** a browser without matching server-controlled receipt state attempts to retrieve a vote
- **THEN** the endpoint returns a generic unauthorized or not-found response without exposing vote-table data
