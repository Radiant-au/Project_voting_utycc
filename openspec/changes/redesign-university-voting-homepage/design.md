## Context

The supplied `design/` project is a Vite single-page prototype with twelve routes implemented in one React file. It uses Wouter for routing, localStorage plus mock services for interactions, Tailwind CSS for styling, and Lucide/Recharts for icons and charts. The main application is a minimal Next.js App Router project with an existing Supabase browser client.

## Goals / Non-Goals

**Goals:**

- Preserve every supplied voter and admin route and demonstrated interaction in the main app.
- Keep the migration recognizable and behaviorally faithful before visual refinement.
- Use one consistent dark sci-fi university system across public and admin views.
- Retain responsive behavior, focus visibility, semantic controls, and reduced-motion support.

**Non-Goals:**

- Live Google authentication, database persistence, authorization, file upload, or real vote security.
- Migrating unused `design/src/components/ui` primitives or Vite/Replit preview tooling.
- Splitting the one-file prototype into speculative abstractions during the initial migration.

## Decisions

### Port only the source actually used by the application

The application component, mock data, mock services, and types will move into the main source tree. Direct runtime packages used by those files will be installed. The unused generic component library remains outside the application.

### Preserve the supplied client-side router for the prototype migration

Wouter routes will remain inside a client component so all supplied paths and interactions migrate with minimal behavior changes. Next.js will serve the shell through a catch-all App Router route, allowing direct visits to prototype URLs. A future backend integration can convert flows to route-native server components when requirements exist.

### Keep demonstration state explicitly local

Category and vote selections remain browser-local and mock service calls retain their simulated delays. UI copy will avoid implying that mock actions are production-secure or persisted remotely.

### Refine the existing neon foundation rather than redesign every component twice

The supplied dark cyan/magenta theme already matches the requested direction. Refinement will emphasize university identity, restrained glow, grid/scan-line details, dense admin clarity, and consistent focus/touch behavior.

## Risks / Trade-offs

- [Client-side prototype routes are not production authorization boundaries] → Keep admin and voting behavior explicitly demonstrative until real auth and policies are specified.
- [Browser-local state is device-specific] → Preserve it only for prototype parity; Supabase integration is a separate change.
- [Single application file is large] → Keep it intact for faithful migration and extract modules only when subsequent work changes them independently.
- [Third-party packages increase the main bundle] → Install only the four packages directly imported by the migrated app.

## Migration Plan

1. Move the used prototype modules into the main source tree and connect a Next.js catch-all shell.
2. Install direct runtime dependencies and enable Tailwind processing for the migrated stylesheet.
3. Resolve browser/SSR boundaries while preserving route behavior.
4. Refine global visual tokens and university-facing identity.
5. Verify voter and admin routes at desktop and mobile sizes, then run typecheck and production build.
