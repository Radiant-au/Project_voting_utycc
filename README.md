# Project Voting

## Local development

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Do not put a Supabase service-role key in any `NEXT_PUBLIC_` variable.

## Verify and deploy

```bash
npm run typecheck
npm run build
```

Import the repository into Vercel, then add the same two public variables in **Settings → Environment Variables** for the environments you deploy. Vercel detects Next.js automatically; no `vercel.json` file is needed.

## Voting portal integration seams

The voter portal is a frontend-only demonstration. Replace the functions in `src/features/exhibition/data/pin-session.ts` when connecting production services:

- `verifyVotingPin`: real PIN verification, category assignment, used-PIN validation, and voting availability
- `saveMockPinSession` / `readMockPinSession`: real voting session and expiration
- `clearMockPinSession`: real logout and session revocation
- `LanguageSwitcher`: Myanmar and English translation state

Demo sessions intentionally store only `pinId`, `category`, and `hasVoted`; they never store the submitted PIN.
# Supabase voting setup

1. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_ORIGIN` from `.env.local.example` in local and Vercel environments. The site origin is the deployed origin without a trailing slash.
2. Apply `supabase/migrations/20260817150000_voting_codes.sql` to Supabase project `Voting_show`.
3. Create the initial administrator with Supabase email/password Auth, then set the user's `app_metadata.role` to `admin` from a trusted server or the Supabase dashboard. Sign out and back in after changing the claim.
4. Never expose or commit the service-role key. It is needed only to run `npm run test:voting-db` against a disposable test code.
