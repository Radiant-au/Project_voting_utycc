## ADDED Requirements

### Requirement: Searchable administrator vote history
The system SHALL provide an authenticated `/admin/vote-history` page that lists voting code, voter category, code status, selected project, and vote time, and SHALL support case-insensitive code/project search plus category and status filters.

#### Scenario: Administrator finds a used code
- **WHEN** an administrator searches for a full or partial voting code
- **THEN** matching rows show the code, category, used status, selected project title, and recorded time

#### Scenario: Administrator categorizes history
- **WHEN** an administrator applies a voter-category or code-status filter
- **THEN** the page shows only matching authorized code records and clearly distinguishes codes without a vote

#### Scenario: Non-admin requests vote history
- **WHEN** an unauthenticated or non-admin client requests the code-to-project history operation
- **THEN** the system denies the request without disclosing voting codes or votes

### Requirement: Returning voter sees own selected project
The voter application SHALL show a verified used-code holder only the project selected by that same code on `/vote/success`, together with its voter category, receipt identifier, and recorded time.

#### Scenario: Used code logs in again
- **WHEN** a voter verifies a used code that has a recorded vote
- **THEN** the application creates a restricted session and redirects directly to `/vote/success`, which shows that code's selected project

#### Scenario: Fresh vote succeeds
- **WHEN** an unused code successfully commits a vote
- **THEN** the application redirects to the same `/vote/success` page and shows the newly selected project

#### Scenario: Returning voter attempts another vote
- **WHEN** a used-code session requests project voting or submits another project
- **THEN** the system rejects the operation and preserves the original vote

#### Scenario: Vote cannot be resolved
- **WHEN** a verified used code has no matching vote or its selected project cannot be safely displayed
- **THEN** the page shows a localized unavailable state without exposing database details or another code's vote

