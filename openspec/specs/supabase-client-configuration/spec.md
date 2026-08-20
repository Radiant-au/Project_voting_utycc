# Purpose

Define safe browser-side Supabase client configuration.

## Requirements

### Requirement: Public Supabase client configuration
The application SHALL create a browser Supabase client from `NEXT_PUBLIC_SUPABASE_URL` and its public publishable key only for admin frontend modules that still require direct Supabase Auth, data access, or Realtime; public voter pages and components MUST NOT import or use that client.

#### Scenario: Admin client setup is valid
- **WHEN** both required public environment variables are set
- **THEN** admin client code can import one configured Supabase browser client

#### Scenario: Voter bundle is built
- **WHEN** Next.js compiles public voter pages and components
- **THEN** those bundles contain no browser Supabase client import, direct table call, RPC call, or Realtime channel call

#### Scenario: Admin client setup is invalid
- **WHEN** an admin page requires the browser client but either public environment variable is absent
- **THEN** admin client initialization fails with an actionable configuration error and does not substitute a credential

### Requirement: Credential boundary
The application MUST use `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `VOTER_SESSION_SECRET` only in server voter modules, MUST NOT prefix either secret with `NEXT_PUBLIC_`, and MUST NOT commit or serialize any Supabase or session credential.

#### Scenario: Repository configuration example
- **WHEN** a developer reviews the committed environment example
- **THEN** it contains server and admin variable names with placeholders only and identifies their separate consumers

#### Scenario: Voter API response is inspected
- **WHEN** any success or error response is returned by a voter endpoint
- **THEN** it contains no environment value, database error detail, voting code, or Supabase secret
