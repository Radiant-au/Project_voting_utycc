## Context

The Next.js 16 app already contains the complete voter/admin presentation, an installed Supabase browser client, static project data, demo PIN verification, and browser-only vote submission. The connected `Voting_show` Supabase project is active and its public schema contains no tables. This change therefore replaces the mock access/vote boundary without redesigning the site or migrating existing database rows.

The voter code is a bearer credential. Public clients need narrowly scoped verification and submission operations, but must never receive table-level access. Administrative code generation and listing also requires an authorization boundary because the existing admin UI is currently only a prototype.

## Goals / Non-Goals

**Goals:**

- Use one code-based voter journey and one shared project page for students, teachers, and visitors.
- Derive the immutable voter category only from a verified Supabase row.
- Enforce single-use voting in PostgreSQL under retries, double-clicks, refreshes, and concurrent tabs.
- Add protected administration for generating, listing, filtering, disabling, and printing visitor passes.
- Keep the current glassmorphism styling, MY/EN behavior, static project catalogue, and installed Supabase integration.

**Non-Goals:**

- Creating a second visitor site, separate category pages, Google OAuth, device identity, or user-selectable categories.
- Moving the existing static project catalogue or unrelated admin prototype data into Supabase.
- Building a custom QR encoder, generalized permissions framework, or multi-election abstraction.

## Decisions

### PostgreSQL owns code integrity and vote atomicity

Add `voting_codes` and `votes` in one migration. Use database checks for `code ~ '^[A-Z0-9]{7}$'`, the three categories, and `unused|used|disabled` statuses; unique constraints protect `voting_codes.code` and `votes.voting_code_id`. `votes.project_id` remains text because the existing project catalogue uses stable string IDs and there is no compatible Supabase projects table.

`submit_vote(code, project_id)` is a `SECURITY DEFINER` function with a fixed search path. It locks the matching code row, rejects non-`unused` codes, inserts the vote with the row's category, and updates the code to `used` with `used_at` before returning. PostgreSQL executes the function in one transaction, and the unique constraint remains the final concurrency guard. Verification is read-only and never changes code status.

Alternative considered: insert from the client and then update the code. Rejected because two client calls cannot guarantee atomic single-use behavior.

### Public access is RPC-only

Enable RLS on both tables and grant no direct anonymous table operations. Expose only narrow `verify_voting_code(code)` and `submit_vote(code, project_id)` RPCs to public voters. Normalize input to uppercase and require exactly seven ASCII alphanumeric characters both in the UI and database functions. Functions return explicit result states for invalid, used, and disabled codes; transport failures map to the network error state.

The browser keeps only the verified code and category in `sessionStorage` so `/projects` can guard direct access and refreshes. The database revalidates the code during submission, so browser state is never authoritative. The success page clears the credential after a successful vote.

Alternative considered: create a Supabase Auth account per voter. Rejected because single-use bearer codes already provide the required voter credential and account provisioning would add a second flow without improving the one-vote constraint.

### Admin operations require Supabase Auth

Gate `/admin/codes` and its database functions with Supabase email/password authentication and an `admin` value in JWT `app_metadata.role`. Generation, listing, and disabling run through admin-only `SECURITY DEFINER` functions that verify the claim. This avoids public table reads and does not introduce Google OAuth. Existing admin pages can share this same protected admin session when they are connected later.

Alternative considered: embedding a service-role key in the browser. Rejected because it bypasses RLS and would expose every code.

### Generate codes with PostgreSQL cryptographic randomness

`generate_voting_codes(category, count)` validates category and a bounded count, then builds seven characters from `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789` using cryptographically secure random bytes. It retries unique conflicts and returns only the newly created rows. Codes never encode category; the database row is the sole category source.

### Visitor QR passes encode the same access route

The admin page builds an absolute `/access?code=...` URL from the configured public site origin and renders it with a small QR dependency. `/access` accepts only a syntactically valid code, verifies that its database category is `visitor`, stores the same voter session, and redirects to `/projects`. The printable layout includes the requested title, QR, backup code, visitor label, and single-use warning.

Alternative considered: a hosted QR image API or custom QR implementation. Rejected because an external service would receive voting credentials and a custom encoder adds unnecessary security-sensitive code.

## Risks / Trade-offs

- [A photographed or shared unused code can be used by its first holder] → Treat codes and QR passes as bearer credentials, label them single-use, and let the atomic database function accept only the first vote.
- [Public verification can be brute-forced] → Use a 36^7 cryptographic code space, strict input validation, generic invalid responses, and apply Supabase/API rate limits before public launch.
- [Admin JWT role changes are not visible until token refresh] → Sign out/in after granting or removing `app_metadata.role`.
- [Static project IDs can drift from deployed project data] → Validate submitted IDs against the existing server-side project catalogue before calling the RPC and retain the selected ID in the vote record.
- [Printing depends on the deployed origin] → Require one public site-origin environment variable and show a configuration error instead of generating unusable QR passes.

## Migration Plan

1. Add and review a versioned SQL migration containing tables, constraints, RLS, grants, and RPC functions; apply it to `Voting_show` through Supabase MCP.
2. Configure one Supabase Auth administrator with `app_metadata.role = admin` and the deployed site origin.
3. Replace demo PIN/session and mock vote calls, then add `/access` and `/admin/codes` using the existing UI shell.
4. Generate test codes for all categories and verify invalid, disabled, used, concurrent submission, visitor QR, admin authorization, and print behavior.
5. Run Supabase security/performance advisors plus app typecheck, tests, and build before release.

Rollback the application first to stop RPC use. The additive database objects can remain harmlessly under RLS; if removal is required, export vote/code data and apply a separate explicit down migration rather than deleting production data during deployment.

## Open Questions

- The final public site origin must be supplied before production visitor passes are printed.
- The initial administrator email must be chosen when implementation configures Supabase Auth.
