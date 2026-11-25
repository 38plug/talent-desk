-- Talent Desk schema + RLS + account limit
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('owner', 'admin', 'moderator', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
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
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  source text,
  stage text not null default 'Screening',
  offer_id uuid references public.offers (id) on delete set null,
  telegram text,
  sent_by text,
  notes text,
  expected_salary numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  offer_id uuid references public.offers (id) on delete set null,
  scheduled_at timestamptz not null,
  outcome text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
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
  user_id uuid not null references auth.users (id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.offers enable row level security;
alter table public.candidates enable row level security;
alter table public.interviews enable row level security;
alter table public.earnings enable row level security;
alter table public.activities enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create policy "offers_all_own" on public.offers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "candidates_all_own" on public.candidates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "interviews_all_own" on public.interviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "earnings_all_own" on public.earnings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activities_all_own" on public.activities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Admins can list profiles (for console). Tighten further via Edge Functions for mutations.
create policy "profiles_admin_select" on public.profiles for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('owner', 'admin', 'moderator')
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when lower(new.email) = 'qrrupt@gmail.com' then 'owner' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4-seat cap excluding owner
create or replace function public.enforce_account_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seat_count int;
begin
  if lower(new.email) = 'qrrupt@gmail.com' or new.role = 'owner' then
    return new;
  end if;
  select count(*) into seat_count
  from public.profiles
  where role <> 'owner' and lower(email) <> 'qrrupt@gmail.com';
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
