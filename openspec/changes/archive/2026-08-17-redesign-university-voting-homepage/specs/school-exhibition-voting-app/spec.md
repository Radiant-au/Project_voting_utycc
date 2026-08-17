## ADDED Requirements

### Requirement: Voter journey
The application SHALL provide a connected voter journey from entry and category selection through project discovery, project details, vote confirmation, and success acknowledgement.

#### Scenario: Visitor completes the demonstration flow
- **WHEN** a visitor selects a category, chooses a project, and confirms the vote
- **THEN** the application records the demonstration choice locally and displays the success view

### Requirement: Project discovery
The application SHALL provide responsive project cards, search, category filtering, sorting, project details, selection state, and already-voted state.

#### Scenario: Visitor filters projects
- **WHEN** a visitor enters a query or selects a project category
- **THEN** only matching active demonstration projects are displayed and filters can be cleared

### Requirement: Administration flow
The application SHALL provide navigable admin overview, users, projects, project create/edit, results, and settings views with their supplied demonstration interactions.

#### Scenario: Administrator reviews the prototype
- **WHEN** a visitor navigates among admin sections
- **THEN** each admin route renders its relevant data, controls, responsive navigation, and feedback states

### Requirement: Demonstration data boundary
The application SHALL clearly operate on local mock services and browser state without presenting those actions as live authenticated or server-persisted operations.

#### Scenario: Demonstration action completes
- **WHEN** a project, setting, category, or vote action is performed
- **THEN** the UI provides feedback while remaining safe to use without live backend credentials

### Requirement: Futuristic university presentation
The application SHALL apply a coherent dark academic sci-fi visual system across voter and admin views using restrained neon accents, clear hierarchy, and consistent controls.

#### Scenario: Visitor moves between public and admin pages
- **WHEN** different application routes are rendered
- **THEN** they share recognizable identity, visual tokens, and interaction treatment

### Requirement: Responsive and accessible interaction
The application SHALL support mobile and desktop layouts, visible focus, keyboard-operable controls, sufficient contrast, usable touch targets, and reduced-motion preferences.

#### Scenario: Application is used on a narrow viewport
- **WHEN** a voter or admin route is opened on a mobile-width screen
- **THEN** navigation and content reflow without inaccessible controls or horizontal page overflow

### Requirement: Minimal migration footprint
The main app SHALL include only prototype modules and dependencies used by the complete migrated flow.

#### Scenario: Migration dependencies are reviewed
- **WHEN** implementation is complete
- **THEN** Vite preview plugins and unused generic UI component dependencies are absent from the main application dependency list
