# Purpose

Define the standard Vercel deployment contract.

## Requirements

### Requirement: Vercel-compatible deployment
The project SHALL use a standard Next.js production build that Vercel can detect and deploy without a custom server.

#### Scenario: Vercel build
- **WHEN** the repository is deployed through Vercel with required variables configured
- **THEN** Vercel can execute the project's production build and serve the home page

### Requirement: Deployment configuration guidance
The project SHALL document the public Supabase variables required locally and in Vercel, including the instruction not to set a service-role key as a public variable.

#### Scenario: First deployment setup
- **WHEN** a developer follows the deployment documentation
- **THEN** they can add the required public variables to Vercel before deploying
