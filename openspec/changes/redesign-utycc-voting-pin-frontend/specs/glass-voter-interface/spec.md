## ADDED Requirements

### Requirement: UTYCC glass login presentation
The voter login SHALL prominently present `University of Technology (Yatanarpon Cyber City)`, `UTYCC Project Exhibition`, `Voting Portal`, logo/exhibition/year placeholders, the PIN instruction, privacy message, and a centered responsive glass card over a deep navy-indigo-violet-cyan atmospheric background.

#### Scenario: Mobile login presentation
- **WHEN** the login page is opened on a narrow mobile viewport
- **THEN** the card has comfortable margins, readable contrast, touch-friendly controls, safe-area spacing, and no horizontal overflow

#### Scenario: Desktop login presentation
- **WHEN** the login page is opened on a tablet or desktop viewport
- **THEN** the card remains centered and focused while the background gains depth without making the card unnecessarily wide

### Requirement: Shared voter navigation
The login and project pages SHALL use a transparent glass navigation bar with a logo placeholder, `UTYCC`, `Project Exhibition`, and a pill-shaped `MY`/`EN` switch whose active state changes visually while all content remains English.

#### Scenario: Language switch demonstration
- **WHEN** a user clicks `MY` or `EN`
- **THEN** the selected segment becomes visibly active without changing translated content

### Requirement: Assigned category navigation
The project navigation SHALL display a Student Voter, Teacher Voter, or Visitor Voter badge derived from the validated mock session and SHALL not expose a control to change that category.

#### Scenario: Category badge
- **WHEN** a valid category-bound PIN opens the project page
- **THEN** the matching category badge is visible in the navigation and remains read-only

### Requirement: Glass project voting flow
The project page SHALL preserve project image, number, title, description, team, category, details, selection indicator, and voting interactions while applying readable atmospheric backgrounds, glass cards, selected elevation/glow/checkmark/label, and a sticky frosted-glass vote bar.

#### Scenario: Project selection
- **WHEN** a voter selects a project
- **THEN** the card shows an accent border, glow, checkmark, `Selected` label, and the vote bar shows the selected thumbnail, title, cancel action, and Vote Now action

### Requirement: Accessible restrained motion
The voter interface SHALL maintain readable contrast, visible keyboard focus, usable touch targets, reduced-motion behavior, and feedback states without relying on transparency or animation to convey meaning.

#### Scenario: Reduced motion preference
- **WHEN** a user prefers reduced motion
- **THEN** floating elements and transitions are reduced or disabled while focus and state feedback remain clear

### Requirement: Frontend-only boundary markers
The interface SHALL clearly mark demo-only behavior and provide named integration boundaries for real PIN verification, category assignment, used-PIN validation, voting session, logout expiration, and Myanmar/English translations without implementing those systems.

#### Scenario: Preview unavailable states
- **WHEN** the UI displays voting-not-started, voting-closed, network-error, successful-login, or logout-confirmation states
- **THEN** it presents them as frontend preview behavior and does not call an API or claim real persistence
