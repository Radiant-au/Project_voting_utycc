## 1. Database and Admin History

- [x] 1.1 Add an admin-only, bounded `list_code_vote_history` migration with code/project search and category/status filters, then update generated database types.
- [x] 1.2 Add `/admin/vote-history` and its navigation link, showing code, category, status, selected project, vote time, empty states, and filter/search controls.
- [x] 1.3 Add one focused check for joined history results, filtering, codes without votes, and non-admin denial.

## 2. Returning Voter Flow

- [x] 2.1 Update server session validation so unused sessions retain voting access and used sessions have receipt-only access, with database status/category revalidation.
- [x] 2.2 Extend `/api/voter/receipt` to resolve a used session's single vote by server-held code ID and return the existing safe receipt shape.
- [x] 2.3 Redirect `hasVoted=true` verification to `/vote/success`, keep unused codes going to `/projects`, and show a localized unavailable state instead of returning a used code to login.
- [x] 2.4 Add one focused voter check covering unused login, used-code return, own-receipt lookup, second-vote rejection, and voter payload privacy.

## 3. Myanmar Fallback and Validation

- [x] 3.1 Make `my` the initial and invalid/missing-preference fallback locale and add matching English/Myanmar voted-project state messages.
- [x] 3.2 Run voter/admin focused checks, localization catalogue validation, typecheck, build, `openspec validate --changes`, and `git diff --check`.
- [ ] 3.3 Apply and verify the pending Supabase migration, then smoke-test admin search/filter, unused-code voting, fresh success display, and used-code login against the configured environment.
