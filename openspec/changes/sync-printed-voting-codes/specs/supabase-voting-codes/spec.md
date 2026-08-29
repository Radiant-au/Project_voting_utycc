## ADDED Requirements

### Requirement: Printed code inventory synchronization
The system SHALL treat the privately staged printed-code sources as the replacement inventory for student and visitor codes, SHALL validate all source values before mutation, and SHALL replace those categories and their dependent voting activity atomically while preserving teacher codes, projects, and voting settings.

#### Scenario: Valid printed inventory is imported
- **WHEN** the administrator imports the validated source containing 1,000 unique student codes and 100 unique visitor codes
- **THEN** the database contains exactly those student and visitor codes as `unused` and printed, with no votes or voter sessions dependent on the replaced category inventory

#### Scenario: Printed inventory validation fails
- **WHEN** either source has an unexpected count, invalid seven-character uppercase-alphanumeric code, duplicate, cross-source overlap, or collision with a preserved teacher code
- **THEN** the import aborts before deleting or inserting any voting data

#### Scenario: Unrelated records survive replacement
- **WHEN** the student and visitor inventory is replaced
- **THEN** teacher codes, projects, and voting settings remain unchanged

### Requirement: Private handling of active printed codes
The system MUST keep source files containing active voting codes outside web-served public assets and untracked by Git, and SHALL NOT place active code literals in tracked migrations or planning artifacts.

#### Scenario: Application assets are deployed
- **WHEN** the application build is deployed
- **THEN** no printed-code workbook or JSON source is available through a public application URL

### Requirement: Printed-state tracking
The system SHALL store a printed state for every voting code, SHALL mark imported printed student and visitor codes as printed, SHALL mark newly generated codes as not printed, and SHALL allow only an authenticated administrator to change that state for one exact code.

#### Scenario: Printed code is imported
- **WHEN** a student or visitor code is created from the validated printed inventory
- **THEN** its printed state is `true`

#### Scenario: New code is generated
- **WHEN** an administrator generates a new voting code through the existing generation operation
- **THEN** its printed state is `false`

#### Scenario: Administrator changes printed state
- **WHEN** an authorized administrator toggles one listed code between printed and not printed
- **THEN** only that exact code is updated and the Codes tab shows the saved state

#### Scenario: Non-admin changes printed state
- **WHEN** an unauthenticated or non-admin client calls the printed-state operation
- **THEN** the system rejects the request without exposing or changing voting-code data

## MODIFIED Requirements

### Requirement: Administrator code management
The system SHALL allow an authenticated administrator to generate a bounded quantity of codes by category, list codes and categories, search by full or partial code, filter by category, status, and printed state, inspect unused, used, and printed state, toggle printed state, disable an unused code, and print visitor QR passes.

#### Scenario: Administrator filters codes
- **WHEN** an administrator selects a category, status, or printed-state filter
- **THEN** `/utyccadmin/codes` displays only matching authorized results

#### Scenario: Administrator searches codes
- **WHEN** an administrator enters a full or partial code using any letter case
- **THEN** `/utyccadmin/codes` returns every authorized matching code without relying only on the currently loaded browser rows

#### Scenario: Administrator disables an unused code
- **WHEN** an administrator confirms disabling an `unused` code
- **THEN** Supabase changes its status to `disabled` and the code can no longer verify or vote

#### Scenario: Administrator tries to disable a used code
- **WHEN** an administrator requests disabling a `used` code
- **THEN** Supabase rejects the state change and preserves the vote history

#### Scenario: Administrator prints visitor passes
- **WHEN** an administrator selects generated visitor codes and prints passes
- **THEN** each printed pass shows `UTYCC Project Exhibition`, its unique QR, `Visitor Voting Pass`, `Backup Code: <CODE>`, and `Single Use Only`
