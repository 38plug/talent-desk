# Talent Desk

Forex recruiting command center — **Vite + React 19 + TypeScript + Tailwind CSS v4** SPA on local Supabase.

Neon dark UI (violet / cyan / magenta). Brand name **Talent Desk** everywhere.

## Prerequisites

- Node 20+
- Docker Desktop (for local Supabase)

## Run locally

```bash
# 1. Start Supabase (Docker must be running)
npx supabase start

# 2. Create env from example and paste keys
cp .env.example .env
npx supabase status
# Copy "API URL" → VITE_SUPABASE_URL
# Copy "anon key"  → VITE_SUPABASE_ANON_KEY

# 3. Install + start Vite
npm install
npm run dev
# → http://127.0.0.1:5173
```

| Service | URL |
|---------|-----|
| App (Vite) | http://127.0.0.1:5173 |
| Supabase API | http://127.0.0.1:54321 |
| Auth health | http://127.0.0.1:54321/auth/v1/health → **200** |
| Studio | http://127.0.0.1:54323 |

### Auth / “fetch failed”

Login and Register never show a raw `fetch failed`. They probe `/auth/v1/health` and explain:

- **Docker/Supabase down** → start Docker, `npx supabase start`, recheck health
- **Wrong `VITE_SUPABASE_URL`** → must be the API (`:54321`), not the Vite app port
- **Tunnel** → Cloudflared must target **54321**; hostnames change on restart — update `.env` and restart Vite

Without a valid `.env`, the auth banner tells you to copy `.env.example` and paste keys from `supabase status`.

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
- Tailwind v4: `@import "tailwindcss"` + `@theme` in `src/index.css` (no `tailwind.config.js`)
- Recharts, lucide-react, tesseract.js (scan offer)

## Modules

Overview · Candidates · Offers (forex + Chinese, scan, provision wording, Telegram) · Interviews · Earnings (Estimated → Pending confirm) · Settings · Admin (role-gated)

Roles: `owner` > `admin` > `moderator` > `user`. Max **4** non-owner seats. Income isolated by RLS.

## Edge Functions (optional, service role)

Browser never sees the service role. For full admin/register seat enforcement via functions:

```bash
npx supabase functions serve
# register · admin-stats · admin-account
```

Without functions: `signUp` still works (DB trigger enforces the seat cap); Admin falls back to a limited profile list.

## Env

Only these are client-side (see `.env.example`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` stays in Edge Function / server env only.

## Deploy on Vercel

SPA config lives in `vercel.json` (Vite build → `dist`, client-side rewrites to `index.html`).

### One-time claim (if an agent left a temporary deploy)

1. Open the claim link from the agent report (expires ~60 minutes).
2. Sign in to Vercel and claim the deployment into your team/project.
3. Or from your machine:

```bash
npm i -g vercel
vercel login
vercel link   # link to the claimed project, or:
vercel        # import https://github.com/38plug/talent-desk
```

### Production import from GitHub (recommended)

```bash
# In the repo root
vercel login
vercel link          # create/link project "talent-desk"
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel --prod
```

Or in the Vercel dashboard: **Add New Project** → import `38plug/talent-desk` → Framework **Vite** → Root `.` → Build `npm run build` → Output `dist`.

### Env vars (required for real login)

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | Hosted project URL `https://<ref>.supabase.co` **or** Cloudflared tunnel to local `:54321` |
| `VITE_SUPABASE_ANON_KEY` | Project anon/public key |

`VITE_*` are baked in at **build** time — change them → **Redeploy**.

Local Docker (`http://127.0.0.1:54321`) is **not** reachable from Vercel.

#### Path A — Hosted Supabase (preferred)

1. Create a project at https://supabase.com/dashboard
2. SQL editor: run `supabase/migrations/0001_init.sql`
3. (Optional) Deploy Edge Functions `register`, `admin-stats`, `admin-account`
4. Copy Project URL + anon key into Vercel env → Redeploy

#### Path B — Cloudflared tunnel to local Supabase

On the machine running Docker Supabase:

```bash
npx supabase start
cloudflared tunnel --url http://127.0.0.1:54321
# Confirm https://<tunnel>/auth/v1/health → 200
```

Set Vercel `VITE_SUPABASE_URL` to that **54321** tunnel URL (not the app), paste the same local anon key, redeploy. Tunnel hostnames change on restart — update env + redeploy each time.

Without these env vars the public site still loads; login shows the connectivity banner and **Preview Talent Desk UI** works for browsing.
