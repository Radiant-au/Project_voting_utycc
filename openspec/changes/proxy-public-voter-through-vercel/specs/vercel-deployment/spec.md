## MODIFIED Requirements

### Requirement: Vercel-compatible deployment
The project SHALL use a standard dynamic Next.js production build with Route Handlers deployable as Vercel server functions and MUST NOT configure `output: "export"`.

#### Scenario: Vercel build
- **WHEN** the repository is deployed through Vercel with required public admin and private voter variables configured
- **THEN** Vercel executes the production build, serves the application, and runs `/api/voter/*` handlers at request time

#### Scenario: Protected voter route is requested
- **WHEN** a voter requests database-dependent protected content
- **THEN** the deployment evaluates current cookie/database state rather than serving prerendered protected data

### Requirement: Deployment configuration guidance
The project SHALL document private `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `VOTER_SESSION_SECRET` variables for Vercel server functions separately from any `NEXT_PUBLIC_` Supabase variables retained for the admin frontend.

#### Scenario: First server-backed deployment setup
- **WHEN** a developer follows the deployment documentation
- **THEN** they can configure the three private voter variables without exposing either secret to client bundles

#### Scenario: Production verification without VPN
- **WHEN** manual-code and visitor-QR flows are tested from a voter device without a VPN
- **THEN** login, project loading, vote confirmation, and receipt succeed using only the Vercel origin and no Supabase HTTP or WebSocket request

