# Purpose

Define the same-origin Vercel voter API that protects public voting flows from direct Supabase access.
## Requirements
### Requirement: Server-only voter Supabase boundary
The application SHALL provide a voter-only Supabase client using `SUPABASE_URL` and `SUPABASE_SECRET_KEY` exclusively in server modules, SHALL keep `VOTER_SESSION_SECRET` server-only, and MUST NOT include these values or the voter Supabase client in browser bundles.

#### Scenario: Public voter page loads
- **WHEN** any public voter page is loaded in a browser
- **THEN** the browser communicates with the same Next.js origin and receives no Supabase secret or direct Supabase client configuration

#### Scenario: Administrator opens the dashboard
- **WHEN** an administrator loads an existing admin page
- **THEN** the admin page may continue using its separate public-key Supabase browser client, Auth, and Realtime connection

### Requirement: Public voter API contract
The application SHALL expose `POST /api/voter/verify-code`, `GET /api/voter/session`, `POST /api/voter/logout`, `GET /api/voter/projects`, `GET /api/voter/projects/[id]`, `GET /api/voter/status`, `POST /api/voter/vote`, and `GET /api/voter/receipt` as Next.js Route Handlers, and every protected handler SHALL validate the server-side voter session.

#### Scenario: Protected endpoint has no valid session
- **WHEN** a browser requests a protected voter endpoint without a valid unexpired cookie
- **THEN** the endpoint returns a generic unauthorized response without querying or disclosing protected voter data

#### Scenario: Current voter data is requested
- **WHEN** an authorized voter requests projects, project details, session state, voting status, or a receipt
- **THEN** the handler returns a no-store response containing only the safe fields required by the voter UI

### Requirement: Server-authoritative voting availability
The voter status endpoint SHALL read the current `voting_settings.is_open` value through the server-only Supabase client and return only a boolean availability state, while the atomic vote operation MUST continue rejecting votes whenever voting is closed.

#### Scenario: Authorized voter requests open status
- **WHEN** an authorized voter requests `GET /api/voter/status` while voting is open
- **THEN** the endpoint returns a no-store response with `isOpen: true`

#### Scenario: Authorized voter requests closed status
- **WHEN** an authorized voter requests `GET /api/voter/status` while voting is closed
- **THEN** the endpoint returns a no-store response with `isOpen: false`

#### Scenario: Status lookup fails
- **WHEN** the server cannot read the current voting setting
- **THEN** the endpoint returns a generic service-unavailable response without assuming voting is open or exposing database details

#### Scenario: Voting closes before submission
- **WHEN** a voter submits a project after the database setting changes to closed
- **THEN** the atomic vote operation records no vote, does not consume the voting code, and returns a safe closed-voting failure

### Requirement: Rate-limited generic code verification
The verification handler SHALL normalize input to uppercase, require exactly seven ASCII characters from `A-Z` and `0-9`, apply centralized rate limiting, verify the code from Supabase on the server, accept only enabled unused codes, derive category only from the database, and SHALL NOT mark the code used.

#### Scenario: Valid unused code is submitted
- **WHEN** a voter submits a valid enabled unused code
- **THEN** the server creates a secure voter session with the database-assigned category and returns only safe voter information while leaving the code unused

#### Scenario: Invalid code state is submitted
- **WHEN** a code is malformed, unknown, disabled, or already used
- **THEN** the endpoint returns the same generic invalid-code response and creates no session

#### Scenario: Verification limit is exceeded
- **WHEN** a request fingerprint exceeds the configured verification attempts in its window
- **THEN** the endpoint rejects further attempts with a generic rate-limit response and retry timing without storing a raw IP address or code

### Requirement: Secure voter session cookie
The application SHALL store voter authorization in a signed, short-lived HTTP-only cookie containing no original voting code or client-supplied point value, with `sameSite=lax`, `path=/`, and `secure=true` in production, and SHALL reject tampered, malformed, or expired cookies.

#### Scenario: Browser storage is inspected after verification
- **WHEN** a voter has successfully verified a code
- **THEN** neither localStorage nor sessionStorage contains the original code or the source of voting authorization

#### Scenario: Voter logs out
- **WHEN** the voter posts to `/api/voter/logout`
- **THEN** the server expires the voter cookie and subsequent protected requests are unauthorized

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

### Requirement: Session-authorized atomic voting
The vote handler SHALL accept only `{ "projectId": string }`, apply rate limiting, obtain voting-code ID and category from the verified session/database, and invoke one atomic PostgreSQL operation that verifies the code, enabled and unused state, voting-open state, active project, category, and point value before inserting exactly one vote and marking the code used.

#### Scenario: Authorized vote succeeds
- **WHEN** a valid unused voter session submits an active project while voting is open
- **THEN** PostgreSQL inserts one vote with the database category and weighted points, marks the code used in the same transaction, and returns a safe receipt reference

#### Scenario: Duplicate requests race
- **WHEN** double-clicks, refreshes, tabs, simultaneous requests, or manual API calls submit the same voting-code ID
- **THEN** the unique vote constraint and transaction commit exactly one vote and every other request returns a safe non-success response

#### Scenario: Vote precondition fails
- **WHEN** the code is unusable, voting is closed, the project is missing/inactive, or insertion fails
- **THEN** the transaction commits neither a vote nor a used-code update and the API exposes no database details

### Requirement: Trusted weighted points
The system SHALL derive `student=1`, `teacher=2`, and `visitor=3` points on the server or in PostgreSQL and MUST ignore or reject any browser-supplied category or point value.

#### Scenario: Client adds authorization fields
- **WHEN** a vote request includes a category, voting-code identifier, code, or point value in addition to `projectId`
- **THEN** the handler rejects the invalid request or excludes those fields from the database operation

### Requirement: Safe receipt retrieval
After a successful vote, the application SHALL authorize `GET /api/voter/receipt` from short-lived server-controlled receipt state and return only the project content, category, receipt identifier, and timestamp needed by the success page, without returning project numbers, hidden project codes, vote totals, or awarded points.

#### Scenario: Successful voter opens the receipt
- **WHEN** the browser requests the receipt immediately after a committed vote
- **THEN** the endpoint returns the selected public project, voter category, safe receipt identifier, and timestamp without returning the voting code, project number, hidden project code, vote total, or awarded points

#### Scenario: Arbitrary receipt is requested
- **WHEN** a browser without matching server-controlled receipt state attempts to retrieve a vote
- **THEN** the endpoint returns a generic unauthorized or not-found response without exposing vote-table data

### Requirement: No public voter Realtime or protected-table access
The voter-facing application MUST NOT use Supabase Realtime, direct voting-code reads, complete vote-table reads, or any public voter database grant superseded by the Vercel API.

#### Scenario: Public voter flow is inspected
- **WHEN** manual login, project selection, voting, and receipt display are completed in the browser
- **THEN** the Network panel contains no request to `*.supabase.co` or `wss://*.supabase.co`
