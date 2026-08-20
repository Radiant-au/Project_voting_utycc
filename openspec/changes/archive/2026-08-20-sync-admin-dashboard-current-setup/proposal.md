## Why

The admin dashboard still mixes the current Supabase voting setup with local mock project actions, stale prototype panels, and demo-only project images. The project panel should become the maintained admin surface for the live exhibition catalogue, with temporary Unsplash images available and real project-photo uploads prepared for Cloudinary.

## What Changes

- Replace admin project list/create/edit/archive behavior that uses local `seedProjects` and `mockServices` with the current Supabase-backed project catalogue.
- Remove or hide admin dashboard panels and actions that no longer match the current voting setup, while keeping admin Auth, code management, results, and settings that are still useful.
- Use random Unsplash image URLs as a simple fallback for project cards when no uploaded project photo exists.
- Add Cloudinary upload setup for project photos, including server-side upload handling, environment documentation, URL persistence, and image preview after upload.
- Preserve the public voter boundary: voter pages continue using same-origin `/api/voter/*`; direct Supabase browser access remains admin-only.

## Capabilities

### New Capabilities
- `admin-project-management`: Admin project catalogue management, fallback project images, and Cloudinary-backed project photo uploads.

### Modified Capabilities
- `school-exhibition-voting-app`: Admin project behavior changes from demo/local actions to maintained project management aligned with the current Supabase voting setup.

## Impact

- Affected code: `src/app/admin/**`, `src/features/exhibition/pages/admin/**`, `src/features/exhibition/components/admin.tsx`, `src/features/exhibition/data/services.ts`, `src/lib/supabase/**`, and any new admin-only Route Handler needed for Cloudinary upload.
- Affected config: `next.config.ts` image remote patterns and environment examples for Cloudinary placeholders.
- Affected data: Supabase `projects.image_url` stores uploaded Cloudinary URLs or generated Unsplash fallback URLs.
- Dependencies: Prefer direct Cloudinary upload API with `fetch` and `FormData`; add a package only if the native request path is not enough.
