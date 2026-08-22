## MODIFIED Requirements

### Requirement: Persistent voter language choice
The voter application SHALL offer English and Unicode Myanmar language choices labeled `EN` and `MM`, SHALL apply the selected language across all voter routes and shared voter components, and SHALL preserve a supported choice during navigation and reload without storing voter authorization in browser storage. Myanmar SHALL be the fallback language.

#### Scenario: Voter selects Myanmar
- **WHEN** a voter selects `MM` from any voter page
- **THEN** voter interface copy changes to Unicode Myanmar and remains Myanmar through project browsing, confirmation, and receipt navigation

#### Scenario: Voter selects English
- **WHEN** a voter selects `EN` from any voter page
- **THEN** voter interface copy changes to English and remains English through project browsing, confirmation, and receipt navigation

#### Scenario: Voter returns with a saved language
- **WHEN** a voter reloads or revisits the voter application with a supported saved language preference
- **THEN** the application restores that language after hydration without changing the voter session

#### Scenario: Saved language is missing or invalid
- **WHEN** the stored language preference is missing or is not `en` or `my`
- **THEN** the voter interface uses Unicode Myanmar

## ADDED Requirements

### Requirement: Localized voted-project state
The voter application SHALL provide English and Myanmar messages for loading, displaying, and failing to resolve the current code's voted project.

#### Scenario: Returning voter uses Myanmar
- **WHEN** a returning voter opens the voted-project page with Myanmar selected or no valid saved preference
- **THEN** every application-owned title, status, action, and error on that page is shown in Unicode Myanmar

