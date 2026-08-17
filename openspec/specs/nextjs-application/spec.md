# Purpose

Define the project's minimal Next.js application foundation.

## Requirements

### Requirement: TypeScript Next.js application
The project SHALL provide a runnable Next.js App Router application written in TypeScript with a production build command.

#### Scenario: Local application startup
- **WHEN** a developer installs dependencies and runs the documented development command
- **THEN** Next.js serves the application home page without requiring custom server setup

#### Scenario: Production build
- **WHEN** a developer runs the documented build command
- **THEN** the TypeScript application compiles successfully or reports actionable build errors

### Requirement: Initial home page
The application SHALL render a home page that identifies the project and reports whether required public Supabase configuration is available without rendering secret values.

#### Scenario: Configuration present
- **WHEN** required public Supabase environment variables are configured
- **THEN** the home page reports that Supabase is configured

#### Scenario: Configuration absent
- **WHEN** required public Supabase environment variables are missing
- **THEN** the home page reports that configuration is required and does not display any environment-variable values
