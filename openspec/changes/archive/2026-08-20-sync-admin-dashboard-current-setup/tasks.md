## 1. Current Setup Review

- [x] 1.1 Read the installed Next.js 16 docs for touched Route Handler, image, form/upload, and client/server boundary APIs before editing code.
- [x] 1.2 Inspect current Supabase `projects` columns, admin grants/RLS, project-facing voter endpoints, and admin project pages to confirm the smallest compatible update path.
- [x] 1.3 Identify admin dashboard links, panels, and actions that are still mock-only or unnecessary for the current voting setup.

## 2. Project Data Integration

- [x] 2.1 Replace admin project list reads from `seedProjects` with typed Supabase project queries and preserve search, active/archive filtering, card/table views, and edit navigation.
- [x] 2.2 Replace project create/edit submit behavior with Supabase inserts/updates for the current `projects` shape, including clear loading and error states.
- [x] 2.3 Implement archive behavior using the existing database shape when possible; add only the minimum migration if the current schema cannot represent archived projects safely.
- [x] 2.4 Keep public voter project reads on same-origin `/api/voter/projects` and verify admin changes appear there without adding browser Supabase to voter pages.

## 3. Project Images

- [x] 3.1 Add a small Unsplash fallback URL helper and wire the project form's fallback action to preview and save a random fallback image.
- [x] 3.2 Add a server-only Cloudinary upload Route Handler using native `fetch`/`FormData`, strict file type/size validation, and non-public environment variables.
- [x] 3.3 Wire the admin project form file input to the upload endpoint, preview the returned secure URL, and persist it in `projects.image_url`.
- [x] 3.4 Configure only the required Next image remote patterns for Cloudinary and Unsplash URLs used by the admin/voter project cards.

## 4. Admin Cleanup

- [x] 4.1 Remove, hide, or label unsupported mock-only admin actions so the dashboard no longer claims local demo actions are live Supabase operations.
- [x] 4.2 Keep admin Auth, code management, results, and current settings behavior intact while simplifying unnecessary project-panel plumbing.
- [x] 4.3 Update placeholder-only environment documentation for Cloudinary values without committing credentials.

## 5. Verification

- [x] 5.1 Add or update the smallest focused checks for project mapping, Unsplash fallback generation, upload validation, and voter-boundary imports.
- [x] 5.2 Run `npm run typecheck`, `npm run build`, `openspec validate --changes`, and `git diff --check`.
- [ ] 5.3 With real Supabase/Cloudinary variables configured, smoke test admin sign-in, project list, create, edit, archive, fallback image, upload, and voter project visibility.
