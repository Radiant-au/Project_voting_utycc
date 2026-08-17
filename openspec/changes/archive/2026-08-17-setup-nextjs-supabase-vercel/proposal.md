## Why

This repository has only OpenSpec configuration and cannot yet run or deploy a TypeScript web application. Establish a small, production-ready foundation so the project can use Supabase data and be deployed on Vercel.

## What Changes

- Create a Next.js App Router application using TypeScript.
- Add a minimal Supabase browser client configured through public environment variables.
- Provide a simple home page that reports whether the Supabase configuration is present without exposing secrets.
- Add deployment configuration and documentation for Vercel environment variables and build verification.

## Capabilities

### New Capabilities

- `nextjs-application`: A TypeScript Next.js application with a runnable App Router home page.
- `supabase-client-configuration`: Safe client-side Supabase configuration from public environment variables.
- `vercel-deployment`: Vercel-ready build settings and deployment instructions.

### Modified Capabilities

None.

## Impact

- Adds the initial Node.js project files, Next.js and Supabase dependencies, environment-variable example, and deployment documentation.
- Requires a Supabase project URL and publishable/anon key to enable live data access, plus matching Vercel environment variables for deployment.
