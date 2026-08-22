# admin-live-results-display Specification

## Purpose
TBD - created by archiving change add-hidden-project-codes-live-display. Update Purpose after archive.
## Requirements
### Requirement: Authenticated live results display
The system SHALL provide an authenticated admin live-display route that ranks projects by trusted total vote points and shows only the five highest-ranked active projects.

#### Scenario: Administrator opens the live display
- **WHEN** an authenticated administrator opens the live-display route
- **THEN** the page shows up to five active projects ordered by total points descending with deterministic tie ordering

#### Scenario: Vote totals change
- **WHEN** a valid vote is committed while the live display is open
- **THEN** the displayed ranking and totals refresh without requiring a manual page reload

#### Scenario: No votes exist
- **WHEN** no active project has received a vote
- **THEN** the display shows a presentation-ready empty state instead of fabricated ranking data

### Requirement: Presentation-safe project identity
Before results are revealed, each live-display card SHALL show only rank, hidden project code, and total points without showing the project photo, title, team, or internal project number. After an administrator reveals results, each card SHALL additionally show the project photo, title, team, and category while keeping the project code and points visually secondary.

#### Scenario: Ranked project is rendered before reveal
- **WHEN** a project appears in the top five while results are hidden
- **THEN** viewers can identify it only by rank and hidden project code while its photo, title, team, category, and internal number remain absent

#### Scenario: Ranked project is revealed
- **WHEN** an administrator enables the reveal setting
- **THEN** each ranked card shows its photo, title, team, and category with smaller hidden-code and point labels while the internal project number remains absent

### Requirement: Realtime result reveal control
The authenticated settings page SHALL persist a live-results reveal toggle, and the open live display SHALL apply reveal-state changes through its existing Supabase Realtime connection without a page reload.

#### Scenario: Administrator reveals results
- **WHEN** an administrator enables reveal while the live display is connected
- **THEN** the live display shows project details without requiring a manual refresh

#### Scenario: Administrator hides results again
- **WHEN** an administrator disables reveal
- **THEN** the live display removes project photos, titles, teams, and categories while retaining rank, hidden project code, and points

### Requirement: TV-sized academic presentation
The live display SHALL use a responsive full-screen academic-tech layout with legible type, strong contrast, restrained motion, and cards sized for a television or projector.

#### Scenario: Display is shown on a wide screen
- **WHEN** the route is rendered at a television-sized landscape viewport
- **THEN** all five cards, ranks, hidden codes, and point totals remain readable at viewing distance without page scrolling

#### Scenario: Reduced motion is requested
- **WHEN** the operating system requests reduced motion
- **THEN** ranking updates remain understandable without animated movement

### Requirement: Honest live connection states
The live display SHALL communicate initial loading and failed live-update states while retaining the most recently loaded valid ranking.

#### Scenario: Live updates disconnect
- **WHEN** the live results connection fails after a ranking has loaded
- **THEN** the page keeps the last valid values visible and indicates that updates are temporarily disconnected
