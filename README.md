# Talent Desk

Forex recruiting command center — **Vite + React 19 + TypeScript + Tailwind CSS v4** static SPA.

Charcoal lime-glass UI (`#111` canvas, lime `#C6F432` conversion, peach kickers). Brand name **Talent Desk** everywhere.

**Production:** [talent-desk-leadforge3.vercel.app](https://talent-desk-leadforge3.vercel.app) (Vercel static SPA). Auth and desk data live in the browser (`localStorage`) on that device. Empty by default — no demo/seed KPIs. Optional JSON import/export in Settings.

There is **no Supabase**, no Docker, no Next.js, and no backend env.

## Prerequisites

- Node 20+

## Run locally

```bash
npm install
npm run dev
# → http://127.0.0.1:5173
```

Create an account on first visit; data stays in that browser. No `VITE_*` vars required (`.env.example` is a comment-only stub).

## Deploy on Vercel

1. Import `38plug/talent-desk` under the `leadforge3` team, or `vercel link` + `vercel --prod`.
2. No env vars required for the SPA.
3. `vercel.json` sets framework `vite`, build → `dist`, and SPA rewrites (`/(.*)` → `/index.html`).

Production alias: `https://talent-desk-leadforge3.vercel.app`

## Import existing data

Settings → **Import / export desk data**: paste or upload a `talent-desk-export` JSON file. Export from another device with the same format to move accounts + pipeline rows. See [`docs/local-data.md`](./docs/local-data.md).

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
- TanStack Query + browser `localStorage` (PBKDF2 auth)
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
| `/settings` | Profile, password, JSON import/export |
| `/admin` | Role-gated seats console |

Roles: `owner` > `admin` > `moderator` > `user`. Max **4** non-owner seats. Data is per account on the device.

## Docs

| File | Role |
|------|------|
| [`DESIGN.md`](./DESIGN.md) | Lime Glass Desk visual system |
| [`HANDOFF.md`](./HANDOFF.md) | Architecture, data, deploy invariants |
| [`PRODUCT.md`](./PRODUCT.md) | Users, purpose, capabilities |
| [`AGENTS.md`](./AGENTS.md) | Agent / contributor guardrails |
| [`docs/local-data.md`](./docs/local-data.md) | `localStorage` keys + export JSON |
