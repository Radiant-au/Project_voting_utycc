## Why

The database already owns whether voting is open, but the voter experience does not consistently present that state or prevent users from starting a vote after returning to a stale page. The voter portal also has a visual-only language switcher and inconsistent project categories, so voters need real English/Myanmar localization and one shared category definition across public and admin flows.

## What Changes

- Make the voter portal fetch voting status from the same-origin server API on initial project load and whenever the browser regains focus.
- Make the connected admin voting-open control persist its change with clear saving, success, and failure feedback.
- Show a localized open/closed status and disable project selection, the Vote Now action, and vote confirmation whenever voting is closed or its current status is not safely known.
- Keep the database transaction as the final authority so a vote submitted during a status race is still rejected when voting is closed.
- Turn the existing MM/EN control into real Unicode Myanmar and English localization across voter entry, project browsing, confirmation, session, error, and receipt views while preserving the active language during voter navigation.
- Define exactly two project categories—`Earth & Environment` and `Design & Technology`—for admin project create/edit and voter project display/filtering.
- Add a Supabase migration that normalizes existing project categories to the two canonical values and prevents unsupported category values from being stored.

## Capabilities

### New Capabilities

- `voter-localization`: Defines the real English/Myanmar language preference, translated voter copy, and language-preserving navigation behavior.

### Modified Capabilities

- `voter-server-api`: Extends the same-origin voter contract with an authenticated, no-store voting-status response and closed-voting behavior.
- `school-exhibition-voting-app`: Makes voting availability visible and actionable throughout the voter journey and standardizes voter-facing project categories.
- `admin-project-management`: Restricts project category management and persisted project data to the two canonical exhibition categories.

## Impact

- Voter Route Handlers and client API helper for status fetching and closed-state errors.
- Voter pages and shared voter components for status-aware controls and localized copy.
- Shared locale resources/configuration for `en` and `my` without introducing a localization dependency unless the existing platform primitives are insufficient.
- Admin project forms, project lists, shared category definitions, database types, and Supabase migrations.
- Existing projects require a one-time category normalization before a database constraint is enabled.
