# Purpose

Define the English and Unicode Myanmar localization behavior for the public voter experience.

## Requirements

### Requirement: Persistent voter language choice
The voter application SHALL offer English and Unicode Myanmar language choices labeled `EN` and `MM`, SHALL apply the selected language across all voter routes and shared voter components, and SHALL preserve the choice during navigation and reload without storing voter authorization in browser storage.

#### Scenario: Voter selects Myanmar
- **WHEN** a voter selects `MM` from any voter page
- **THEN** voter interface copy changes to Unicode Myanmar and remains Myanmar through project browsing, confirmation, and receipt navigation

#### Scenario: Voter returns with a saved language
- **WHEN** a voter reloads or revisits the voter application with a supported saved language preference
- **THEN** the application restores that language after hydration without changing the voter session

#### Scenario: Saved language is invalid
- **WHEN** the stored language preference is missing or is not `en` or `my`
- **THEN** the voter interface uses English

### Requirement: Complete voter interface translation
The system SHALL provide matching English and Myanmar messages for voter navigation, code entry, project browsing and filtering, voting availability, project selection, vote confirmation, logout, validation and service errors, already-voted state, and the success receipt while leaving administrator-authored project content unchanged.

#### Scenario: Voter completes the flow in Myanmar
- **WHEN** a voter chooses Myanmar and proceeds through verification, project selection, confirmation, and success
- **THEN** all application-owned labels, instructions, actions, statuses, and errors in that flow are shown in Myanmar

#### Scenario: Project content is displayed
- **WHEN** a project title, description, team name, or feature is rendered in either language
- **THEN** the authored project content is displayed unchanged

#### Scenario: Translation catalogues are checked
- **WHEN** localization verification runs
- **THEN** English and Myanmar catalogues contain the same required message keys
