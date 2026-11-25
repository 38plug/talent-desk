-- Talent Desk — hosted Supabase schema (shared team desk)
-- Apply once in Supabase SQL Editor (or `psql $DATABASE_URL -f …`).
-- Do NOT use local Docker for Vercel production.

create extension if not exists "pgcrypto";

-- ── Profiles (1:1 with auth.users) ──────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('owner', 'admin', 'moderator', 'user')),
  created_at timestamptz not null default now()
);

-- ── Shared desk tables (user_id = creator attribution only) ─────────────────
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  title text not null,
  company text,
  category text not null default 'forex' check (category in ('forex', 'chinese')),
  status text not null default 'Live' check (status in ('Live', 'Paused', 'Closed')),
  commission_type text not null default 'fixed' check (commission_type in ('fixed', 'percent')),
  commission_value numeric,
  commission numeric,
  salary_min numeric,
  salary_max numeric,
  salary numeric,
  location text,
  telegram text,
  description text,
  role_type text,
  accommodation boolean,
  visa boolean,
  flight boolean,
  video_call boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text,
  phone text,
  source text,
  stage text not null default 'Screening',
  market text check (market is null or market in ('forex', 'chinese')),
  gender text check (gender is null or gender in ('male', 'female')),
  offer_id uuid references public.offers (id) on delete set null,
  telegram text,
  sent_by text,
  country text,
  age numeric,
  languages text,
  current_location text,
  notes text,
  expected_salary numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  offer_id uuid references public.offers (id) on delete set null,
  scheduled_at timestamptz not null,
  outcome text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  candidate_id uuid references public.candidates (id) on delete set null,
  offer_id uuid references public.offers (id) on delete set null,
  amount numeric not null default 0,
  status text not null default 'Estimated' check (status in ('Estimated', 'Pending', 'Paid', 'Overdue')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  message text not null,
  created_at timestamptz not null default now()
);

-- If re-applying over an older per-user schema, relax NOT NULL on creator cols.
do $$ begin
  alter table public.offers alter column user_id drop not null;
exception when others then null;
end $$;
do $$ begin
  alter table public.candidates alter column user_id drop not null;
exception when others then null;
end $$;
do $$ begin
  alter table public.interviews alter column user_id drop not null;
exception when others then null;
end $$;
do $$ begin
  alter table public.earnings alter column user_id drop not null;
exception when others then null;
end $$;
do $$ begin
  alter table public.activities alter column user_id drop not null;
exception when others then null;
end $$;

-- Candidate profile columns added after the original strip (safe if already present)
alter table public.candidates add column if not exists market text;
alter table public.candidates add column if not exists gender text;
alter table public.candidates add column if not exists country text;
alter table public.candidates add column if not exists age numeric;
alter table public.candidates add column if not exists languages text;
alter table public.candidates add column if not exists current_location text;

alter table public.profiles enable row level security;
alter table public.offers enable row level security;
alter table public.candidates enable row level security;
alter table public.interviews enable row level security;
alter table public.earnings enable row level security;
alter table public.activities enable row level security;

-- Drop legacy per-user policies if re-applying over an older project
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'offers', 'candidates', 'interviews', 'earnings', 'activities')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- Profiles: every teammate can list seats; users update self; admins update roles
create policy "profiles_select_authenticated"
  on public.profiles for select
  using (auth.uid() is not null);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_admin_update"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('owner', 'admin')
    )
  );

create policy "profiles_admin_delete"
  on public.profiles for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('owner', 'admin')
    )
  );

-- Shared desk: any authenticated teammate can CRUD the full pipeline
create policy "offers_team_all"
  on public.offers for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "candidates_team_all"
  on public.candidates for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "interviews_team_all"
  on public.interviews for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "earnings_team_all"
  on public.earnings for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "activities_team_all"
  on public.activities for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Realtime (optional — SPA also refetches on focus)
do $$
begin
  alter publication supabase_realtime add table public.offers;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.candidates;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.interviews;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.earnings;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.activities;
exception when duplicate_object then null;
end $$;

-- New auth user → profile (owner / preferred admin / seat)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_email constant text := 'qrrupt@gmail.com';
  preferred_admin constant text := 'prof@gmail.com';
  assigned_role text := 'user';
  seat_count int;
begin
  if lower(new.email) = owner_email then
    assigned_role := 'owner';
  elsif lower(new.email) = preferred_admin then
    assigned_role := 'admin';
  elsif not exists (select 1 from public.profiles) then
    assigned_role := 'owner';
  else
    select count(*) into seat_count
    from public.profiles
    where role <> 'owner' and lower(email) <> owner_email;
    if seat_count >= 4 then
      raise exception 'Maximum of 4 accounts reached. No more registrations allowed.'
        using errcode = 'P0001';
    end if;
    assigned_role := 'user';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    assigned_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Hard seat cap on profile insert (covers Edge Function / dashboard inserts)
create or replace function public.enforce_account_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_email constant text := 'qrrupt@gmail.com';
  seat_count int;
begin
  if lower(new.email) = owner_email or new.role = 'owner' then
    return new;
  end if;
  select count(*) into seat_count
  from public.profiles
  where role <> 'owner' and lower(email) <> owner_email and id <> new.id;
  if seat_count >= 4 then
    raise exception 'Maximum of 4 accounts reached. No more registrations allowed.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_account_limit on public.profiles;
create trigger trg_enforce_account_limit
  before insert on public.profiles
  for each row execute function public.enforce_account_limit();
