## Why

The current voter entry flow asks users to authenticate with Google and manually select a category, which does not match the exhibition's event-issued voting process. A single category-bound PIN flow will make the frontend easier to use, safer to demonstrate, and closer to the intended UTYCC experience without introducing backend behavior.

## What Changes

- **BREAKING** Remove the Google OAuth entry point and manual category-selection screen from the voter flow.
- Add a UTYCC-branded, mobile-first glassmorphism login page with a 7-character segmented code input accepting uppercase `A-Z` and `0-9` only.
- Validate the three frontend demo PINs through an isolated mock service, assign the category automatically, and redirect valid sessions to `/projects`.
- Store only minimal mock session data locally; support invalid, verifying, used, closed, not-started, network-error, success, and logout states as frontend demonstrations.
- Add reusable glass branding, navigation, language-switch, category-badge, PIN, logout-dialog, project-card, and vote-bar components.
- Restyle the voter project page and navigation to match the login experience while preserving the existing project selection and voting flow.
- Keep `MY`/`EN` as a visual-only switch with English content and a clear future translation boundary.
- Leave admin screens and all backend, database, API, Supabase, server-action, and real-authentication concerns unchanged.

## Capabilities

### New Capabilities

- `voting-pin-login`: Frontend-only 7-character uppercase alphanumeric code validation, automatic category assignment, minimal mock sessions, and login/logout states.
- `glass-voter-interface`: UTYCC branding, responsive glassmorphism login/project navigation, PIN controls, project cards, and sticky vote bar interactions.

### Modified Capabilities

- `school-exhibition-voting-app`: Replace voter entry/category selection with PIN-based entry and preserve the connected project voting journey with the assigned category.

## Impact

- Affected frontend routes: the voter entry page, `/choose-category` removal from the voter flow, and `/projects`.
- Affected frontend components, styles, mock data/services, and local-storage session handling.
- No API routes, server actions, database tables, Supabase integration, OAuth provider, or new dependency is required.
- Future integration points are explicitly limited to PIN verification, category/used-PIN validation, voting session persistence, logout expiration, and Myanmar/English translations.
