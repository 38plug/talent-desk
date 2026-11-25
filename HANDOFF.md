# Talent Desk — System Handoff

> Ground truth is the shipped code, not prior intent.
> **Documented from:** strip-supabase localStorage rebuild (2026-11-25)
> **Visual system:** [`DESIGN.md`](./DESIGN.md) + [`.impeccable/design.json`](./.impeccable/design.json)
> **Refresh this file** whenever the desk is built or rebuilt.

## What it is

Operate-mode **forex recruiting command center**: track candidates, scan offers (forex + Chinese packages), schedule interviews, and confirm estimated provision into income. One Vite static SPA on Vercel. No Supabase, no Edge Functions, no backend env.

After sign-in:

1. **Overview** (`/`) — KPI heroes, neon charts, estimated list (confirm → Pending), Needs Attention, recent candidates. Empty desk → zeros (no demo seed).
2. **Candidates** (`/candidates`) — pipeline table, add modal, detail drawer.
3. **Offers** (`/offers`) — forex + Chinese, OCR scan + parse, provision wording, Telegram.
4. **Interviews** (`/interviews`) — schedule against a candidate / offer.
5. **Earnings** (`/earnings`) — Estimated → Pending (confirm) → Paid / Overdue; CSV export.
6. **Settings** (`/settings`) — profile, change password, **JSON import/export**.
7. **Admin** (`/admin`) — role-gated seats console (local accounts on this device).

## Surfaces

| Surface | Gate | Component / route |
| --- | --- | --- |
| Login | No session | `src/pages/LoginPage.tsx` |
| Register | No session | `src/pages/RegisterPage.tsx` |
| Boot | Session pending | `ProtectedRoute` + `PageLoader` |
| Desk shell | Session required | `AppShell` |
| Overview … Settings | Same | lazy pages under `AppShell` |
| Admin | `canViewAdmin(role)` | `AdminRoute` + `AdminPage` |

Unsigned visitors always go to `/login`. No demo-preview bypass.

## Runtime topology

```
Browser (Vite 8 + React 19 + React Router 7)
  ├─ Accounts + session  →  localStorage (PBKDF2 password hashes)
  ├─ Desk data           →  localStorage (candidates, offers, interviews, earnings, activities)
  ├─ Import / export     →  Settings JSON (format: talent-desk-export)
  ├─ Offer scan          →  tesseract.js in-browser OCR
  └─ Offer translate     →  MyMemory (EN/PT stay; CJK/Cyrillic/etc. → PT)
```

- **Framework:** Vite 8, React 19, React Router 7 (`React.lazy` + Suspense), TanStack Query 5, Tailwind 4 (`@theme` in `src/index.css`).
- **Auth:** email/password against localStorage accounts. First account (or `OWNER_EMAIL`) becomes `owner`. Max 4 non-owner seats.
- **Data:** per-account rows in `talent-desk.data.v1`. Empty by default.
- **Hosting:** Vercel static (`vercel.json` → `dist` + SPA rewrites). Project: `leadforge3/talent-desk` → `https://talent-desk-leadforge3.vercel.app`
- **No env required.** No `VITE_SUPABASE_*`.

## Key files

| Path | Role |
| --- | --- |
| `src/lib/local-db.ts` | localStorage accounts, CRUD, import/export, auth helpers |
| `src/lib/api.ts` | App-facing API wrapping local-db + dashboard metrics |
| `src/auth/AuthProvider.tsx` | Session from localStorage; `notifyAuthChanged` after login/register |
| `src/pages/SettingsPage.tsx` | Password + JSON import/export |
| `vercel.json` | Vite SPA deploy |

## Invariants

1. Brand is **Talent Desk** (never “Neon desk” / “NEON DESK” as product name).
2. Empty desk shows zero KPIs — never invent demo income/candidates.
3. No `@supabase/*`, no connectivity banner, no Edge Functions.
4. Data is device-local; move desks via Settings JSON export/import.
5. Keep `vercel.json` SPA rewrites to `index.html`.
