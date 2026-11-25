# Migrate live Talent Desk data → hosted Supabase (for Vercel)

**Goal:** Keep Pedro’s real rows. Do **not** seed fake demo metrics.

Vercel cannot reach local Docker (`127.0.0.1:54321`). Point the SPA at a **hosted** Supabase project and restore a dump of the existing database.

## What holds live data today?

Confirm one source before migrating:

| Source | Typical location |
|--------|------------------|
| Local Docker (forex-talent-desk) | Operator machine: `npx supabase start` → API `:54321`, Postgres `:54322` |
| Older Vercel + tunnel | Ephemeral Cloudflared URL — dump from the **local** Postgres behind it |
| Already-hosted Supabase | Dashboard → Project → already live — just set Vercel `VITE_*` and redeploy |

If you are unsure which project has the live rows, stop and confirm before any restore.

## A. Create hosted project

1. https://supabase.com/dashboard → New project  
2. Note **Project URL** and **anon** + **service_role** keys (Settings → API)  
3. Apply schema:

```bash
# From this repo, with hosted DB connection string (Settings → Database):
psql "$HOSTED_DATABASE_URL" -f supabase/migrations/0001_init.sql
```

Or paste `supabase/migrations/0001_init.sql` into SQL Editor (once).

4. (Optional) Deploy Edge Functions `register`, `admin-stats`, `admin-account` with the service role role secret.

## B. Export from local Docker (operator machine)

With Docker Supabase running on the machine that has the real data:

```bash
# Postgres is usually localhost:54322 (see `npx supabase status`)
./scripts/export-local-supabase.sh
# → writes dumps/talent-desk-*.sql
```

Or manually:

```bash
pg_dump "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  --no-owner --no-acl \
  -t public.profiles -t public.offers -t public.candidates \
  -t public.interviews -t public.earnings -t public.activities \
  > dumps/public-data.sql

# Auth users (needed for login to the same accounts):
pg_dump "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  --no-owner --no-acl -n auth \
  > dumps/auth-schema-data.sql
```

Prefer a full dump if roles/triggers differ:

```bash
npx supabase db dump -f dumps/full.sql
```

## C. Restore into hosted

```bash
psql "$HOSTED_DATABASE_URL" -f dumps/public-data.sql
# Restore auth carefully (or recreate owner via Dashboard → Auth → Users,
# then fix public.profiles.id to match auth.users.id).
```

Verify row counts in Studio match the old desk. Spot-check income for a known account (RLS: each user only sees their rows).

## D. Point Vercel at hosted

1. Vercel project → Environment Variables (Production):

   - `VITE_SUPABASE_URL` = `https://<ref>.supabase.co`  
   - `VITE_SUPABASE_ANON_KEY` = hosted anon key  

2. **Redeploy** (Vite inlines env at build time).

3. Open the `*.vercel.app` URL → sign in with an existing account → confirm real KPIs (not zeros, not invented demo numbers).

## E. Alternative: temporary tunnel (not permanent)

```bash
cloudflared tunnel --url http://127.0.0.1:54321
# health: https://<tunnel>/auth/v1/health → 200
```

Set that URL on Vercel and redeploy. Hostnames change on restart — use only until hosted migrate is done.

## Agent blocker

The cloud agent cannot reach Pedro’s local Docker. Provide either:

1. A SQL/CSV dump of the live tables (+ auth if possible), or  
2. Hosted project URL + confirmation that data was restored, plus anon key set on Vercel.
