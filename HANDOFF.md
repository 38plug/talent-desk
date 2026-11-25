# Talent Desk — System Handoff

> Ground truth is the shipped code, not prior intent.
> **Documented from:** `fdaebab8cb202243a71cf22c65047673b81e2db2` (2026-11-25, “Improve sidebar hover pill and page transition motion (#15)” on `main`)
> **Visual system:** [`DESIGN.md`](./DESIGN.md) + [`.impeccable/design.json`](./.impeccable/design.json) — tokens from `src/index.css` `@theme` (lime-glass at `a0ef48c`). Occupied-glass type/padding from PRs #8–#9. Overlay portal from PRs #10–#11. Candidate profile + delete from PRs #12–#13. Offer glass preview from PR #14. Hover pill, collapsed tooltip, spring page enter from PR #15.
> **Refresh this file** whenever the desk is built or rebuilt. If `HEAD` still matches **Documented from**, leave both docs untouched.

## What it is

Operate-mode **forex recruiting command center**: track candidates, scan offers (forex + Chinese packages), schedule interviews, and confirm estimated provision into income. One Vite static SPA on Vercel. Auth and desk data live in the browser (`localStorage`). There is no Supabase, no Edge Functions, no marketing site, and no demo-preview bypass.

After sign-in:

1. **Overview** (`/`) — KPI heroes, neon charts, estimated list (confirm → Pending), Needs Attention, recent candidates. Empty desk → zeros (no demo seed).
2. **Candidates** (`/candidates`) — pipeline table (name, location, stage, source, offer), Add/Edit modal (`wide`), detail drawer, **Delete** with a named confirm modal. Profile fields: country, age, languages, current location (migrated on load; older rows stay). Delete cascades interviews + earnings linked by candidate id; offers stay.
3. **Offers** (`/offers`) — forex + Chinese cards. Click a card (Enter/Space) opens a wide **glass preview** modal (`Modal glass`) with full details. Card Edit/Delete `stopPropagation`. OCR scan + parse, provision wording, Telegram handle.
4. **Interviews** (`/interviews`) — schedule against a candidate / offer.
5. **Earnings** (`/earnings`) — Estimated → Pending (confirm) → Paid / Overdue; CSV export.
6. **Settings** (`/settings`) — profile, change password, **JSON import/export**, pipeline copy.
7. **Admin** (`/admin`) — role-gated seats console (local accounts on this device; owner / admin manage).

Export is **table CSV** plus a Settings **JSON dump**. Header search is chrome only.

## Surfaces

| Surface | Gate | Component / route |
| --- | --- | --- |
| Login | No session | `src/pages/LoginPage.tsx` + `AuthShell` |
| Register | No session | `src/pages/RegisterPage.tsx` + `AuthShell` |
| Boot | Session pending | `ProtectedRoute` + `PageLoader` |
| Desk shell | Session required | `AppShell` (hover pill, collapsed glass tooltip) |
| Overview … Settings | Same | lazy pages under `AppShell` + `PageTransition` (`springSoft` opacity/y; no CSS filter on wrapper) |
| Overlays | Any desk page | `Modal` / `Drawer` portal to `document.body` (`z-[200]`, `springSnappy` on the panel). Offer preview uses `glass`. |
| Admin | `canViewAdmin(role)` | `AdminRoute` + `AdminPage` |

Unsigned visitors always go to `/login`. There is no `talent-desk-demo-ui` flag.

## Runtime topology

```
Browser (Vite 8 + React 19 + React Router 7)
  ├─ Accounts + session  →  localStorage (PBKDF2-SHA-256, 100k iterations)
  ├─ Desk data           →  localStorage (candidates, offers, interviews, earnings, activities)
  ├─ Import / export     →  Settings JSON (format: talent-desk-export)
  ├─ Offer scan          →  tesseract.js in-browser OCR
  ├─ Offer translate     →  MyMemory (EN/PT stay; CJK/Cyrillic/etc. → PT)
  ├─ Motion              →  framer-motion + GSAP slide-pill
  └─ SFX                 →  Web Audio (muted by default)
```

- **Framework:** Vite 8, React 19, React Router 7 (`React.lazy` + Suspense), TanStack Query 5, Tailwind 4 (`@import "tailwindcss"` + `@theme` in `src/index.css` — no `tailwind.config`). Framer Motion 14, GSAP 3.
- **Dev server:** `npm run dev` → `http://127.0.0.1:5173` (`vite.config.ts` `host: true`, port 5173).
- **Build:** `tsc -b && vite build`. Lint: `oxlint`. Output: `dist`.
- **Host:** Vercel SPA (`vercel.json`: framework `vite`, `npm run build` → `dist`, rewrite `/(.*)` → `/index.html`). `.vercel` is gitignored.
- **Auth:** email/password against `talent-desk.accounts.v1`. First account (or reserved `OWNER_EMAIL`) becomes `owner`. Max 4 non-owner seats.
- **Data:** per-device rows in `talent-desk.data.v1`. Empty by default. `getDashboardData` returns honest zeros (`isDemo: false`) — never `DEMO_METRICS`.
- **No env required.** `.env.example` is a comment-only stub. No `VITE_SUPABASE_*`.
- **Production alias (README):** `https://talent-desk-leadforge3.vercel.app`

## Hosting

Production is a static Vite SPA on Vercel. Client-side routes (`/candidates`, `/offers`, …) need the rewrite in `vercel.json` or they 404 on refresh.

| Path | Notes |
| --- | --- |
| GitHub import | Framework **Vite**, root `.`, build `npm run build`, output `dist` |
| Env | None required |
| Data | Device-local. Move desks via Settings JSON export/import |
| Claim | An agent may leave a temporary Vercel deploy with a claim link (~60 min). After claim: `vercel link` or dashboard import |

Do not reintroduce `VITE_*` backend URLs. Do not put service-role keys anywhere.

## Auth

| Route / action | Role |
| --- | --- |
| `loginAccount` / `signIn` | Issue session (`LoginPage`) |
| `registerAccount` | First account or reserved owner mailbox → `owner`; else `user` if under the seat cap |
| `changePassword` | Re-hash with a new salt after verifying the current password |
| `AdminRoute` | `owner` / `admin` / `moderator` may view; `owner` / `admin` may manage |

Password rule: **≥ 8 characters**. Passwords are PBKDF2-SHA-256 (100,000 iterations) + 16-byte salt, stored in `localStorage`. Reserved owner email lives in `OWNER_EMAIL` (`src/lib/constants.ts`) — do not document the address here; do not let register mint that mailbox as `user`.

`ProtectedRoute` waits on `AuthProvider.loading`, then `Navigate` to `/login` unless a session exists. After login/register, pages call `notifyAuthChanged()` so the provider re-reads `talent-desk.session.v1`.

Max **4** non-owner seats (`MAX_ACCOUNTS`). The register path in `local-db.ts` is the cap.

## Data

Store: `src/lib/local-db.ts`. App façade: `src/lib/api.ts`. Schema notes: `docs/local-data.md`.

| Key | Contents |
| --- | --- |
| `talent-desk.accounts.v1` | Accounts (email, role, PBKDF2 hash + salt) |
| `talent-desk.data.v1` | Candidates, offers, interviews, earnings, activities |
| `talent-desk.session.v1` | `{ userId, email }` |
| `talent-desk.sidebar-collapsed` | `'1'` / `'0'` |
| `talent-desk.sfx-muted` | `'1'` (default) / `'0'` |

| Entity | Purpose |
| --- | --- |
| profiles (derived) | From the account row: role `owner \| admin \| moderator \| user` |
| offers | Forex or Chinese package, commission/salary, telegram, visa/flight flags |
| candidates | Pipeline stage, offer FK, telegram, sent_by, country, age, languages, currentLocation, expected salary |
| interviews | Candidate + optional offer, `scheduled_at`, outcome |
| earnings | Amount + `Estimated \| Pending \| Paid \| Overdue` |
| activities | Feed rows (`entity_type`, `message`) |

Roles: `owner` > `admin` > `moderator` > `user`. Pipeline: Screening → Interview → Offer → Accepted → Hired / Rejected. Offer status: Live / Paused / Closed. Offer category: `forex` | `chinese`.

Confirming an estimated earning sets status to **Pending** (`confirmEarning`). Pending + Paid + Overdue count as income; Estimated does not until confirmed.

Import **replaces** accounts + data on that device. Settings download exports hashes+salts (`includePasswords: true` currently means hash/salt, not plaintext). Import also accepts a one-time plaintext `"password"` per account.

`migrateCandidate` fills missing `country` / `age` / `languages` / `currentLocation` with null on load and import — it does not wipe older rows.

`deleteCandidateRow` removes the candidate and any interviews/earnings with that `candidateId` for the same user. Linked offers are not deleted. Confirm UI names the candidate before the mutation runs.

## Offers pipeline

1. Paste or **Scan** an image (`tesseract.js` worker in `OffersPage`).
2. `translateOfferText` leaves EN/PT; otherwise MyMemory `autodetect|pt` in ≤450-char chunks.
3. `parseOfferText` guesses `forex` vs `chinese` (accommodation / visa / flight / video-call hints), title, company, salary, provision, `%` vs fixed.
4. `upsertOffer` writes numeric fields through `parseNumericInput` (accepts `1.600` / `1,600` / `1.600,50`). Telegram stored **without** `@` (`stripAtHandle`); UI shows `@` via `ensureAtHandle`.

Chinese packages use `salary` + `commission` plus boolean visa / flight / accommodation / videoCall. Forex uses `salaryMin`/`salaryMax` + `commissionValue`.

## Persistence

| Store | What | Where |
| --- | --- | --- |
| `localStorage` | Accounts, session, pipeline rows | This browser only |
| Tesseract | OCR WASM | In-browser, ephemeral |
| SFX / rail | Mute + collapse prefs | `localStorage` |

There is no object storage, no Postgres, no GoTrue. Header search does not query.

## File map

```
src/index.css                          → @theme tokens + mesh / glass / card / nav / table CSS
src/main.tsx                           → StrictMode mount
src/App.tsx                            → QueryClient + AuthProvider + routes
src/auth/AuthProvider.tsx              → session from localStorage; notifyAuthChanged
src/auth/ProtectedRoute.tsx            → session required; AdminRoute
src/pages/LoginPage.tsx
src/pages/RegisterPage.tsx
src/pages/DashboardPage.tsx
src/pages/CandidatesPage.tsx          → add/edit (wide modal), drawer, named delete confirm
src/pages/OffersPage.tsx              → card grid + glass preview modal; Edit/Delete stopPropagation
src/pages/InterviewsPage.tsx
src/pages/EarningsPage.tsx
src/pages/SettingsPage.tsx              → password + JSON import/export
src/pages/AdminPage.tsx
src/components/layout/AppShell.tsx     → collapsible rail + hover pill + glass tooltip + header
src/components/auth/AuthShell.tsx      → orbs + glass card + sound toggle
src/components/motion/*                → PageTransition (springSoft opacity/y, no filter), Motion, AnimatedNumber, SoundToggle
src/components/ui/*                    → Button, Input, Card (p-6, CardTitle text-xl), Badge, Modal/Drawer (body portal, springSnappy, glass), charts
src/lib/api.ts                         → app façade over local-db
src/lib/local-db.ts                    → accounts, CRUD, import/export, PBKDF2
src/lib/constants.ts                   → APP_NAME, roles, stages, nav
src/lib/types.ts
src/lib/demo-data.ts                   → SPARK_SERIES shapes only (not KPI values)
src/lib/parse-offer.ts
src/lib/motion.ts                      → springSoft, springSnappy, fadeUp, fadeScale, stagger
src/lib/slide-pill.ts                  → GSAP stretchy lime pill (hover+active, killTweens)
src/lib/sfx.ts                         → Web Audio, muted by default
src/lib/utils.ts                       → cn, money, telegram handles
docs/local-data.md                     → localStorage keys + export JSON
vercel.json                            → Vite SPA: dist + client rewrites
README.md                              → local setup + Vercel runbook
```

## Motion / SFX (shipped)

| Token | Where |
| --- | --- |
| GSAP slide-pill (lead 0.32s `power3.out`, trail 0.52s `power3.inOut`, killTweens) | Rail hovered or active item |
| `.nav-item-icon` scale 1.08 / 1.06 | Focused / active nav icon |
| `.nav-tooltip` 70ms in / 180ms out | Collapsed rail labels |
| Page `springSoft` y:14 in / y:-8 0.2s out (no CSS filter on wrapper) | `PageTransition` |
| Overlay fade 0.2s; panel `springSnappy` blur-scale | `Modal` / `Drawer` |
| `Modal glass` | Offer preview |
| `fadeUp` + stagger 0.07 | Dashboard, auth form |
| `AnimatedNumber` | KPIs, gauge, live-desk money |
| `thud` | Collapse, mobile menu |
| `bass` | Nav click, Open candidates |
| `pop` / `hover` / `tap` | Focus, hover (skip pop on already-active nav), buttons |
| `success` | Login, register, confirm earning |
| `whoosh` | Sign out, auth link |

`prefers-reduced-motion`: snap the pill, skip page transition, opacity-only overlays at 0.01s, skip SFX, collapse CSS animations to 0.01ms.

## Leftovers (not canon)

- Settings “Visual system” copy and swatches still list violet / cyan / magenta as the brand. Shipped tokens are lime-glass — `DESIGN.md` wins.
- `Input` / `Textarea` / `Select` still use a **violet** focus ring; header search and `:focus-visible` are lime. New fields should follow lime.
- `EmptyState` eyebrow is still `text-violet-glow`; `Spinner` is still violet/cyan. Prefer peach kickers and lime spinners on new work.
- `button` magenta / cyan variants remain in the API; register is lime, not magenta.
- `SPARK_SERIES` in `demo-data.ts` is decorative spark shape, not live income.
- Drawer still allows inline telegram/sent-by/stage patches; full profile edits go through the wide Add/Edit modal.

## Invariants for the next build

1. **Auth screen first.** Do not put Overview on an anonymous first paint. Do not restore a demo-UI bypass.
2. **Device-local rows only.** Accounts and pipeline live in `localStorage` on this browser. Do not share earnings across devices without an explicit JSON import.
3. **Four-seat cap.** Non-owner accounts ≤ `MAX_ACCOUNTS`. Owner mailbox stays reserved (`OWNER_EMAIL`).
4. **Confirm estimated → Pending.** `confirmEarning` must not jump straight to Paid. Estimated is not income.
5. **Empty desk is zeros.** Never invent `DEMO_METRICS` as live money. The Overview banner must stay while the pipeline is empty.
6. **Friendly auth errors.** Map through `friendlyAuthError`. Do not surface stack traces on login.
7. **Visual world is The Lime Glass Desk.** New UI goes through `DESIGN.md` (lime conversion, peach kickers, charcoal `#111`, Plus Jakarta / JetBrains Mono, stretchy pill, glass Overview, occupied type). Do not restore The Neon Signal Desk (violet conversion, `#080A10`, magenta inset nav).
8. **SFX stay muted by default.** Do not auto-unmute. Honor `prefers-reduced-motion`.
9. **No backend env.** Do not reintroduce `@supabase/*`, Edge Functions, or `VITE_SUPABASE_*` unless a later rebuild explicitly adds a server.
10. **Do not commit secrets.** Password hashes, salts, and export JSON with credentials stay out of git. Do not print `OWNER_EMAIL` in docs.
11. **Vercel is a SPA, not an SSR host.** Keep `vercel.json` rewrites to `index.html`.
12. **Overlays live on `document.body`.** Do not put CSS `filter` on `PageTransition`. Do not put `backdrop-blur` on the modal overlay. Framer blur on the **dialog panel** during open is the preview motion.
13. **Candidate delete is named + cascading.** Confirm modal must show the name. Cascade interviews and earnings; never delete the linked offer. Profile fields migrate; do not wipe older rows.
14. **Nav pill follows hover and active.** Kill in-flight GSAP tweens. Collapsed labels are the glass tooltip, not a native `title`.
15. **Offer cards open a glass preview.** Edit/Delete on the card must `stopPropagation`. Preview uses `Modal` `wide` + `glass`.

## How this documentation stays current

An hourly Cursor automation (“Design and System documentation”) compares `HEAD` on `main` to the **Documented from** SHA above.

- If the SHA matches and `DESIGN.md` / `HANDOFF.md` exist, it reports **No changes**.
- If the desk was built or rebuilt (new commits touching UI, auth, offers/scan, tokens, shell, motion/SFX, local-db, or hosting/deploy), it re-extracts the visual system into `DESIGN.md` + `.impeccable/design.json` when visuals moved, and rewrites this handoff from the shipped artifact. Hosting-only commits refresh this file and leave `DESIGN.md` tokens in place.
- Confirmed incumbent decisions stay; the build wins where they diverge.
- Track `main`. If a rebuild branch diverges, document the branch that holds the live desk until it is merged.
- Do not commit secrets, env values, identity tokens, or account JSON into either file.
