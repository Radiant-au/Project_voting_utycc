## 1. Database and Types

- [x] 1.1 Add a Supabase migration that backfills a required unique hidden project code for existing projects and validates future project codes.
- [x] 1.2 Add an authenticated aggregate database function or view that returns only the active top five with rank inputs, hidden code, category, and total points using deterministic tie ordering.
- [x] 1.3 Update generated database types and add the smallest database-level checks for hidden-code uniqueness and bounded ranking output.

## 2. Admin Project Management

- [x] 2.1 Update the connected admin project list, search, and project form to display and persist hidden project code and required category while retaining internal project number for admins.
- [x] 2.2 Surface required-field and duplicate hidden-code errors without changing existing image upload, publish, edit, or archive behavior.

## 3. Voter Privacy

- [x] 3.1 Remove internal project number and hidden project code from voter project list/detail serializers and shared client types.
- [x] 3.2 Remove awarded points from the voter receipt serializer and client receipt type while leaving server-side weighted vote storage unchanged.
- [x] 3.3 Remove project-number and point-value presentation from voter project cards, details, confirmation, session messaging, and success receipt.
- [x] 3.4 Update the voter contract check to fail if project numbers, hidden codes, vote totals, or awarded points appear in voter API responses.

## 4. Live TV Display

- [x] 4.1 Read the installed Next.js route and client-component guidance, then add the thin authenticated `/admin/live-display` route and feature-local page implementation.
- [x] 4.2 Load the connected aggregate top five and refetch it after vote Realtime events, preserving the last valid ranking through loading or disconnection states.
- [x] 4.3 Build the full-screen academic-tech card layout showing only rank, hidden project code, category, and total points with deterministic empty, error, and reduced-motion states.
- [x] 4.4 Add the live-display destination to connected admin navigation without exposing it through the voter UI.

## 5. Verification

- [x] 5.1 Run voter contract tests, typecheck, build, and OpenSpec change validation.
- [x] 5.2 Verify admin authentication, project create/edit uniqueness, live vote refresh, stable ties, no-vote state, TV landscape layout, narrow fallback layout, and reduced-motion behavior.
- [x] 5.3 Inspect voter Network responses and rendered pages to confirm no internal project number, hidden project code, vote total, or point value is disclosed.
