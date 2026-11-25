# Talent Desk — local data (localStorage)

Fallback store when cloud sync is off (`VITE_SUPABASE_*` unset). Nothing is seeded. For hosted Supabase setup see [`cloud-sync.md`](./cloud-sync.md).

## Keys

| Key | Contents |
|-----|----------|
| `talent-desk.accounts.v1` | Accounts (email, role, PBKDF2 hash + salt) |
| `talent-desk.data.v1` | Candidates, offers, interviews, earnings, activities |
| `talent-desk.session.v1` | Current `{ userId, email }` |
| `talent-desk.bootstrap.prof-admin.v1` | `'1'` after one-time promote of preferred admin email → `admin` |
| `talent-desk.sidebar-collapsed` | `'1'` / `'0'` — rail collapsed |
| `talent-desk.sfx-muted` | `'1'` (default) / `'0'` — Web Audio mute |
| `talent-desk.interview-reminders.v1` | `'1'` (default when unset) / `'0'` — interview start alerts |
| `talent-desk.interview-reminded.v1` | JSON map of interview id → fired-at ms (dedupe) |
| `talent-desk.telegram-api.v1` | Optional `{ apiId, apiHash }` for personal Telegram client |
| `talent-desk.telegram-session.v1` | Telegram MTProto session string (sensitive) |
| `talent-desk.notifications-seen.v1` | ISO timestamp watermark for header notification unread |
| `talent-desk.cloud-auto-migrated.v1` | `'1'` after one-time local → cloud upload attempt |

## Candidate row shape (in `data.candidates`)

| Field | Type | Notes |
|-------|------|--------|
| `name`, `stage`, … | string / enums | Pipeline core; stage auto-syncs from interviews (`Interview` / `Accepted` / `Rejected`) |
| `country` | `string \| null` | Profile |
| `age` | `number \| null` | Profile |
| `languages` | `string \| null` | Free text |
| `currentLocation` | `string \| null` | Profile |
| `market` | `"forex" \| "chinese" \| null` | Desk market chip (same values as offer category) |
| `gender` | `"male" \| "female" \| null` | Gender chip |

Older exports missing profile / market / gender keys migrate to `null` on load/import — existing rows are not wiped. Unknown market/gender strings become `null`.

Deleting a candidate removes that row and cascades interviews and earnings that reference the candidate id. Linked offers are not deleted.

## Interview outcomes (in `data.interviews`)

| Outcome | Effect |
|---------|--------|
| (empty / free text) | Candidate stage → **Interview** on schedule via `upsertInterview` |
| `Confirmed` | Candidate → **Accepted**; Estimated earning from offer commission (`src/lib/commission.ts`); notes may include `interview:<id>` |
| `Declined by company` | Candidate → **Rejected** |

Candidates page runs `reconcileInterviewCandidateStages` on load against each candidate’s latest interview by `scheduledAt`.

## Earnings statuses (in `data.earnings`)

`Estimated` | `Pending` | `Paid` | `Overdue`. Interview **Confirmed** seeds **Estimated** (Awaiting). Ledger UI can change status per row. Confirming Estimated → Pending is income; Estimated alone is not.

## Export format

```json
{
  "format": "talent-desk-export",
  "version": 1,
  "exportedAt": "2026-11-25T00:00:00.000Z",
  "accounts": [
    {
      "id": "…",
      "email": "you@example.com",
      "fullName": "Name",
      "role": "owner",
      "createdAt": "…",
      "passwordHash": "…",
      "salt": "…"
    }
  ],
  "data": {
    "candidates": [],
    "offers": [],
    "interviews": [],
    "earnings": [],
    "activities": []
  }
}
```

Settings → Download JSON export / Upload / paste. Import replaces pipeline data. Accounts are **merged** by email (incoming credentials win); an export with no accounts leaves existing seats untouched.

The full desk is **shared** across every account on this device. `listOffers` / `listCandidates` / `listInterviews` / `listEarnings` / `listActivities` return the whole `talent-desk.data.v1` collection (no per-user filter). Row `userId` is creator attribution only. Deleting an account removes the seat, not pipeline rows.

**Roles:** sole `owner` (reserved mailbox / first seat). Admin → Accounts Actions can set other seats to `user` / `moderator` / `admin` (owner row stays Protected). Preferred admin mailbox (`PRIMARY_ADMIN_EMAIL` in `constants.ts`) is promoted to `admin` once when that seat already exists on the device; if missing, use Admin **Add account** or `/register` (both assign `admin` for that email). There is no co-owner.

Accounts may include a plaintext `"password"` instead of hash/salt when preparing a one-time restore for another browser. UI export with passwords currently means hash + salt, not plaintext.

Do not commit export JSON with credentials into git. Do not commit Telegram session / api hash values.
