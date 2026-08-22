## Why

Administrators cannot quickly answer which voting code selected which project, and returning voters who enter an already-used code are not taken back to the project they voted for. The voter experience also currently defaults to English when no valid language preference exists, instead of Myanmar.

## What Changes

- Add an admin vote-history page that joins voting codes, votes, and projects and supports search plus category/status filtering.
- Show each used code's selected project and vote time while keeping unused and disabled codes easy to distinguish.
- Allow a used code to create a restricted returning-voter session and redirect it directly to a voter-safe voted-project page.
- Reuse the voted-project page immediately after a successful vote instead of sending the voter back to login when the receipt is revisited.
- Default public voter pages to Myanmar when the saved language is missing or invalid; retain explicit `EN` and `MM` choices.
- Preserve the public same-origin `/api/voter/*` boundary and never expose another code's vote, hidden project identifiers, totals, or points to voters.

## Capabilities

### New Capabilities

- `code-vote-history`: Admin code-to-project lookup and the authenticated returning-voter view of the project selected by that code.

### Modified Capabilities

- `supabase-voting-codes`: Used codes may authenticate only to view their own recorded project, and admin code records include their linked vote/project details.
- `voter-server-api`: Verified used-code sessions can retrieve only their own vote through a same-origin endpoint and cannot submit another vote.
- `voter-localization`: Missing or invalid language preferences fall back to Myanmar, including the voted-project page.

## Impact

- Admin code navigation/page and its authenticated Supabase query or RPC.
- Voter verification, session authorization, redirect logic, voted-project route, and same-origin API contract.
- Supabase code-listing/lookup functions and generated database types if their return shape changes.
- English/Myanmar voter message catalogue and focused voter/admin checks; no new dependency is expected.
