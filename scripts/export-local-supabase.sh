#!/usr/bin/env bash
# Run on the operator machine that holds live Talent Desk Docker Supabase.
# Does NOT invent data — only dumps what is already in Postgres.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/dumps"
mkdir -p "$OUT"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

echo "Exporting from: $DB_URL"
echo "Output dir: $OUT"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump not found. Install PostgreSQL client tools, or use:"
  echo "  npx supabase db dump -f dumps/full-$STAMP.sql"
  exit 1
fi

pg_dump "$DB_URL" --no-owner --no-acl \
  -t public.profiles -t public.offers -t public.candidates \
  -t public.interviews -t public.earnings -t public.activities \
  -f "$OUT/public-data-$STAMP.sql"

pg_dump "$DB_URL" --no-owner --no-acl -n auth \
  -f "$OUT/auth-$STAMP.sql" || echo "WARN: auth schema dump failed — recreate users on hosted if needed."

echo "Done:"
ls -la "$OUT"/*"$STAMP"*
echo "Restore with: psql \"\$HOSTED_DATABASE_URL\" -f dumps/public-data-$STAMP.sql"
echo "Then set Vercel VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to the hosted project and redeploy."
