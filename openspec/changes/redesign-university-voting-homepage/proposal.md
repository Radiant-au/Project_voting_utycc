## Why

The main Next.js application must become the complete school exhibition voting product supplied in `design/`, not only a redesigned landing page. The supplied React prototype now defines the voter and administrator flows, but it must be migrated into the production app and refined into a coherent futuristic university technology experience.

## What Changes

- Replace the homepage-only implementation with the complete exhibition voting experience from `design/`.
- Preserve voter onboarding, category selection, project discovery and details, vote confirmation, and success flows.
- Preserve admin overview, voter management, project management and editing, results, and settings flows.
- Port the prototype's mock data and services so every demonstrated interaction remains locally usable.
- Adapt the React/Vite prototype to the existing Next.js application without carrying over preview tooling or unused UI primitives.
- Refine the full interface into a responsive, accessible sci-fi university visual system.

## Capabilities

### New Capabilities
- `school-exhibition-voting-app`: Defines the complete voter and administrator application flow, local demonstration behavior, responsive layout, accessibility, and futuristic university visual presentation.

### Modified Capabilities

None.

## Impact

- Replaces the main app page and styling and adds migrated client-side application, mock data, and service modules.
- Adds only the runtime packages directly used by the supplied application.
- Preserves the existing Supabase client foundation but does not replace mock services with live authentication, database, or vote persistence.
