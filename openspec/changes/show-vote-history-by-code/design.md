## Context

The database already links `votes.voting_code_id` to one code and `votes.project_id` to one project, and `verify_voter_code` already returns `has_voted`. The gap is authorization after login: `voterSession()` currently accepts only an unused database status, while `/api/voter/receipt` accepts only the short-lived receipt cookie created immediately after submission. Admin code listing also omits linked vote/project details.

Public voters must stay on same-origin Next.js Route Handlers with signed HTTP-only cookies. Authenticated admin pages may use direct Supabase through admin-only RPCs. Voter responses must not reveal raw codes, internal project identifiers, totals, or points.

## Goals / Non-Goals

**Goals:**

- Make code-to-project history searchable and filterable for administrators.
- Let a used code return to its own selected project without enabling another vote.
- Reuse `/vote/success` and the existing safe receipt shape for both fresh and returning voters.
- Make Myanmar the only fallback while retaining explicit English selection.

**Non-Goals:**

- Changing or deleting recorded votes.
- Exposing code-to-project history to public clients.
- Adding voter Realtime, browser Supabase access, analytics, or a new UI dependency.

## Decisions

### Add one admin-only history RPC and page

Create `list_code_vote_history` as a security-definer admin RPC returning the joined code, category, status, vote time, project ID/title, and only fields needed by `/admin/vote-history`. Apply search/category/status filtering in the database with bounded results, and add one admin navigation entry.

Alternative: load entire code, vote, and project tables in the browser and join them in React. Rejected because it transfers more protected data and duplicates relational work.

### Keep one voter success route and receipt response

Do not create a second voter receipt UI. `/vote/success` remains the canonical voted-project page. After verification, `hasVoted=true` redirects there; `hasVoted=false` keeps the current `/projects` redirect. `GET /api/voter/receipt` accepts either a receipt cookie containing `voteId` or a used voter cookie containing `codeId`, then resolves exactly one matching vote server-side.

Alternative: store the selected project in browser storage. Rejected because authorization and vote identity must remain server-controlled.

### Split session validation by allowed action

Update the shared session resolver to validate unused sessions against `unused` codes and returning sessions against `used` codes. Voting/project handlers continue requiring an unused voting session; receipt retrieval accepts a used returning session. The vote handler retains its `hasVoted` rejection as defense in depth.

Alternative: treat used sessions as normal project-browsing sessions and hide the vote button in React. Rejected because UI hiding is not authorization.

### Change only the locale initializer fallback

Initialize the voter locale to `my` and map a missing or unsupported stored value to `my`; keep the existing two-value `en | my` type and selector. Add only the new voted-project error/loading strings required by the UI.

## Risks / Trade-offs

- [A used code can reveal its selected project to anyone holding that code] → This matches the requested code-based access model; keep rate limiting, signed short-lived cookies, and disclose only that code's safe receipt.
- [A used code marked without a matching vote cannot render history] → Return a generic localized unavailable state and flag the inconsistency in the admin row.
- [A security-definer history RPC could overexpose data] → Require the existing admin role inside the function, revoke public execution, return a bounded explicit column list, and test non-admin denial.
- [Existing stale cookies encode a status that no longer matches the database] → Revalidate code status/category on every protected request and reject mismatches.

## Migration Plan

1. Add and apply the admin history RPC with explicit grants and bounded filtering.
2. Update generated database types and the admin history page/navigation.
3. Update voter session validation, receipt lookup, redirects, and Myanmar fallback.
4. Run focused security/flow checks, typecheck, and build; then smoke-test unused login, fresh vote, used-code return, admin filters, and non-admin denial.

Rollback the application before removing the RPC; the migration is additive and recorded votes remain unchanged.

## Open Questions

None. The proposal defaults to one admin history page and reuses the existing voter success page to keep the change small.
