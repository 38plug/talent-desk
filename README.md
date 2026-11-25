# Talent Desk

Forex recruiting command center — **Vite + React 19 + TypeScript + Tailwind CSS v4** SPA on Supabase.

Neon dark UI (violet / cyan / magenta). Brand name **Talent Desk** everywhere.

**Production:** Vercel SPA + **hosted** Supabase (real data). Local Docker is for development only — Vercel cannot reach `127.0.0.1`.

## Prerequisites

- Node 20+
- A Supabase project (hosted for Vercel; optional local Docker for dev)

## Run locally

```bash
cp .env.example .env
# Prefer hosted URL/anon key even in dev once migrated.
# Or for local Docker: npx supabase start → paste API URL + anon from `npx supabase status`

npm install
npm run dev
# → http://127.0.0.1:5173
```

Auth health: `{VITE_SUPABASE_URL}/auth/v1/health` → **200**

Empty tables show **zero** KPIs — Talent Desk does **not** invent demo income/candidates.

## Deploy on Vercel (permanent)

1. Import `38plug/talent-desk` (or `vercel link` + `vercel --prod`).
2. Set Production env (then **redeploy** — Vite bakes `VITE_*` at build):

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Hosted anon key |

3. Migrate **real** data first — see [`docs/migrate-to-hosted-supabase.md`](docs/migrate-to-hosted-supabase.md) and `scripts/export-local-supabase.sh`.

`vercel.json` sets Vite → `dist` and SPA rewrites.

## Migrate existing website data

Do **not** replace live rows with seed/demo data.

```bash
# On the machine that has the live local Supabase:
./scripts/export-local-supabase.sh
# Restore dumps into a new hosted project, then point Vercel at that project.
```

Details: [`docs/migrate-to-hosted-supabase.md`](docs/migrate-to-hosted-supabase.md).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production bundle |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run preview` | Preview production build |

## Stack

- React 19, React Router v7 (`React.lazy` + Suspense)
- TanStack Query + `@supabase/supabase-js`
- Tailwind v4 (`@import "tailwindcss"` + `@theme` in `src/index.css` — no `tailwind.config.js`)
- Recharts, lucide-react, tesseract.js (scan offer)

## Modules

Overview · Candidates · Offers (forex + Chinese, scan, provision, Telegram) · Interviews · Earnings (Estimated → Pending confirm) · Settings · Admin (role-gated)

Roles: `owner` > `admin` > `moderator` > `user`. Max **4** non-owner seats. Income isolated by RLS.

## Edge Functions (optional)

`register` · `admin-stats` · `admin-account` — service role server-side only. Without them, `signUp` + DB seat trigger still work; Admin falls back to a limited profile list.

## Env

Client (see `.env.example`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` — migrate scripts / Edge Functions only; never `VITE_*`.
