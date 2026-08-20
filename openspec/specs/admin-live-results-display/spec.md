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
Each live-display card SHALL show rank, hidden project code, category, and total points without showing the internal project number or project title.

#### Scenario: Ranked project is rendered
- **WHEN** a project appears in the top five
- **THEN** viewers can identify it only by hidden project code and category while its internal number and title remain absent

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

