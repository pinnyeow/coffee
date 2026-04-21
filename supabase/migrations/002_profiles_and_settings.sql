-- Pour — v3 migration: profiles + settings
-- Apply this in Supabase dashboard → SQL editor → paste all → Run
-- Safe to re-run.

-- =====================================================================
-- profiles: multiple named recipe profiles per user, one starred default per method
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  method text not null check (method in ('xBloom','V60','Chemex','AeroPress','Espresso','French press','Cold brew')),
  dose_g numeric(5,2),
  grind numeric(5,2),
  ratio numeric(4,1),
  rpm integer,
  temp_c numeric(4,1),
  time_s integer,
  yield_g numeric(5,2),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists profiles_user_method_idx on public.profiles(user_id, method);

-- Only one starred default per (user, method)
create unique index if not exists profiles_one_default_per_method
  on public.profiles(user_id, method)
  where is_default = true;

alter table public.profiles enable row level security;

drop policy if exists "profiles_owner_all" on public.profiles;
create policy "profiles_owner_all" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- settings: minimal per-user prefs (defaults live in profiles)
-- =====================================================================
create table if not exists public.settings (
  user_id uuid primary key references public.users(id) on delete cascade,
  temp_unit text not null default 'C' check (temp_unit in ('C','F')),
  onboarded_from_obsidian boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "settings_owner_all" on public.settings;
create policy "settings_owner_all" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a settings row when a new users row is created
create or replace function public.handle_new_user_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_users_created_settings on public.users;
create trigger on_users_created_settings
  after insert on public.users
  for each row execute function public.handle_new_user_settings();

-- Backfill for existing users (idempotent)
insert into public.settings (user_id)
select id from public.users
on conflict (user_id) do nothing;
