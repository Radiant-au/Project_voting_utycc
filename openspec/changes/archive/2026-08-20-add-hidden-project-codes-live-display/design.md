## Context

Projects currently use `project_number` in both connected admin data and voter-facing shapes. Weighted points are server-authoritative, but the voter projects page and receipt reveal their value. The admin overview also contains a small seed-data leaderboard rather than a dedicated connected presentation screen. The existing architecture already permits authenticated admin pages to use the Supabase browser client and Realtime while public voters must use same-origin `/api/voter/*` handlers.

## Goals / Non-Goals

**Goals:**

- Give every project a stable, unique hidden code and required category managed by admins.
- Keep internal project numbers, hidden codes, vote totals, and point values out of voter responses and UI.
- Add an authenticated, connected, full-screen top-five display suitable for a TV or projector.
- Reuse the existing Supabase admin client, vote data, visual system, and dependencies.

**Non-Goals:**

- Changing weighted vote rules or atomic vote submission.
- Making the live display public or adding a separate display authentication system.
- Adding historical charts, manual ranking controls, or more than the top five.
- Renaming or removing the internal `project_number` column.

## Decisions

### Store a separate admin-managed hidden code

Add a required text column with a database uniqueness constraint to `projects`. Existing rows receive unique backfilled values before the column becomes required. The admin form normalizes surrounding whitespace and reports uniqueness errors. This preserves `project_number` for internal administration while giving the display a stable alias. Reusing `project_number` with CSS masking was rejected because the real value would still reach the browser and could not safely identify live-display entries.

### Restrict voter data at the server response boundary

Remove `project_number` from project serializers and remove `points` from the receipt serializer, then remove their UI renderers. `projectId` remains the opaque vote-submission key and category remains available for session context and project filtering. Hiding fields only in React was rejected because they would remain visible in Network responses.

### Keep weighted scoring unchanged

The database continues deriving and storing trusted points for ranking. Only voter disclosure changes. This avoids touching the security-sensitive vote transaction and preserves existing results.

### Use the authenticated admin Supabase boundary for live results

Create a dedicated route beneath `/admin` so the existing admin layout enforces authentication. Load an aggregate top-five ranking from connected Supabase data and subscribe to vote changes using the already-configured admin Realtime client; on a change, refetch the bounded ranking rather than maintaining totals in browser state. This is smaller and less error-prone than adding a second public results API or manually merging vote events.

### Present identity without revealing the project title

The full-screen cards show rank, hidden project code, category, and total points. Omitting title and internal number makes the hidden code meaningful and prevents the presentation from revealing the project's voter-facing identity. The display uses the existing academic-tech tokens with larger typography and reduced-motion support instead of introducing a separate design system.

## Risks / Trade-offs

- [Existing projects lack hidden codes] → Backfill unique values in the migration before enforcing `NOT NULL` and uniqueness.
- [Realtime disconnects] → Keep the last valid ranking, show connection status, and allow reconnection/refetch.
- [Tied totals reorder unexpectedly] → Apply a stable secondary order based on hidden project code.
- [Admin browser aggregation exposes more vote rows than needed] → Prefer an authenticated aggregate database function/view returning only the five display rows.
- [Project titles remain inferable to people who know the code mapping] → Treat hidden codes as presentation aliases, not security secrets, and keep the mapping within authenticated admin views.

## Migration Plan

1. Add and backfill the hidden-code column, enforce uniqueness and required values, and expose a bounded authenticated ranking query.
2. Regenerate database types and update connected admin project management.
3. Narrow voter API response shapes and remove number/point renderers.
4. Add the authenticated live-display route and Realtime refetch behavior.
5. Validate database, voter contract, responsive, reduced-motion, and admin-auth behavior before deployment.

Rollback can remove the new route and admin fields first; the additive hidden-code column and ranking function may remain unused without affecting voting. The voter response restriction can be rolled back independently if required.

## Open Questions

- None. Hidden codes are admin-managed presentation aliases and are not authentication credentials.
