# Talent Desk

Forex recruiting command center — **Vite + React 19 + TypeScript + Tailwind CSS v4** SPA on Supabase.

Neon dark UI (violet / cyan / magenta). Brand name **Talent Desk** everywhere.

## Quick start (local Supabase)

```bash
# 1. Docker Desktop running, then:
npx supabase start

# 2. Env
cp .env.example .env
# Paste API URL + anon key from:
npx supabase status

# 3. App
npm install
npm run dev
# → http://127.0.0.1:5173
```

Studio: http://127.0.0.1:54323 · Auth health: http://127.0.0.1:54321/auth/v1/health

### Auth “fetch failed”

Almost always means Supabase is unreachable (Docker stopped, wrong `VITE_SUPABASE_URL`, or tunnel aimed at the app port instead of **54321**). Login/Register show a connectivity banner and actionable hints — not a raw network error.

| Setup | `VITE_SUPABASE_URL` |
|-------|---------------------|
| Local Docker | `http://127.0.0.1:54321` |
| Cloudflared → local API | `https://<tunnel>.trycloudflare.com` (port **54321** only) |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b` + production bundle |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run preview` | Preview production build |

## Stack

- React 19, React Router v7 (`React.lazy` + Suspense)
- TanStack Query + `@supabase/supabase-js`
- Tailwind v4 via `@import "tailwindcss"` + `@theme` in `src/index.css` (no `tailwind.config.js`)
- Recharts, lucide-react, tesseract.js (scan offer)

## Product modules

Overview · Candidates · Offers (forex + Chinese, scan offer, provision wording) · Interviews · Earnings (Estimated → Pending confirm) · Settings · Admin (role-gated)

Roles: `owner` > `admin` > `moderator` > `user`. Max **4** non-owner seats. Income isolated by RLS (`user_id = auth.uid()`).

## Edge Functions (service role)

Register seat-cap + Admin mutations need service role — browser never sees it:

```bash
npx supabase functions serve
# functions: register, admin-stats, admin-account
```

Without functions: client `signUp` still works (DB trigger enforces seat cap); Admin console falls back to a limited profile list.

## Env vars

See `.env.example`. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are client-side.
