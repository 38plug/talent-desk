# Talent Desk

Forex recruiting command center — **Vite + React 19 + TypeScript + Tailwind CSS v4** static SPA.

Charcoal lime-glass UI (`#111` canvas, lime `#C6F432` conversion, peach kickers). Brand name **Talent Desk** everywhere.

**Production:** [talent-desk-leadforge3.vercel.app](https://talent-desk-leadforge3.vercel.app) (Vercel static SPA).

**Persistence:** optional **hosted Supabase** cloud sync (shared team desk across devices). Without `VITE_SUPABASE_*`, auth + desk data stay in browser `localStorage` on that device. Empty by default — no demo/seed KPIs.

## Prerequisites

- Node 20+
- (Cloud sync) A free [Supabase](https://supabase.com) project — no Docker required

## Run locally

```bash
npm install
cp .env.example .env   # optional — leave placeholders for localStorage mode
npm run dev
# → http://127.0.0.1:5173
```

## Cloud sync (shared desk)

See **[`docs/cloud-sync.md`](./docs/cloud-sync.md)** for the full checklist.

1. Create a hosted Supabase project.
2. Run [`supabase/migrations/0001_shared_desk.sql`](./supabase/migrations/0001_shared_desk.sql) in the SQL Editor.
3. Disable email confirmation for the team desk (Auth → Providers → Email).
4. Set on Vercel (and local `.env`):

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. Redeploy. Register owner + teammates. First login auto-uploads local desk when cloud is empty.

**Do not enable production sync until those secrets are set.** The SPA ships safely in localStorage mode when env is unset.

## Deploy on Vercel

1. Import `38plug/talent-desk` under the `leadforge3` team, or `vercel link` + `vercel --prod`.
2. Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` for cloud sync (optional).
3. `vercel.json` sets framework `vite`, build → `dist`, and SPA rewrites (`/(.*)` → `/index.html`).

Production alias: `https://talent-desk-leadforge3.vercel.app`

## Import existing data

Settings → **Import / export desk data**, or **Upload this browser’s local desk to cloud** when sync is on. Format: `talent-desk-export`. See [`docs/local-data.md`](./docs/local-data.md) and [`docs/cloud-sync.md`](./docs/cloud-sync.md).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (`127.0.0.1:5173`) |
| `npm run build` | Typecheck + production bundle → `dist` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `oxlint` |
| `npm run preview` | Preview production build |

## Stack

- React 19, React Router v7 (`React.lazy` + Suspense)
- TanStack Query + localStorage **or** `@supabase/supabase-js` (feature-flagged)
- Tailwind v4 (`@import "tailwindcss"` + `@theme` in `src/index.css`)
- Framer Motion + GSAP (stretchy lime nav pill)
- Web Audio SFX (muted by default)
- Recharts, lucide-react, tesseract.js (scan offer)

## Modules

| Route | Module |
|-------|--------|
| `/` | Overview — KPI heroes, neon charts, estimated confirm, needs attention |
| `/candidates` | Pipeline table — country / age / languages / currentLocation, market Forex\|Chinese, gender Male\|Female, edit / delete |
| `/offers` | Forex + Chinese cards — click opens glass preview animation; OCR scan, provision, Telegram |
| `/interviews` | Schedule against candidate / offer |
| `/earnings` | Estimated → Pending (confirm) → Paid / Overdue; CSV export |
| `/settings` | Profile, password, JSON import/export, cloud upload |
| `/admin` | Role-gated seats console |

Roles: `owner` > `admin` > `moderator` > `user`. Max **4** non-owner seats. Cloud mode shares the full desk across authenticated teammates.

## Docs

| File | Role |
|------|------|
| [`DESIGN.md`](./DESIGN.md) | Lime Glass Desk visual system |
| [`HANDOFF.md`](./HANDOFF.md) | Architecture, data, deploy invariants |
| [`PRODUCT.md`](./PRODUCT.md) | Users, purpose, capabilities |
| [`AGENTS.md`](./AGENTS.md) | Agent / contributor guardrails |
| [`docs/local-data.md`](./docs/local-data.md) | `localStorage` keys + export JSON |
| [`docs/cloud-sync.md`](./docs/cloud-sync.md) | Hosted Supabase setup |
