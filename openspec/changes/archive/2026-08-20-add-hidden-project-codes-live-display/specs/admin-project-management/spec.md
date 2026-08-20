## MODIFIED Requirements

### Requirement: Supabase-backed admin project catalogue
The system SHALL let authenticated administrators list, create, edit, publish, and archive exhibition projects using the current Supabase `projects` data, with a required category and a unique hidden project code stored separately from the internal project number.

#### Scenario: Administrator lists projects
- **WHEN** an authenticated administrator opens `/admin/projects`
- **THEN** the page displays projects loaded from Supabase with search, active/archive filtering, internal project numbers, hidden project codes, titles, categories, teams, vote counts where available, and edit actions

#### Scenario: Administrator creates a project
- **WHEN** an authenticated administrator submits valid internal project number, unique hidden project code, title, descriptions, team, category, active state, and image URL
- **THEN** Supabase stores the project and the admin returns to the project list with the new row visible

#### Scenario: Administrator enters a duplicate hidden code
- **WHEN** an authenticated administrator submits a hidden project code already assigned to another project
- **THEN** the project is not saved and the form reports that the hidden code must be unique

#### Scenario: Administrator edits a project
- **WHEN** an authenticated administrator changes an existing project's editable fields, including its category or hidden project code
- **THEN** Supabase persists the update and connected admin displays use the updated project data

#### Scenario: Administrator archives a project
- **WHEN** an authenticated administrator confirms archive for an active project
- **THEN** Supabase marks the project unavailable for voter project discovery and live ranking without deleting existing votes
