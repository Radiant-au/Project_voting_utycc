## Context

The current public voter path is server-authoritative through same-origin `/api/voter/*` handlers, but the admin project pages still read `seedProjects`, call `mockServices`, and label project mutations as demo actions. Supabase already has a `projects` table used by voting, so the admin project panel should manage that table directly through the existing admin browser Supabase boundary. Project photos need a real upload target, while temporary placeholders can come from Unsplash URLs.

## Goals / Non-Goals

**Goals:**
- Make `/admin/projects` and project create/edit pages use Supabase project rows instead of local seed data.
- Keep admin Auth and direct Supabase access separate from the public voter API boundary.
- Use Unsplash random images only as a fallback/default project image source.
- Add a minimal server-only Cloudinary upload path for project photos and persist the resulting URL in `projects.image_url`.
- Remove or hide admin panels/actions that still imply unsupported local mock persistence.

**Non-Goals:**
- Do not move public voter pages back to browser Supabase calls.
- Do not migrate every prototype admin section if it is not needed for current voting operations.
- Do not add a full media library, image transformations UI, or drag-and-drop uploader beyond one project photo upload.
- Do not require Cloudinary for reading projects that already have usable image URLs.

## Decisions

1. Admin project CRUD uses the existing Supabase browser admin client.
   - Rationale: admin pages are already protected by Supabase Auth and role metadata, and the project table is not a public-voter trust boundary.
   - Alternative considered: create server Route Handlers for all admin project CRUD. That adds more plumbing without a current security win.

2. Cloudinary upload uses one admin-only Next.js Route Handler.
   - Rationale: Cloudinary credentials must remain server-only, while the admin browser can submit a file through same-origin `FormData`.
   - Alternative considered: unsigned direct Cloudinary uploads. That is simpler but pushes upload policy into public browser configuration.

3. Unsplash fallback is stored as a URL, not fetched through an API.
   - Rationale: random source URLs such as `https://source.unsplash.com/...` cover placeholders without a new Unsplash key or dependency.
   - Alternative considered: Unsplash API integration. That adds account setup and rate-limit handling for placeholder images.

4. Cleanup removes unsupported UI claims instead of rebuilding the whole dashboard.
   - Rationale: the useful current surfaces are code management, project management, results, and settings tied to voting; mock-only user/project actions should not look live.
   - Alternative considered: redesign the entire admin dashboard. That is larger than needed for this change.

## Risks / Trade-offs

- Cloudinary variables missing -> show an actionable upload configuration error while keeping manual/fallback image URL save available.
- Admin RLS/grants incomplete for project mutations -> verify signed-in admin can list, create, update, and archive projects before claiming live readiness.
- Unsplash remote image patterns too broad -> allow only the minimal hostnames needed for the fallback URLs.
- Existing voter project API depends on project row shape -> keep `projects` columns compatible and run voter project checks after admin changes.

## Migration Plan

1. Add environment placeholders for Cloudinary cloud name, API key, API secret, and upload folder/preset if used.
2. Add the admin upload Route Handler and Cloudinary request helper.
3. Replace admin project mock reads/writes with typed Supabase operations.
4. Configure Next image remote patterns for Cloudinary and Unsplash hosts used by the UI.
5. Remove or hide unsupported mock admin actions and update empty/error states.
6. Validate typecheck/build and perform a signed-in admin smoke test for project list, create, edit, archive, fallback image, and upload.

## Open Questions

- Which Cloudinary folder name should production use for exhibition project photos?
- Should archive map to an existing database column only, or should an `is_archived` column be added if the current table lacks one?
