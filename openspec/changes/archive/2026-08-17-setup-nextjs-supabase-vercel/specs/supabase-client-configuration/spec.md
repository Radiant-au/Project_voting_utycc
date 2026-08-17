## ADDED Requirements

### Requirement: Public Supabase client configuration
The application SHALL create its browser Supabase client from `NEXT_PUBLIC_SUPABASE_URL` and a public Supabase publishable key supplied through environment variables.

#### Scenario: Valid client setup
- **WHEN** both required public environment variables are set
- **THEN** client code can import one configured Supabase browser client

#### Scenario: Invalid client setup
- **WHEN** either required public environment variable is absent
- **THEN** client initialization fails with an actionable configuration error and does not substitute a credential

### Requirement: Credential boundary
The application MUST NOT commit Supabase credentials or expose a Supabase service-role key to browser code.

#### Scenario: Repository configuration example
- **WHEN** a developer reviews the committed environment example
- **THEN** it contains variable names and placeholders only
