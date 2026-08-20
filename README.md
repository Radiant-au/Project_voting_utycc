# Project Voting

## Local development

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Set the public Supabase variables only for the admin browser. Set `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and a random `VOTER_SESSION_SECRET` of at least 32 characters for the server-side voter API. Never prefix either secret with `NEXT_PUBLIC_`.

## Verify and deploy

```bash
npm run typecheck
npm run build
```

Import the repository into Vercel, then add the public admin variables, three private voter variables, and the private Cloudinary variables from `.env.local.example` in **Settings → Environment Variables**. Vercel detects the dynamic Next.js Route Handlers automatically; static export is not supported.

## Voting portal architecture

Public voter pages call only same-origin `/api/voter/*` Route Handlers. The server verifies codes and talks to Supabase with the private server client; the browser receives an HTTP-only signed cookie and never stores the submitted code. The admin dashboard remains a separate direct-Supabase client for VPN-connected administrators.
# Supabase voting setup

1. Copy all placeholder variables from `.env.local.example` into local and Vercel environments. The site origin is the deployed origin without a trailing slash.
2. Apply `supabase/migrations/20260817150000_voting_codes.sql`, then `supabase/migrations/20260818120000_voter_server_api.sql`, to Supabase project `Voting_show`.
3. Create the initial administrator with Supabase email/password Auth, then set the user's `app_metadata.role` to `admin` from a trusted server or the Supabase dashboard. Sign out and back in after changing the claim.
4. Never expose or commit `SUPABASE_SECRET_KEY` or `VOTER_SESSION_SECRET`. The secret key is used only by Vercel and the disposable database concurrency check.
5. Apply `supabase/migrations/20260820100000_admin_projects.sql` and `supabase/migrations/20260820113000_admin_project_permissions_and_points.sql` to allow authenticated users with `app_metadata.role = admin` to manage projects and voting settings. Add Cloudinary credentials only to server environments; the project form uploads through `/api/admin/project-image`.
6. Apply `supabase/migrations/20260820140000_hidden_project_codes_live_results.sql` after the previous migrations. This adds `projects.hidden_project_code`, the admin top-five ranking function, and admin vote Realtime permissions. Refresh the app after applying it.
