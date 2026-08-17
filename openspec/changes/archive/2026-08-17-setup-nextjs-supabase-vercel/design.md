## Context

The repository is empty apart from OpenSpec configuration. The first implementation must be straightforward to run locally, safe to deploy to Vercel, and ready to use Supabase without committing credentials.

## Goals / Non-Goals

**Goals:**

- Use the standard Next.js App Router with TypeScript.
- Provide one reusable Supabase browser client from public environment variables.
- Make missing configuration visible without leaking key values.
- Deploy with Vercel's native Next.js support.

**Non-Goals:**

- User authentication, database schema, migrations, row-level-security policies, or product features.
- Server-side Supabase access or service-role credentials.
- Custom deployment infrastructure.

## Decisions

- Use `create-next-app` conventions and the App Router. This is the native Vercel path and avoids custom server configuration. A separate Express server is unnecessary.
- Use `@supabase/supabase-js` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the legacy anon key when required by the project). Browser clients only receive a publishable key; service-role keys remain server-only and are not part of this setup.
- Expose a single client module that validates required environment variables when it is imported. This prevents duplicate initialization and turns misconfiguration into an actionable error.
- Keep the initial page static apart from a configuration-status message. A real query needs a defined table and RLS policy, neither of which exists yet.
- Use Vercel's Git or CLI deployment flow with project environment variables, rather than adding a custom CI pipeline. Vercel detects Next.js and runs its standard build automatically.

## Risks / Trade-offs

- [Missing Supabase variables fail the app] → Provide `.env.local.example` and document the exact Vercel variables.
- [A publishable key is exposed in the browser] → Use only Supabase's intended publishable/anon key and require RLS before data features are added.
- [The initial app does not prove database connectivity] → Add a table-specific smoke check only alongside the first database capability.
- [Vercel build behavior differs from local tooling] → Require a local production build before deployment and use the default Next.js build command.

## Migration Plan

1. Add the initial application and example environment file.
2. Set local Supabase values in `.env.local`; do not commit that file.
3. Run the production build locally.
4. Import the repository into Vercel and set the same public variables for each required environment.
5. Deploy. Roll back by promoting Vercel's previous deployment; no data migration is introduced.

## Open Questions

- Which Supabase data capability and schema should be built first? This setup intentionally does not invent one.
