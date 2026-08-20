## 1. Canonical Project Categories

- [x] 1.1 Read the installed Next.js client-component guidance and inspect current Supabase project rows before implementation.
- [x] 1.2 Add a Supabase migration that normalizes unsupported project categories to `Design & Technology`, preserves either canonical value, and adds a database check for `Earth & Environment` or `Design & Technology`.
- [x] 1.3 Add one shared typed project-category constant and update database/application types to reject unsupported values.
- [x] 1.4 Replace the admin project form options and voter project filters/labels with the two canonical categories while retaining the voter `All` filter.
- [x] 1.5 Add a focused check covering category constants, migration behavior, admin validation, and voter filtering.

## 2. Connected Voting Open and Close State

- [x] 2.1 Make the admin voting toggle persist the single Supabase setting with saving/success/error feedback and restore the confirmed value on failure.
- [x] 2.2 Verify `GET /api/voter/status` is authenticated, no-store, server-only, and returns only the current boolean state with generic failures.
- [x] 2.3 Fetch session, projects, and voting status during voter project initialization, refresh status on browser focus, and treat loading or failed status as not open.
- [x] 2.4 Disable project selection, Vote Now, and confirmation while status is closed or unknown, clear stale selections/confirmation when it closes, and keep project browsing available.
- [x] 2.5 Preserve the PostgreSQL closed-voting guard and map a race-time closed response to a localized voter message without consuming the voting code.
- [x] 2.6 Add a focused runnable check for open, closed, unknown, focus-refresh, and close-before-submit behavior.

## 3. English and Myanmar Voter Localization

- [x] 3.1 Add a feature-local typed `en`/`my` locale provider and matching English/Unicode Myanmar message catalogues without adding a localization dependency.
- [x] 3.2 Convert the existing `EN`/`MM` switcher from visual-only state to the shared locale preference, persist only that preference, and fall back safely to English.
- [x] 3.3 Localize voter code entry, visitor access, shared navigation/session/logout components, validation, and service states.
- [x] 3.4 Localize project browsing, search/filter controls, category labels, availability banners, already-voted state, project details, selection bar, and confirmation dialog while leaving authored project content unchanged.
- [x] 3.5 Localize the vote success/receipt view and preserve the selected language through every voter navigation and reload.
- [x] 3.6 Add one catalogue-parity check and smoke checks for the complete English and Myanmar voter journeys.

## 4. Verification and Deployment

- [x] 4.1 Run voter contract checks, category/localization checks, typecheck, build, and `openspec validate --changes`.
- [ ] 4.2 Apply the category migration to the approved Supabase project and verify only the two canonical category values remain.
- [ ] 4.3 Verify live admin open/close persistence and voter initial-load/focus refresh in two browser sessions, including a close-after-selection race.
- [ ] 4.4 Verify mobile and desktop voter flows in English and Unicode Myanmar, keyboard-disabled vote controls, language persistence, and no direct voter Supabase network requests.
