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
