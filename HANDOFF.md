# Talent Desk — System Handoff

> Ground truth is the shipped code, not prior intent.
> **Documented from:** `e6ebd6ae8a392874ae8558f8ef1296068b2a20bb` (docs refresh after PR #36 — interview stage sync, Confirmed/Declined, Telegram tabs, header bell; product = Vite SPA + optional cloud)
> **Visual system:** [`DESIGN.md`](./DESIGN.md) + [`.impeccable/design.json`](./.impeccable/design.json) — tokens from `src/index.css` `@theme` (lime-glass). Occupied-glass type/padding from PRs #8–#9. Overlay portal from PRs #10–#11. Candidate profile + delete from PRs #12–#13. Offer glass preview from PR #14. Hover pill, collapsed tooltip, spring page enter from PR #15. Candidate Forex/Chinese market chips from PR #16. Male/Female gender chips from PR #17. Admin accounts table + role badges from PRs #19–#20 (no token rebuild). Full shared desk (no `forUser`; seat delete keeps rows) from PR #21. Cloud sync (hosted Supabase feature flag + Settings storage/upload chrome) from PR #22. Languages column + icon-only row actions from PR #23. Glowing DeskTotalsStrip from PRs #24 + #28. Interview Calendar (`/calendar`) from PR #25. HeaderClock from PR #27. Offer-preview linked candidates + `?id=` drawer hold from PR #26. Interview start toast + OS Notification from PR #29. Personal Telegram (`/telegram`, teleproto) from PR #31. Header activity bell from PR #32. 1s live poll of bell + open Telegram thread from PR #33. Telegram Chats vs Groups + unread cap from PR #34. Past-interview Confirmed/Declined + Estimated commission from PR #35. Candidate stage auto-sync from interviews from PR #36. Tokens unchanged.
> **Product / agent docs:** [`PRODUCT.md`](./PRODUCT.md), [`AGENTS.md`](./AGENTS.md), [`README.md`](./README.md), [`docs/local-data.md`](./docs/local-data.md), [`docs/cloud-sync.md`](./docs/cloud-sync.md)
> **Refresh this file** whenever the desk is built or rebuilt. If `HEAD` still matches **Documented from** and product facts are unchanged, leave handoff + design untouched.

## What it is

Operate-mode **forex recruiting command center**: track candidates, scan offers (forex + Chinese packages), schedule interviews, and confirm estimated provision into income. One Vite static SPA on Vercel. Persistence is **hosted Supabase** when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set (shared team desk + realtime); otherwise browser `localStorage`. No Docker requirement, no marketing site, and no demo-preview bypass.

After sign-in:

1. **Overview** (`/`) — KPI heroes, neon charts, estimated list (confirm → Pending), Needs Attention, recent candidates. Empty desk → zeros (no demo seed).
2. **Candidates** (`/candidates`) — shared **DeskTotalsStrip** at the top (glowing unfiltered **Total candidates / offers / interviews**; lime glow + `AnimatedNumber`; respects `prefers-reduced-motion`; refreshes on add/delete / realtime). Same strip also tops Offers + Interviews. Pipeline table (name, **languages** column, market, gender, location, stage, source, offer), Add/Edit modal (`wide`), detail drawer, **Delete** with a named confirm modal. Row actions: Schedule interview (→ `/calendar?candidate=`), Edit, Delete — icon-only (aria-label + title). Drawer also has Schedule interview. Deep-link `?id=<candidateId>` opens the detail drawer (from Offer preview; param kept until drawer close). Profile fields: country, age, languages, current location, **market** (`forex` | `chinese` | null), **gender** (`male` | `female` | null) — migrated on load; older rows stay unset. Filters: stage, market (incl. Unset), gender (incl. Unset). Delete cascades interviews + earnings linked by candidate id; offers stay.
3. **Offers** (`/offers`) — forex + Chinese cards. Click a card (Enter/Space) opens a wide **glass preview** modal (`Modal glass`) with full details plus a **Candidates** section (rows whose `offerId` matches; name / stage / market / link to `/candidates?id=`; empty copy when none). Card Edit/Delete are icon-only (`stopPropagation`, aria-label + title). OCR scan + parse, provision wording, Telegram handle.
4. **Interviews** (`/interviews`) — list upcoming / past; schedule against a candidate / offer. Link through to the calendar. **Stage sync** (`upsertInterview` / `interview-stage.ts`): schedule → candidate **Interview**; **Confirmed** → **Accepted** + Estimated earning; **Declined by company** → **Rejected**. Candidates page reconciles stages from latest interviews on load. **Start alerts:** within ~1 min of `scheduledAt` (grace ~2 min after), `InterviewReminderWatcher` (in `AppShell`) fires an in-app toast + browser `Notification` when permitted; Settings **Interview alerts** toggle + Interviews “Allow alerts” prompt. Pref `talent-desk.interview-reminders.v1`; fired ids in `talent-desk.interview-reminded.v1`. Desk tab must be open/recent — no server push.
5. **Interview Calendar** (`/calendar`) — month / week / day views of `scheduledAt`. Create or edit via modal (candidate picker + datetime). Deep-link `?candidate=<id>` opens the schedule modal preselected (from Candidates row / drawer).
6. **Earnings** (`/earnings`) — Estimated → Pending (confirm) → Paid / Overdue; per-row status select; CSV export. Interview **Confirmed** seeds Estimated awaiting.
7. **Telegram** (`/telegram`) — personal MTProto client (teleproto, **not** a bot): api_id/api_hash from my.telegram.org (env `VITE_TELEGRAM_*` or paste on page → `talent-desk.telegram-api.v1`); phone + code (+ 2FA); session `talent-desk.telegram-session.v1`. Dialog list splits **Chats** (private DMs) vs **Groups** (groups/channels) with lime selected tab, `999+` unread cap, then message pane + send; side panel matches `@username` / name to desk candidates. Unofficial client — account-limit risk; session stays in this browser.
8. **Settings** (`/settings`) — profile, **Storage** row (cloud vs this-browser), **Interview alerts** (reminders + Notification permission), change password, **JSON import/export**. When `cloudSync`: a **Cloud sync** card with “Upload this browser’s local desk to cloud”. Pipeline copy.
9. **Admin** (`/admin`) — role-gated seats console. KPI cards: seats used, accounts, pipeline row totals, estimated aggregate. Accounts table with role `Select`. Local mode: password/delete + Add account. Cloud mode: role change + delete profile row still work; Add account / set password / reset **throw** (create seats via Register or Dashboard; password via Dashboard). Owner / admin manage; moderator is view-only.

Export is **table CSV** plus a Settings **JSON dump**. Header search is chrome only.

## Surfaces

| Surface | Gate | Component / route |
| --- | --- | --- |
| Login | No session | `src/pages/LoginPage.tsx` + `AuthShell` |
| Register | No session | `src/pages/RegisterPage.tsx` + `AuthShell` |
| Boot | Session pending | `ProtectedRoute` + `PageLoader` |
| Desk shell | Session required | `AppShell` (hover pill, collapsed glass tooltip, HeaderClock, header notification bell, InterviewReminderWatcher) |
| Telegram | Session required | `TelegramPage` (`/telegram`, nav `07`) — creds/phone/code/2FA on `.card-surface`, then dialogs / thread / candidate match |
| Overview … Settings | Same | lazy pages under `AppShell` + `PageTransition` (`springSoft` opacity/y; no CSS filter on wrapper) |
| Overlays | Any desk page | `Modal` / `Drawer` portal to `document.body` (`z-[200]`, `springSnappy` on the panel). Offer preview uses `glass`. |
| Admin | `canViewAdmin(role)` | `AdminRoute` + `AdminPage` |

Unsigned visitors always go to `/login`. There is no `talent-desk-demo-ui` flag.

## Runtime topology

```
Browser (Vite 8 + React 19 + React Router 7)
  ├─ Cloud mode (VITE_SUPABASE_* set)
  │    ├─ Auth            →  Supabase Auth (email/password)
  │    ├─ Desk data       →  hosted Postgres (shared RLS for all authenticated)
  │    └─ Realtime        →  postgres_changes → invalidate TanStack Query
  ├─ Local fallback (env unset)
  │    ├─ Accounts + session → localStorage (PBKDF2-SHA-256, 100k iterations)
  │    └─ Desk data          → localStorage (shared on this device)
  ├─ Import / export     →  Settings JSON (format: talent-desk-export) + cloud upload
  ├─ Offer scan          →  tesseract.js in-browser OCR
  ├─ Offer translate     →  MyMemory (EN/PT stay; CJK/Cyrillic/etc. → PT)
  ├─ Telegram            →  teleproto MTProto user client (browser WS); session local
  ├─ Interview alerts    →  in-app toast (body portal z-220) + browser Notification
  ├─ Header activity     →  1s TanStack poll of `activities` (+ cloud realtime invalidate)
  ├─ Motion              →  framer-motion + GSAP slide-pill
  └─ SFX                 →  Web Audio (muted by default)
```

- **Framework:** Vite 8, React 19, React Router 7 (`React.lazy` + Suspense), TanStack Query 5, Tailwind 4 (`@import "tailwindcss"` + `@theme` in `src/index.css` — no `tailwind.config`). Framer Motion 14, GSAP 3.
- **Dev server:** `npm run dev` → `http://127.0.0.1:5173` (`vite.config.ts` `host: true`, port 5173).
- **Build:** `tsc -b && vite build`. Lint: `oxlint`. Output: `dist`.
- **Host:** Vercel SPA (`vercel.json`: framework `vite`, `npm run build` → `dist`, rewrite `/(.*)` → `/index.html`). `.vercel` is gitignored.
- **Auth:** email/password — Supabase Auth in cloud mode; `talent-desk.accounts.v1` (PBKDF2) in local fallback. First account / reserved `OWNER_EMAIL` → `owner`. Max 4 non-owner seats.
- **Data:** shared team desk (cloud tables or local `talent-desk.data.v1`). Empty by default. `getDashboardData` returns honest zeros (`isDemo: false`) — never `DEMO_METRICS`.
- **Env (optional):** `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` enable cloud sync. Unset → localStorage. Never put `service_role` in `VITE_*`. Optional `VITE_TELEGRAM_API_ID` + `VITE_TELEGRAM_API_HASH` prefill the personal Telegram client (else paste on `/telegram`). Do not copy real ids, hashes, project refs, or anon keys into this file.
- **Production alias (README):** `https://talent-desk-leadforge3.vercel.app`

## Hosting

Production is a static Vite SPA on Vercel. Client-side routes (`/candidates`, `/offers`, …) need the rewrite in `vercel.json` or they 404 on refresh.

| Path | Notes |
| --- | --- |
| GitHub import | Framework **Vite**, root `.`, build `npm run build`, output `dist` |
| Env | Optional `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` for cloud sync. Optional `VITE_TELEGRAM_API_ID` + `VITE_TELEGRAM_API_HASH` for in-desk Telegram (names only in docs). |
| Data | Hosted Supabase shared desk, or device-local localStorage fallback |
| Claim | An agent may leave a temporary Vercel deploy with a claim link (~60 min). After claim: `vercel link` or dashboard import |

Do not put service-role keys in the browser / `VITE_*`. Hosted Supabase only — no Docker for Vercel.

## Auth

`api.ts` routes every auth/data call: cloud when `isCloudSyncEnabled`, else local.

| Route / action | Local fallback | Cloud (`VITE_SUPABASE_*` set) |
| --- | --- | --- |
| `loginAccount` | `local-db.signIn` → `talent-desk.session.v1` | `supabase.auth.signInWithPassword`; then `maybeAutoMigrateLocalToCloud` |
| `registerAccount` | First account or reserved owner mailbox → `owner`; preferred admin mailbox → `admin`; else `user` if under the seat cap | `supabase.auth.signUp` (PKCE). Profile role assigned by `handle_new_user` trigger (owner mailbox / preferred admin / first profile → owner; else `user`). Throws if confirm-email is on and no session. |
| `changePassword` | Re-hash PBKDF2 with a new salt after verifying current | `cloudChangePassword` via Supabase Auth |
| `AdminRoute` / Admin Accounts | Password modal (set, or generate a temp `td-…` string); Add account modal; Delete (confirm by email, not self) | Role `Select` + delete **profile** row still work. Add account / set password / reset **throw** (Register or Dashboard for seats; Dashboard for passwords). Owner row stays **Protected**. |
| Preferred admin bootstrap | One-time per browser (`talent-desk.bootstrap.prof-admin.v1`) | Trigger assigns preferred-admin mailbox → `admin` on first Auth insert. No co-owner. |
| Pipeline CRUD | `canManagePipeline` is every desk role | Same. Shared RLS: any authenticated teammate CRUD. |

Password rule: **≥ 8 characters**. Local passwords are PBKDF2-SHA-256 (100,000 iterations) + 16-byte salt in `localStorage`. Cloud passwords live in Supabase Auth — local hashes **do not** transfer. Reserved owner email lives in `OWNER_EMAIL` (`src/lib/constants.ts`) — do not document the address here; do not let register mint that mailbox as `user`. Preferred admin email is `PRIMARY_ADMIN_EMAIL` in the same file (also baked into the SQL trigger — do not copy either address into these docs).

`ProtectedRoute` waits on `AuthProvider.loading`, then `Navigate` to `/login` unless a session exists. Cloud: session from `supabase.auth.getSession` + `onAuthStateChange`. Local: after login/register, pages call `notifyAuthChanged()` so the provider re-reads `talent-desk.session.v1`. Login helper copy states whether cloud sync is on.

Max **4** non-owner seats (`MAX_ACCOUNTS`). Local: register and Admin Add-account in `local-db.ts` share that cap. Cloud: `enforce_account_limit` + `handle_new_user` triggers. Full desk is **shared** (cloud tables or this-device localStorage): list helpers take no `userId` and return every row (no `forUser` scope). Row `userId` is creator attribution only — Admin per-seat `c/o/i/e` counts still filter on it. Mutations keep the original creator id on edit. Deleting a seat does **not** delete pipeline rows. Smoke: `scripts/smoke-shared-desk.mjs` (local).

## Data

App façade: `src/lib/api.ts`. Cloud store: `src/lib/cloud-db.ts` + `supabase/migrations/0001_shared_desk.sql`. Local store: `src/lib/local-db.ts`. Schema notes: `docs/local-data.md`, `docs/cloud-sync.md`.

| Key | Contents |
| --- | --- |
| `talent-desk.accounts.v1` | Local accounts (email, role, PBKDF2 hash + salt) |
| `talent-desk.data.v1` | Local candidates, offers, interviews, earnings, activities |
| `talent-desk.session.v1` | Local `{ userId, email }` |
| `talent-desk.bootstrap.prof-admin.v1` | `'1'` after preferred-admin → `admin` bootstrap (local) |
| `talent-desk.cloud-auto-migrated.v1` | `'1'` after first-login auto-upload (or empty skip / forced Settings upload) |
| `talent-desk.sidebar-collapsed` | `'1'` / `'0'` (always local) |
| `talent-desk.sfx-muted` | `'1'` (default) / `'0'` (always local) |
| `talent-desk.interview-reminders.v1` | `'1'` (default when unset) / `'0'` — interview start alerts |
| `talent-desk.interview-reminded.v1` | JSON `{ [interviewId]: firedAtMs }` dedupe |
| `talent-desk.telegram-api.v1` | Optional `{ apiId, apiHash }` when env unset |
| `talent-desk.telegram-session.v1` | MTProto StringSession for personal Telegram |
| `talent-desk.notifications-seen.v1` | ISO watermark for header “Added candidate/offer” unread |

Cloud tables (hosted Postgres, shared RLS): `profiles`, `offers`, `candidates`, `interviews`, `earnings`, `activities`. Realtime: `CloudRealtimeSync` invalidates TanStack Query on `postgres_changes`; `refetchOnWindowFocus` is on when cloud is enabled.

| Entity | Purpose |
| --- | --- |
| profiles (derived) | From the account row: role `owner \| admin \| moderator \| user` |
| offers | Forex or Chinese package, commission/salary, telegram, visa/flight flags |
| candidates | Pipeline stage, offer FK, telegram, sent_by, country, age, languages, currentLocation, market (`forex` \| `chinese` \| null), gender (`male` \| `female` \| null), expected salary |
| interviews | Candidate + optional offer, `scheduled_at`, outcome (`Confirmed` / `Declined by company` / free text) |
| earnings | Amount + `Estimated \| Pending \| Paid \| Overdue` (Confirmed interview seeds Estimated) |
| activities | Feed rows (`entity_type`, `message`) |

Roles: `owner` > `admin` > `moderator` > `user`. Pipeline: Screening → Interview → Offer → Accepted → Hired / Rejected. Offer status: Live / Paused / Closed. Offer category: `forex` | `chinese`. Candidate market uses the same two values (`CANDIDATE_MARKETS`). Candidate gender: `male` | `female` (`CANDIDATE_GENDERS`).

Confirming an estimated earning sets status to **Pending** (`confirmEarning`). Pending + Paid + Overdue count as income; Estimated does not until confirmed.

Local pipeline import **replaces** `talent-desk.data.v1`. Local accounts are **merged by email** (incoming credentials win); an export with no `accounts` array leaves local seats untouched. Settings download in local mode exports hashes+salts (`includePasswords: true` currently means hash/salt, not plaintext). Import also accepts a one-time plaintext `"password"` per account.

Cloud import **upserts pipeline rows only** (`cloudImportDeskJson`); local PBKDF2 hashes do not become Auth users (`accounts: 0`). First cloud login auto-uploads this browser’s local desk when the cloud is empty (`maybeAutoMigrateLocalToCloud`). Settings can force `uploadLocalDeskToCloud`.

`migrateCandidate` fills missing `country` / `age` / `languages` / `currentLocation` / `market` / `gender` with null on load and import (`normalizeMarket` / `normalizeGender`) — it does not wipe older rows. Unknown market/gender strings become null.

`deleteCandidateRow` removes the candidate and any interviews/earnings with that `candidateId` desk-wide. Linked offers are not deleted. Confirm UI names the candidate before the mutation runs.

## Offers pipeline

1. Paste or **Scan** an image (`tesseract.js` worker in `OffersPage`).
2. `translateOfferText` leaves EN/PT; otherwise MyMemory `autodetect|pt` in ≤450-char chunks.
3. `parseOfferText` guesses `forex` vs `chinese` (accommodation / visa / flight / video-call hints), title, company, salary, provision, `%` vs fixed.
4. `upsertOffer` writes numeric fields through `parseNumericInput` (accepts `1.600` / `1,600` / `1.600,50`). Telegram stored **without** `@` (`stripAtHandle`); UI shows `@` via `ensureAtHandle`.

Chinese packages use `salary` + `commission` plus boolean visa / flight / accommodation / videoCall. Forex uses `salaryMin`/`salaryMax` + `commissionValue`.

## Persistence

| Store | What | Where |
| --- | --- | --- |
| Hosted Supabase (when env set) | Auth (GoTrue email/password, PKCE) + Postgres desk tables + realtime | Shared across teammates |
| `localStorage` fallback | Accounts, session, pipeline rows | This browser only (when env unset) |
| `localStorage` always | SFX mute, rail collapse, cloud-auto-migrated flag, interview-reminder pref/fired map, notification seen watermark, Telegram api/session | This browser |
| Tesseract | OCR WASM | In-browser, ephemeral |

No object storage. Header search does not query. Never put `service_role` in `VITE_*`. Do not copy project refs or anon keys into this file — they live in `.env` / Vercel (see `docs/cloud-sync.md`).

## File map

```
src/index.css                          → @theme tokens + mesh / glass / card / nav / table CSS
src/main.tsx                           → StrictMode mount
src/App.tsx                            → QueryClient + AuthProvider + routes
src/auth/AuthProvider.tsx              → cloud: getSession + onAuthStateChange; local: localStorage + notifyAuthChanged
src/auth/ProtectedRoute.tsx            → session required; AdminRoute
src/pages/LoginPage.tsx                → helper copy: cloud on vs off; friendlyCloudAuthError when sync on
src/pages/RegisterPage.tsx             → MAX_ACCOUNTS copy; friendlyCloudAuthError when sync on
src/pages/DashboardPage.tsx           → recent table: market + gender chips
src/pages/CandidatesPage.tsx          → DeskTotalsStrip, schedule→calendar deep-link, `?id=` drawer deep-link, add/edit (wide modal), market/gender filters + chips, drawer, named delete confirm
src/pages/OffersPage.tsx              → DeskTotalsStrip; card grid + glass preview modal (linked candidates by offerId); Edit/Delete stopPropagation
src/pages/InterviewsPage.tsx          → DeskTotalsStrip; upcoming/past; Confirmed/Declined on past
src/lib/commission.ts                  → estimate offer commission for interview confirm
src/lib/interview-stage.ts             → schedule→Interview / Confirmed→Accepted / Declined→Rejected
src/components/desk/DeskTotalsStrip.tsx → glowing unfiltered candidates/offers/interviews totals (AnimatedNumber)
src/pages/InterviewCalendarPage.tsx    → month/week/day calendar; ScheduleInterviewModal
src/components/interviews/ScheduleInterviewModal.tsx → create/edit/delete interview (candidate + datetime)
src/components/interviews/InterviewReminderWatcher.tsx → OS Notification + in-app toast ~1 min before start
src/lib/interview-reminders.ts         → pref / permission / due window helpers
src/lib/datetime.ts                    → datetime-local helpers
src/pages/EarningsPage.tsx             → Estimated awaiting + per-row payment status select
src/pages/TelegramPage.tsx             → personal MTProto chat; Chats vs Groups tabs; NewMessage + light poll (msgs 1s / dialogs 5s)
src/lib/telegram-mtproto.ts            → api creds / session helpers for Telegram user client
src/pages/SettingsPage.tsx              → Storage row; Cloud sync upload card when flag on; JSON import/export
src/pages/AdminPage.tsx               → seats KPIs, role Select, Add account, Protected owner
src/components/layout/AppShell.tsx     → collapsible rail + hover pill + glass tooltip + header (live Intl clock, notification bell) + InterviewReminderWatcher
src/components/layout/HeaderNotifications.tsx → bell badge for Added candidate/offer activity (1s poll + cloud realtime)
src/lib/desk-notifications.ts          → seen watermark + add-activity filter
src/components/layout/HeaderClock.tsx  → header date+time (browser locale / local TZ, 1s tick)
src/lib/datetime.ts                    → datetime-local helpers + header Intl formatters
src/components/auth/AuthShell.tsx      → orbs + glass card + sound toggle
src/components/motion/*                → PageTransition (springSoft opacity/y, no filter), Motion, AnimatedNumber, SoundToggle
src/components/ui/*                    → Button, Input, Card (p-6, CardTitle text-xl), Badge (`stageTone` / `marketTone` / `genderTone`), Modal/Drawer (body portal, springSnappy, glass), charts
src/lib/api.ts                         → app façade (cloud-db when sync on, else local-db); canViewAdmin / canManagePipeline
src/lib/supabase.ts                    → client + isCloudSyncEnabled feature flag
src/lib/cloud-db.ts                    → hosted Supabase CRUD + upload/migrate
src/lib/local-db.ts                    → accounts, shared-desk CRUD, merge-import, PBKDF2, migrateCandidate, preferred-admin bootstrap
src/auth/CloudRealtimeSync.tsx         → invalidate queries on postgres_changes
src/lib/constants.ts                   → APP_NAME, roles, NAV_ITEMS (Interview Calendar `/calendar` `05`, Telegram `/telegram` `07`, Settings `08`), ADMIN_NAV `09`, MANAGEABLE_ROLES, ADMIN_VIEW/MANAGE, PIPELINE_ROLES, CANDIDATE_MARKETS, CANDIDATE_GENDERS, marketLabel, genderLabel
src/lib/types.ts
src/lib/demo-data.ts                   → SPARK_SERIES shapes only (not KPI values)
src/lib/parse-offer.ts
src/lib/motion.ts                      → springSoft, springSnappy, fadeUp, fadeScale, stagger
src/lib/slide-pill.ts                  → GSAP stretchy lime pill (hover+active, killTweens)
src/lib/sfx.ts                         → Web Audio, muted by default
src/lib/utils.ts                       → cn, money, telegram handles
docs/local-data.md                     → localStorage keys + export JSON + candidate fields + shared-desk note
docs/cloud-sync.md                     → hosted Supabase setup checklist
supabase/migrations/0001_shared_desk.sql → schema + shared RLS + realtime
scripts/smoke-shared-desk.mjs          → owner→other visibility; seat delete keeps rows
vercel.json                            → Vite SPA: dist + client rewrites
README.md                              → local setup + Vercel runbook
PRODUCT.md                             → users, purpose, capabilities, constraints
AGENTS.md                              → Vite SPA contributor / agent guardrails
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
| `AnimatedNumber` | KPIs, gauge, live-desk money, **DeskTotalsStrip** |
| Totals-strip lime orb (4.5s pulse; skipped if reduced motion) | `DeskTotalsStrip` |
| `thud` | Collapse, mobile menu |
| `bass` | Nav click, Open candidates |
| `pop` / `hover` / `tap` | Focus, hover (skip pop on already-active nav), buttons; `pop` when header unread count rises |
| `success` | Login, register, confirm earning, interview-start toast |
| `whoosh` | Sign out, auth link |

`prefers-reduced-motion`: snap the pill, skip page transition, opacity-only overlays at 0.01s, skip SFX, collapse CSS animations to 0.01ms.

## Leftovers (not canon)

- Settings “Visual system” copy and swatches still list violet / cyan / magenta as the brand, and one swatch is `#FFB5A0` (not peach `#F4B183`). Shipped tokens are lime-glass — `DESIGN.md` wins.
- Cloud Admin Add account / set password / reset still render, then **throw** (no Edge Function). Do not document those throws as the intended local password UX.
- Login helper copy is muted 12px, not a conversion chip. Do not promote it into a “CLOUD” badge.
- `Input` / `Textarea` / `Select` still use a **violet** focus ring; header search and `:focus-visible` are lime. New fields should follow lime.
- `EmptyState` eyebrow is still `text-violet-glow`; `Spinner` is still violet/cyan. Prefer peach kickers and lime spinners on new work.
- `button` magenta / cyan variants remain in the API; register is lime, not magenta.
- `SPARK_SERIES` in `demo-data.ts` is decorative spark shape, not live income.
- Drawer still allows inline telegram/sent-by/stage patches; full profile edits (including market and gender) go through the wide Add/Edit modal.
- Female gender chips use **magenta**; Male and Chinese market chips share **cyan**. Magenta is still not conversion.
- Admin role badges: owner **magenta**, admin **lime**, moderator/user **violet**. Heritage tones on seats — not conversion.
- Admin notes card prints the preferred-admin mailbox from `PRIMARY_ADMIN_EMAIL`. Do not copy that address into either docs file.
- Offer-preview **Open**, interview-toast **Open interviews**, and Telegram candidate/API links are `text-cyan hover:text-lime`. In-page links in `DESIGN.md` are lime — do not canonize cyan as a second link color; new work should use lime.
- Open PR #30 (DeskTotalsStrip per-cell subtexts) is **not** on `main`. Keep documenting the shipped strip copy until it merges.

## Invariants for the next build

1. **Auth screen first.** Do not put Overview on an anonymous first paint. Do not restore a demo-UI bypass.
2. **Shared team desk.** Cloud mode: all authenticated teammates share candidates/offers/interviews/earnings. Local fallback: shared on that device (every signed-in seat). `user_id` is creator attribution only.
3. **Four-seat cap.** Non-owner accounts ≤ `MAX_ACCOUNTS`. Owner mailbox stays reserved (`OWNER_EMAIL`).
4. **Confirm estimated → Pending.** `confirmEarning` must not jump straight to Paid. Estimated is not income.
5. **Empty desk is zeros.** Never invent `DEMO_METRICS` as live money. The Overview banner must stay while the pipeline is empty.
6. **Friendly auth errors.** Map through `friendlyAuthError`. Do not surface stack traces on login.
7. **Visual world is The Lime Glass Desk.** New UI goes through `DESIGN.md` (lime conversion, peach kickers, charcoal `#111`, Plus Jakarta / JetBrains Mono, stretchy pill, glass Overview, occupied type). Overview / auth / totals / glass modals use `<GlassPanel>` + `src/lib/liquid-glass.js` (real refraction in Chromium; frost fallback elsewhere). Chrome actions may use `Button variant="glass"`. Do not restore The Neon Signal Desk (violet conversion, `#080A10`, magenta inset nav).
8. **SFX stay muted by default.** Do not auto-unmute. Honor `prefers-reduced-motion`.
9. **Cloud sync is opt-in via env.** Hosted Supabase with `VITE_SUPABASE_*` is supported; keep localStorage fallback when unset. Never require Docker. Never expose `service_role` to the client.
10. **Do not commit secrets.** Password hashes, salts, and export JSON with credentials stay out of git. Do not print `OWNER_EMAIL` in docs.
11. **Vercel is a SPA, not an SSR host.** Keep `vercel.json` rewrites to `index.html`.
12. **Overlays live on `document.body`.** Do not put CSS `filter` on `PageTransition`. Do not put `backdrop-blur` on the modal overlay. Framer blur on the **dialog panel** during open is the preview motion.
13. **Candidate delete is named + cascading.** Confirm modal must show the name. Cascade interviews and earnings; never delete the linked offer. Profile fields migrate; do not wipe older rows.
14. **Nav pill follows hover and active.** Kill in-flight GSAP tweens. Collapsed labels are the glass tooltip, not a native `title`.
15. **Offer cards open a glass preview.** Edit/Delete on the card must `stopPropagation`. Preview uses `Modal` `wide` + `glass`.
16. **Candidate market and gender are optional single-selects.** Values are `forex`/`chinese` and `male`/`female` (or null). Chips: lime Forex, cyan Chinese, cyan Male, magenta Female. Unset is a dim dash. Migrate unknown/missing to null; do not wipe older rows. Do not invent extra market or gender options.
17. **Full desk is shared on this device.** Every signed-in role lists and mutates the same candidates / offers / interviews / earnings / activities. `userId` is creator attribution only (Admin per-seat counts). Do not restore `forUser` scoping. Deleting a seat must not wipe pipeline rows. Owner stays Protected; `MANAGEABLE_ROLES` never includes `owner`.
18. **DeskTotalsStrip is unfiltered.** Candidates / Offers / Interviews show the same three live shared counts. Do not bind them to the page search/filter. Honor `prefers-reduced-motion` on the lime orb.
19. **Interview Calendar is its own rail item.** `/calendar` (nav `05`) is month / week / day of `scheduledAt`. Candidates Schedule → `/calendar?candidate=`; offer preview Open → `/candidates?id=` (keep `?id=` until the drawer closes so `PageTransition` remount still reopens it). Do not merge calendar into the Interviews list.
20. **Row actions are icon-only.** Schedule / Edit / Delete on the candidates table and Edit / Delete on offer cards are `h-8 w-8` with aria-label + title. Do not restore wordy table labels.
21. **Telegram is a personal MTProto client, not a bot.** `teleproto` user login (api_id/hash, phone, code, optional 2FA). Session and optional pasted creds stay in this browser. Do not put api_id, api_hash, or session strings in git or docs. Unofficial-client account-limit risk stays in the amber notice. Dialog list is **Chats** (DMs) vs **Groups** (groups/channels). Live refresh is `NewMessage` plus a 1s open-thread tick and a 5s dialog poll; unread badges cap at `999+`; group history is 20 messages, DMs 40. Do not restore a bot token flow.
22. **Interview start alerts need the desk open.** `InterviewReminderWatcher` ticks every 5s, fires ~1 min before `scheduledAt` (grace ~2 min after), portals a lime toast at `z-[220]` (auto-dismiss 14s) and an OS `Notification` when permitted. Pref defaults on. No server push.
23. **Header bell is add-activity only.** Unread “Added candidate/offer” from `activities`, 1s poll + cloud realtime, per-browser watermark `talent-desk.notifications-seen.v1`. Lime badge `9+` cap. Do not mix interview reminders into the bell.
24. **Past interviews decide the pipeline.** Lime **Confirmed** (`size="sm"`) writes outcome `Confirmed`, seeds Estimated commission (`estimateOfferCommission`), and `upsertInterview` sets candidate **Accepted**. Rose **Declined** writes `Declined by company` → **Rejected**. Candidates page runs `reconcileInterviewCandidateStages` on load. Do not leave Confirmed as a cyan free-text badge.

## How this documentation stays current

An hourly Cursor automation (“Design and System documentation”) compares `HEAD` on `main` to the **Documented from** SHA above.

- If the SHA matches and `DESIGN.md` / `HANDOFF.md` exist, it reports **No changes**.
- If the desk was built or rebuilt (new commits touching UI, auth, offers/scan, tokens, shell, motion/SFX, local-db, cloud-db, calendar, Telegram, notifications, interviews/earnings, or hosting/deploy), it re-extracts the visual system into `DESIGN.md` + `.impeccable/design.json` when visuals moved, and rewrites this handoff (plus `PRODUCT.md` / `README.md` / `AGENTS.md` / `docs/*` when product surface moved) from the shipped artifact. Hosting-only commits refresh this file and leave `DESIGN.md` tokens in place.
- Confirmed incumbent decisions stay; the build wins where they diverge.
- Track `main`. If a rebuild branch diverges, document the branch that holds the live desk until it is merged.
- Do not commit secrets, env values, identity tokens, or account JSON into either file.
