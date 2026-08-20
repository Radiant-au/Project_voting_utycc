# Purpose

Define the connected administrator project catalogue, fallback image, upload, and cleanup behavior for the current Supabase-backed voting setup.
## Requirements
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

### Requirement: Unsplash fallback project images
The system SHALL provide a random Unsplash image URL for a project when an administrator chooses a fallback image or submits a project without an uploaded photo.

#### Scenario: Fallback image is selected
- **WHEN** an administrator clicks the fallback image action in the project form
- **THEN** the form stores and previews a valid Unsplash URL without requiring an Unsplash API key

#### Scenario: Project has no uploaded photo
- **WHEN** a valid project is saved without a Cloudinary image URL
- **THEN** the saved project uses an Unsplash fallback URL for admin and voter project cards

### Requirement: Cloudinary project photo upload
The system SHALL upload project photos to Cloudinary through a server-only Next.js endpoint, keep Cloudinary credentials out of browser bundles, and persist only the returned secure image URL on the project record.

#### Scenario: Administrator uploads a valid photo
- **WHEN** an authenticated administrator selects a supported JPG, PNG, or WEBP project photo within the configured size limit
- **THEN** the same-origin upload endpoint sends it to Cloudinary, returns a secure URL, and the project form previews that URL

#### Scenario: Upload configuration is missing
- **WHEN** Cloudinary server environment variables are missing
- **THEN** the upload action fails with an actionable admin-facing error and does not expose any credential value

#### Scenario: Invalid photo is selected
- **WHEN** an administrator selects an unsupported file type or oversized file
- **THEN** the upload is rejected before persistence and the previous project image URL remains unchanged

### Requirement: Current-setup admin cleanup
The admin dashboard SHALL show only controls that match the current Supabase-backed voting setup or clearly label remaining prototype-only sections as inactive.

#### Scenario: Administrator navigates the dashboard
- **WHEN** an administrator opens the admin sidebar or overview
- **THEN** unsupported mock-only user, project, or settings actions are removed, disabled, or explicitly marked as not connected

#### Scenario: Prototype action is not migrated
- **WHEN** an admin route still contains nonessential prototype behavior
- **THEN** it does not claim to persist to Supabase and does not affect voting data

