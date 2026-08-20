## MODIFIED Requirements

### Requirement: Public voter API contract
The application SHALL expose `POST /api/voter/verify-code`, `GET /api/voter/session`, `POST /api/voter/logout`, `GET /api/voter/projects`, `GET /api/voter/projects/[id]`, `GET /api/voter/status`, `POST /api/voter/vote`, and `GET /api/voter/receipt` as Next.js Route Handlers, and every protected handler SHALL validate the server-side voter session.

#### Scenario: Protected endpoint has no valid session
- **WHEN** a browser requests a protected voter endpoint without a valid unexpired cookie
- **THEN** the endpoint returns a generic unauthorized response without querying or disclosing protected voter data

#### Scenario: Current voter data is requested
- **WHEN** an authorized voter requests projects, project details, session state, voting status, or a receipt
- **THEN** the handler returns a no-store response containing only the safe fields required by the voter UI

## ADDED Requirements

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
