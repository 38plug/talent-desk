# Product — Talent Desk

## Platform

Web SPA (Vite + React 19), hosted as static files on Vercel.

## Users

Forex recruiters running a small desk: sourcing candidates, matching them to live job offers (forex + Chinese packages), scheduling interviews, and tracking commission. One primary operator per account, occasionally a small agency team (max 4 non-owner seats). Work happens in long desk sessions with dense, scannable data.

## Product purpose

A command center that keeps candidate pipeline, offer economics, interview schedule, and commission ledger in one place. Success: the operator sees what needs attention today, moves a candidate forward without losing history, and knows what is estimated vs confirmed income.

## Positioning

Provision/commission lives on the **offer** (fixed fee or percent of expected salary), not as a free-floating candidate rule. Earnings start as **Estimated**, move to **Pending** when the operator confirms, then **Paid** / **Overdue**. Pipeline stage changes write activity events.

## Operating context

- Pipeline: Screening → Interview → Offer → Accepted → Hired / Rejected.
- Offers: Live / Paused / Closed; categories `forex` | `chinese`.
- Auth is email/password. With hosted Supabase env set: shared cloud Auth + desk. Without: browser `localStorage` (PBKDF2) fallback.
- Empty desk shows honest zeros — never seeded demo KPIs.

## Capabilities

| Module | What it does |
|--------|----------------|
| Overview | KPI heroes, charts, estimated confirm → Pending, needs attention, recent candidates |
| Candidates | CRUD table + drawer; fields include country, age, languages, currentLocation; market Forex\|Chinese; gender Male\|Female; filters; named delete (cascades interviews + earnings) |
| Offers | Card grid with glass preview modal; OCR scan (tesseract.js); MyMemory translate; provision + Telegram |
| Interviews | Schedule against candidate / optional offer |
| Earnings | Estimated → Pending → Paid / Overdue; CSV export |
| Settings | Profile, password, JSON desk import/export, cloud upload |
| Admin | Role-gated seats console |

## Constraints

- Preferred: hosted Supabase shared desk (see `docs/cloud-sync.md`). Fallback: device-local `localStorage`.
- Max 4 non-owner accounts; reserved owner mailbox.
- No Docker / Cloudflared requirement. No Next.js API routes. Never expose `service_role` to the browser.
- Header search is chrome only (no query).
- Do not invent customer KPIs, testimonials, or benchmarks in docs or UI.

## Brand

- Name: **Talent Desk**
- Descriptor: Forex Recruiting Command Center
- Visual SoT: [`DESIGN.md`](./DESIGN.md) — charcoal `#111`, lime `#C6F432` conversion, peach kickers, Plus Jakarta Sans + JetBrains Mono, glass Overview, stretchy lime nav pill

## Product principles

1. Pipeline state is the spine; every view answers “what moved and what is next”.
2. Money facts are exact: Estimated is not income until confirmed to Pending.
3. History is never lost: stage changes write activity; candidate delete is named and cascading (offers stay).
4. Dense information stays scannable under time pressure.
5. Account scarcity is deliberate; do not hide the four-seat cap.
6. Empty desks stay empty — no fake demo metrics.

## Accessibility

Keyboard-reachable controls, visible focus (lime `:focus-visible`), status by text and color, `prefers-reduced-motion` collapses motion and silences SFX. SFX muted by default.
