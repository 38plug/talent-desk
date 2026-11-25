# Talent Desk — System Handoff

> Ground truth is the shipped code, not prior intent.
> **Documented from:** `77c73fa84553e98e589b102a79c06bd6125b7c33` (2026-11-25, “Merge pull request #2 from 38plug/cursor/neon-ui-polish-e833” on `main`)
> **Visual system:** [`DESIGN.md`](./DESIGN.md) + [`.impeccable/design.json`](./.impeccable/design.json) — tokens extracted from `src/index.css` `@theme`.
> **Refresh this file** whenever the desk is built or rebuilt. If `HEAD` still matches **Documented from**, leave both docs untouched.

## What it is

Operate-mode **forex recruiting command center**: track candidates, scan offers (forex + Chinese packages), schedule interviews, and confirm estimated provision into income. One Vite SPA. There is no marketing site and no multi-product shell.

After sign-in (or demo UI preview):

1. **Overview** (`/`) — KPI heroes, neon charts, estimated list (confirm → Pending), Needs Attention, recent candidates.
2. **Candidates** (`/candidates`) — pipeline table, add modal, detail drawer (telegram / sent-by / stage).
3. **Offers** (`/offers`) — forex + Chinese, OCR scan + parse, provision wording, Telegram handle.
4. **Interviews** (`/interviews`) — schedule against a candidate / offer.
5. **Earnings** (`/earnings`) — Estimated → Pending (confirm) → Paid / Overdue; CSV export.
6. **Settings** (`/settings`) — profile + change password; pipeline stages listed as copy.
7. **Admin** (`/admin`) — role-gated seats console (owner / admin / moderator view; owner / admin manage).

Export is **table CSV**, not a payroll processor. Search in the header is chrome only.

## Surfaces

| Surface | Gate | Component / route |
| --- | --- | --- |
| Login | No session | `src/pages/LoginPage.tsx` |
| Register | No session | `src/pages/RegisterPage.tsx` |
| Boot | Session pending | `ProtectedRoute` + `PageLoader` |
| Desk shell | Session **or** demo UI | `AppShell` |
| Overview … Settings | Same | lazy pages under `AppShell` |
| Admin | `canViewAdmin(role)` | `AdminRoute` + `AdminPage` |

Unsigned visitors never see the desk unless they click **Preview Talent Desk UI** (only when `VITE_SUPABASE_*` is missing). `ProtectedRoute` waits on `AuthProvider.loading`, then `Navigate` to `/login` unless `session` or `localStorage['talent-desk-demo-ui'] === '1'`.

## Runtime topology

```
Browser (Vite 8 + React 19 + React Router 7)
  ├─ Studio accounts  →  supabase.auth (PKCE, persistSession)
  ├─ App data         →  @supabase/supabase-js + RLS  →  Postgres
  ├─ Register seats   →  Edge Function `register` (service role) or client signUp + DB trigger
  ├─ Admin mutations  →  Edge Functions `admin-stats` / `admin-account`
  ├─ Offer scan       →  tesseract.js in-browser OCR
  ├─ Offer translate  →  MyMemory (EN/PT stay; CJK/Cyrillic/etc. → PT)
  └─ Demo preview     →  localStorage + DEMO_METRICS (no writes)
```

- **Framework:** Vite 8, React 19, React Router 7 (`React.lazy` + Suspense), TanStack Query 5, Tailwind 4 (`@import "tailwindcss"` + `@theme` in `src/index.css` — no `tailwind.config`).
- **Dev server:** `npm run dev` → `http://127.0.0.1:5173` (`vite.config.ts` `host: true`, port 5173).
- **Build:** `tsc -b && vite build`. Lint: `oxlint`.
- **Auth:** `@supabase/supabase-js` GoTrue. Email/password. Local Studio auto-confirms (`enable_confirmations = false` in `supabase/config.toml`).
- **Data:** Postgres via local `npx supabase start` (API `54321`, Studio `54323`). RLS on every app table: `auth.uid() = user_id` (profiles: own row). Income is isolated per user.

## Auth

| Route / action | Role |
| --- | --- |
| `signInWithPassword` | Issue session (`LoginPage`) |
| `registerAccount` | Edge `register` then sign-in; fallback `signUp` if the function is down |
| **Preview Talent Desk UI** | `enableDemoUi()` — localStorage only; fake owner profile |
| `changePassword` | Re-auth with current password then `updateUser` |
| `AdminRoute` | `owner` / `admin` / `moderator` may view; `owner` / `admin` may manage |

Password rule: **≥ 8 characters**. Reserved owner email lives in `OWNER_EMAIL` (`src/lib/constants.ts`) and is mirrored in `handle_new_user` / `enforce_account_limit` / the `register` function — do not document the address here; do not let register mint that mailbox as `user`.

`supabaseConfigured` is false when URL/anon are missing or the anon still contains `your-anon`. Session bootstrap **soft-fails**: unreachable Supabase must not blank the auth screens.

Connectivity: `checkSupabaseHealth` probes `{VITE_SUPABASE_URL}/auth/v1/health`. Login/Register never show a raw `fetch failed` — they map through `friendlyAuthError` + `AuthConnectivityBanner`.

Max **4** non-owner seats (`MAX_ACCOUNTS`). The DB trigger is the last line of defense even when the Edge Function is absent.

## Data

Migration: `supabase/migrations/0001_init.sql`.

| Table | Purpose |
| --- | --- |
| `profiles` | `id` = `auth.users.id`, role `owner \| admin \| moderator \| user` |
| `offers` | Forex or Chinese package, commission/salary, telegram, visa/flight flags |
| `candidates` | Pipeline stage, offer FK, telegram, sent_by, expected salary |
| `interviews` | Candidate + optional offer, `scheduled_at`, outcome |
| `earnings` | Amount + `Estimated \| Pending \| Paid \| Overdue` |
| `activities` | Feed rows (`entity_type`, `message`) |

Roles: `owner` > `admin` > `moderator` > `user`. Pipeline: Screening → Interview → Offer → Accepted → Hired / Rejected. Offer status: Live / Paused / Closed. Offer category: `forex` | `chinese`.

`getDashboardData` returns `DEMO_METRICS` (`isDemo: true`) when candidates, offers, interviews, and earnings are all empty — so a fresh desk still paints. Confirming an estimated earning sets status to **Pending** (`confirmEarning`). Pending + Paid + Overdue count as income; Estimated does not until confirmed.

## Offers pipeline

1. Paste or **Scan** an image (`tesseract.js` worker in `OffersPage`).
2. `translateOfferText` leaves EN/PT; otherwise MyMemory `autodetect|pt` in ≤450-char chunks.
3. `parseOfferText` guesses `forex` vs `chinese` (accommodation / visa / flight / video-call hints), title, company, salary, provision, `%` vs fixed.
4. `upsertOffer` writes numeric fields through `parseNumericInput` (accepts `1.600` / `1,600` / `1.600,50`). Telegram stored **without** `@` (`stripAtHandle`); UI shows `@` via `ensureAtHandle`.

Chinese packages use `salary` + `commission` plus boolean visa / flight / accommodation / videoCall. Forex uses `salaryMin`/`salaryMax` + `commissionValue`.

## Persistence

| Store | What | Where |
| --- | --- | --- |
| Postgres | Users, profiles, candidates, offers, interviews, earnings, activities | Supabase |
| GoTrue session | JWT, PKCE | `localStorage` via supabase-js |
| `talent-desk-demo-ui` | Preview flag | `localStorage` |
| Tesseract | OCR WASM | In-browser, ephemeral |

There is no object storage. Header search does not query.

## File map

```
src/index.css                          → @theme tokens + mesh / card / nav / table CSS
src/main.tsx                           → StrictMode mount
src/App.tsx                            → QueryClient + AuthProvider + routes
src/auth/AuthProvider.tsx              → session, profile, demo owner fallback
src/auth/ProtectedRoute.tsx            → session | demo UI; AdminRoute
src/auth/demoUi.ts                     → talent-desk-demo-ui
src/pages/LoginPage.tsx
src/pages/RegisterPage.tsx
src/pages/DashboardPage.tsx
src/pages/CandidatesPage.tsx
src/pages/OffersPage.tsx
src/pages/InterviewsPage.tsx
src/pages/EarningsPage.tsx
src/pages/SettingsPage.tsx
src/pages/AdminPage.tsx
src/components/layout/AppShell.tsx     → rail + header
src/components/auth/AuthConnectivityBanner.tsx
src/components/ui/*                    → Button, Input, Card, Badge, Modal, charts
src/lib/api.ts                         → all Supabase CRUD + register/admin
src/lib/supabase.ts                    → client, health, friendly errors
src/lib/constants.ts                   → APP_NAME, roles, stages, nav
src/lib/types.ts
src/lib/demo-data.ts                   → DEMO_METRICS + SPARK_SERIES
src/lib/parse-offer.ts
src/lib/utils.ts                       → cn, money, telegram handles
supabase/migrations/0001_init.sql
supabase/functions/register/index.ts
supabase/functions/admin-stats/index.ts
supabase/functions/admin-account/index.ts
```

## Invariants for the next build

1. **Auth screen first.** Do not put Overview on an anonymous first paint unless demo UI is explicitly enabled.
2. **Per-user rows only.** RLS `auth.uid() = user_id`. Do not share earnings across seats.
3. **Four-seat cap.** Non-owner profiles ≤ `MAX_ACCOUNTS`. Owner mailbox stays reserved (`OWNER_EMAIL`).
4. **Confirm estimated → Pending.** `confirmEarning` must not jump straight to Paid. Estimated is not income.
5. **Register falls back.** Missing Edge Function still uses `signUp`; the DB trigger still enforces the cap. Do not require functions for a first hire.
6. **Friendly auth errors.** Never surface raw `fetch failed`. Probe `/auth/v1/health`.
7. **Soft-fail session bootstrap.** Unreachable Supabase must still render Login/Register.
8. **Visual world is The Neon Signal Desk.** New UI goes through `DESIGN.md` (violet conversion, cyan focus, magenta register, Plus Jakarta / JetBrains Mono). Do not introduce a second product look.
9. **Demo metrics are a preview.** Banner must stay while `isDemo`. Do not pretend DEMO_METRICS are live money.
10. **Do not commit secrets.** `VITE_SUPABASE_ANON_KEY` stays in env. Service role stays in Edge Function env only. The in-repo supabase client may use a placeholder JWT string — never a real key.

## How this documentation stays current

An hourly Cursor automation (“Design and System documentation”) compares `HEAD` on `main` to the **Documented from** SHA above.

- If the SHA matches and `DESIGN.md` / `HANDOFF.md` exist, it reports **No changes**.
- If the desk was built or rebuilt (new commits touching UI, auth, offers/scan, tokens, or shell), it re-extracts the visual system into `DESIGN.md` + `.impeccable/design.json` and rewrites this handoff from the shipped artifact.
- Confirmed incumbent decisions stay; the build wins where they diverge.
- Track `main`. If a rebuild branch diverges, document the branch that holds the live desk until it is merged.
- Do not commit secrets, env values, or identity tokens into either file.
