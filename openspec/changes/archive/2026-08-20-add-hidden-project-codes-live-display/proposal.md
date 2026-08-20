## Why

Voters currently see internal project numbers and weighted voting points, while the admin dashboard lacks a presentation-ready live results screen. Projects need a separate hidden display code so results can be shown publicly without revealing the voter-facing project identity.

## What Changes

- Add a unique hidden project code managed with each project's required category in the admin project form and catalogue.
- Remove project numbers and weighted point values from voter project cards, details, selection, and success views.
- Exclude hidden project codes, project numbers, and vote points from voter API responses.
- Add an admin live-display page designed for a TV or projector that shows the five highest-ranked projects using rank, total points, and hidden project code.
- Keep the live display current as votes arrive and provide clear loading, empty, and connection states.

## Capabilities

### New Capabilities
- `admin-live-results-display`: Authenticated, TV-sized live top-five results presentation using hidden project codes and total points.

### Modified Capabilities
- `admin-project-management`: Require and manage a unique hidden project code alongside each project's category and internal project number.
- `school-exhibition-voting-app`: Hide project numbers and weighted points throughout the voter journey while adding the connected admin live-display destination.
- `voter-server-api`: Remove project numbers and voting points from safe voter responses while preserving server-authoritative weighted voting.

## Impact

- Supabase `projects` data and generated TypeScript database types gain a unique hidden project code.
- Admin project list/form, navigation, and results presentation change.
- Voter project and receipt response shapes become more restrictive, requiring corresponding UI and contract-test updates.
- Existing vote weighting and atomic submission remain unchanged; no new dependency is required.
