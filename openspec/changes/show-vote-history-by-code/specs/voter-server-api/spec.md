## MODIFIED Requirements

### Requirement: Public voter API contract
The application SHALL expose `POST /api/voter/verify-code`, `GET /api/voter/session`, `POST /api/voter/logout`, `GET /api/voter/projects`, `GET /api/voter/projects/[id]`, `GET /api/voter/status`, `POST /api/voter/vote`, and `GET /api/voter/receipt` as Next.js Route Handlers. Every protected handler SHALL validate server-controlled session state, and used-code sessions SHALL be accepted only by session, logout, and own-receipt retrieval.

#### Scenario: Protected endpoint has no valid session
- **WHEN** a browser requests a protected voter endpoint without a valid unexpired cookie
- **THEN** the endpoint returns a generic unauthorized response without querying or disclosing protected voter data

#### Scenario: Current voter data is requested
- **WHEN** an authorized unused-code voter requests projects, project details, session state, voting status, or a receipt
- **THEN** the handler returns a no-store response containing only the safe fields required by the voter UI

#### Scenario: Used-code session requests voting data
- **WHEN** a used-code session requests projects, project details, voting status, or vote submission
- **THEN** the endpoint rejects the request without permitting a second vote

### Requirement: Rate-limited generic code verification
The verification handler SHALL normalize input to uppercase, require exactly seven ASCII characters from `A-Z` and `0-9`, apply centralized rate limiting, verify the code from Supabase on the server, accept enabled unused and used codes, derive category and used state only from the database, and SHALL NOT change code state.

#### Scenario: Valid unused code is submitted
- **WHEN** a voter submits a valid enabled unused code
- **THEN** the server creates a secure voting session with the database-assigned category and returns only safe voter information while leaving the code unused

#### Scenario: Valid used code is submitted
- **WHEN** a voter submits a valid enabled used code
- **THEN** the server creates a restricted returning-voter session and returns only category and used state so the browser can open that code's receipt

#### Scenario: Invalid code state is submitted
- **WHEN** a code is malformed, unknown, or disabled
- **THEN** the endpoint returns the same generic invalid-code response and creates no session

#### Scenario: Verification limit is exceeded
- **WHEN** a request fingerprint exceeds the configured verification attempts in its window
- **THEN** the endpoint rejects further attempts with a generic rate-limit response and retry timing without storing a raw IP address or code

### Requirement: Safe receipt retrieval
The application SHALL authorize `GET /api/voter/receipt` from either the short-lived post-vote receipt state or a valid used-code session. It SHALL resolve a used-code receipt only by the session's server-held code identifier and return only the project content, category, receipt identifier, and timestamp needed by the success page, without returning voting codes, project numbers, hidden project codes, vote totals, or awarded points.

#### Scenario: Successful voter opens the receipt
- **WHEN** the browser requests the receipt immediately after a committed vote
- **THEN** the endpoint returns the selected public project, voter category, safe receipt identifier, and timestamp without returning the voting code, project number, hidden project code, vote total, or awarded points

#### Scenario: Used-code voter returns
- **WHEN** a valid used-code session requests its receipt
- **THEN** the endpoint finds the vote by the server-held voting-code identifier and returns the same voter-safe receipt shape

#### Scenario: Arbitrary receipt is requested
- **WHEN** a browser without matching server-controlled receipt or used-code state attempts to retrieve a vote
- **THEN** the endpoint returns a generic unauthorized or not-found response without exposing vote-table data

