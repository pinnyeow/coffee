-- Pour — v1 walking skeleton schema
-- Apply this in Supabase dashboard → SQL editor → New query → paste all → Run
-- Safe to re-run: uses IF NOT EXISTS and ON CONFLICT guards

-- =====================================================================
-- 1. USERS (profile data extending auth.users)
-- =====================================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "users_self_read" on public.users;
create policy "users_self_read" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users_self_write" on public.users;
create policy "users_self_write" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a users row when a new auth.users row is created (sign-up)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 2. BEANS (shared across users)
-- =====================================================================
create table if not exists public.beans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  roaster text,
  origin text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists beans_slug_idx on public.beans(slug);
create index if not exists beans_name_idx on public.beans(lower(name));

alter table public.beans enable row level security;

drop policy if exists "beans_read_all_authed" on public.beans;
create policy "beans_read_all_authed" on public.beans
  for select using (auth.uid() is not null);

drop policy if exists "beans_insert_authed" on public.beans;
create policy "beans_insert_authed" on public.beans
  for insert with check (auth.uid() is not null);

drop policy if exists "beans_update_creator" on public.beans;
create policy "beans_update_creator" on public.beans
  for update using (auth.uid() = created_by);

-- =====================================================================
-- 3. BREWS (per-user logged brew sessions)
-- =====================================================================
create table if not exists public.brews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  bean_id uuid not null references public.beans(id) on delete cascade,
  dose_g numeric(5,2) not null,
  water_ml integer,
  grind_xbloom numeric(5,2),
  water_temp_c numeric(4,1),
  time_seconds integer,
  rating smallint not null check (rating between 1 and 5),
  notes text,
  is_best boolean not null default false,
  visibility text not null default 'self' check (visibility in ('self','friends')),
  created_at timestamptz not null default now()
);

create index if not exists brews_user_idx on public.brews(user_id, created_at desc);
create index if not exists brews_bean_idx on public.brews(bean_id, rating desc);

alter table public.brews enable row level security;

drop policy if exists "brews_owner_all" on public.brews;
create policy "brews_owner_all" on public.brews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- DONE. Verify with:
--   select * from pg_tables where schemaname = 'public';
-- =====================================================================
