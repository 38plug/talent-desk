# Talent Desk

Forex recruiting command center — **Vite + React 19 + TypeScript + Tailwind CSS v4** static SPA.

Neon dark UI (violet / cyan / magenta). Brand name **Talent Desk** everywhere.

**Production:** Vercel static SPA. Auth and desk data live in the browser (`localStorage`) on that device. Empty by default — no demo/seed KPIs. Optional JSON import/export in Settings.

## Prerequisites

- Node 20+

## Run locally

```bash
npm install
npm run dev
# → http://127.0.0.1:5173
```

No `VITE_SUPABASE_*` or other backend env. Create an account on first visit; data stays in that browser.

## Deploy on Vercel

1. Import `38plug/talent-desk` (Git) under the `leadforge3` team, or `vercel link` + `vercel --prod`.
2. No env vars required for the SPA.
3. `vercel.json` sets Vite → `dist` and SPA rewrites.

Production project alias: `https://talent-desk-leadforge3.vercel.app`

## Import existing data

Settings → **Import / export desk data**: paste or upload a `talent-desk-export` JSON file. Export from another device with the same format to move accounts + pipeline rows.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production bundle |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run preview` | Preview production build |

## Stack

- React 19, React Router v7 (`React.lazy` + Suspense)
- TanStack Query + browser `localStorage`
- Tailwind v4 (`@import "tailwindcss"` + `@theme` in `src/index.css`)
- Recharts, lucide-react, tesseract.js (scan offer)

## Modules

Overview · Candidates · Offers (forex + Chinese, scan, provision, Telegram) · Interviews · Earnings · Settings (import/export) · Admin (role-gated)

Roles: `owner` > `admin` > `moderator` > `user`. Max **4** non-owner seats. Data is per account on the device.
