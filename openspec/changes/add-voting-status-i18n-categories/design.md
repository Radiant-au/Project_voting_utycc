## Context

Supabase already stores one `voting_settings.is_open` value and the atomic `submit_voter_vote` function rejects closed voting. The admin settings page can edit that row, and the voter project page has a status request and focus listener, but the closed/unknown UI contract is incomplete. The shared voter language switcher currently changes only its own selected styling. Project categories are free-form database text exposed through a five-major UI list.

The voter browser must continue using only same-origin `/api/voter/*` requests. Admin pages retain their authenticated Supabase client boundary. The change spans Supabase data constraints, Route Handlers, shared voter state, and multiple voter/admin pages.

## Goals / Non-Goals

**Goals:**

- Keep Supabase as the authority for voting availability and make the admin control reliably persist it.
- Fetch availability on voter project entry and browser focus, and disable all vote-starting actions unless the latest fetch confirms voting is open.
- Provide real English and Unicode Myanmar copy across the complete voter flow with one persistent MM/EN choice.
- Use only `Earth & Environment` and `Design & Technology` as project categories in storage, admin controls, voter cards, and voter filters.

**Non-Goals:**

- Localizing admin pages.
- Adding scheduled opening/closing, multiple elections, or a realtime voter subscription.
- Translating administrator-authored project titles, descriptions, team names, or features.
- Changing voter weighting, session authorization, or the `{ projectId }` vote request contract.

## Decisions

### Keep status server-authoritative and fail closed in voter controls

`GET /api/voter/status` remains an authenticated, no-store same-origin endpoint reading `voting_settings.is_open` through the server-only Supabase client. The project page loads session, projects, and status together and refreshes status on `window.focus`. Until status is confirmed open, project selection and every Vote Now/confirmation action remain disabled. A failed refresh shows a localized unavailable state rather than assuming voting is open.

The PostgreSQL vote function remains the final check. This covers the race where an administrator closes voting after the browser's last successful status fetch. Polling and voter-side Supabase Realtime were rejected because focus refresh plus server enforcement meets the requirement with less client work and preserves the same-origin boundary.

### Persist the admin open/close control explicitly

Changing the voting toggle updates the single `voting_settings` row through the existing authenticated admin Supabase client and surfaces saving, saved, and error feedback. If persistence fails, the control returns to the last confirmed value. This avoids a control that appears active only in local component state.

### Use one lightweight voter locale provider

A feature-local locale provider owns `en | my`, initializes from browser storage after hydration, and exposes a small typed message catalogue and setter to all voter pages/components. The visible switch labels remain `EN` and `MM`; internal locale identifiers use `en` and `my`. The preference is presentation-only and may use local storage because it carries no authorization data.

Static project content remains as authored. Only application chrome, instructions, statuses, actions, validation/error copy, category labels, and receipt/session labels are translated. A package such as `next-intl` was rejected because the current unprefixed voter routes and two static locales do not need a routing framework.

### Centralize two canonical project categories

A shared typed constant defines `Earth & Environment` and `Design & Technology`. Admin selects, voter filters, badges, and validation reuse that constant. A migration changes unsupported existing categories to `Design & Technology`, then adds a database check constraint for the two values. This deterministic fallback keeps every current row valid; administrators can reassign relevant projects to `Earth & Environment` afterward.

## Risks / Trade-offs

- [A status request fails while voting is actually open] → Disable voting and show a retryable localized status message; browsing remains available.
- [Voting closes after a successful focus refresh] → Keep the atomic database closed check and translate the returned closed-voting error.
- [Stored locale is unavailable or malformed] → Fall back to English and accept only `en` or `my`.
- [Existing projects are categorized imperfectly by the fallback migration] → Preserve all rows under `Design & Technology` and make reassignment available in admin edit forms.
- [Missing translation keys cause mixed-language UI] → Use a typed catalogue with English and Myanmar key parity checked by one small test.

## Migration Plan

1. Add the category normalization and check-constraint migration.
2. Deploy shared category definitions, admin category controls, and database types.
3. Deploy the voter locale provider/catalogues and status-aware controls.
4. Apply the Supabase migration before relying on the constrained admin form in production.
5. Verify admin open/close persistence and the voter focus-refresh flow against the live project.

Rollback removes the category check constraint before restoring broader category inputs. The status and localization UI can be rolled back independently without changing the existing atomic vote protection.
