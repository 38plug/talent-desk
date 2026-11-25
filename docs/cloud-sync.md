# Talent Desk — cloud sync (hosted Supabase)

Shared team desk across devices/browsers. When `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set to a real hosted project, every signed-in teammate sees the same candidates, offers, interviews, earnings, and activity. Without those env vars, the SPA keeps the localStorage fallback (shared on that device only).

No Docker required. Do not point Vercel at `127.0.0.1`.

## Pedro setup checklist

1. **Create a free hosted project** at [supabase.com/dashboard](https://supabase.com/dashboard).
2. **Apply schema** — SQL Editor → paste and run [`supabase/migrations/0001_shared_desk.sql`](../supabase/migrations/0001_shared_desk.sql) once.
3. **Auth settings** — Authentication → Providers → Email:
   - Enable Email.
   - Disable **Confirm email** for the small team desk (or manually confirm users in Auth → Users).
4. **Copy keys** — Settings → API → Project URL + `anon` `public` key.
5. **Local `.env`** (optional for `npm run dev`):

   ```bash
   cp .env.example .env
   # paste VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```

6. **Vercel** — Project → Settings → Environment Variables (Production + Preview):

   | Name | Value |
   |------|--------|
   | `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | hosted anon key |

7. **Redeploy** Vercel (Vite bakes env at build time).
8. **Register** owner + teammates on the live site (email/password). Seat cap remains 4 non-owner.
9. **Migrate local data** — first cloud login auto-uploads this browser’s local desk when the cloud is empty. Or Settings → **Upload this browser’s local desk to cloud** / Import JSON.

## Accounts migration

Local PBKDF2 hashes **do not** transfer into Supabase Auth. Each teammate creates a cloud account (same emails as before). Pipeline JSON import/upload moves desk rows only.

## RLS model

| Table | Policy |
|-------|--------|
| `profiles` | Authenticated select; own insert/update; owner/admin update/delete seats |
| `offers` / `candidates` / `interviews` / `earnings` / `activities` | Any authenticated teammate can CRUD (shared desk). `user_id` is creator attribution only. |

## Realtime

Migration adds tables to `supabase_realtime`. The SPA subscribes and invalidates TanStack Query; it also refetches on window focus when cloud sync is on.

## Offline / fallback

If env vars are missing or placeholders, `isCloudSyncEnabled` is false and the app uses `localStorage` (current on-device shared desk). Sidebar/SFX prefs always stay local.

## Secrets (do not commit)

- Anon key is public to the browser by design (RLS protects data).
- **Never** put `service_role` in `VITE_*` or Vercel client env.
- Do not commit export JSON with password hashes.
