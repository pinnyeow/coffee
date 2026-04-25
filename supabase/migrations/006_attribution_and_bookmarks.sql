-- Pour — v4.5: recipe attribution + bean bookmarks
-- Apply in Supabase SQL Editor → New query → paste all → Run
-- Safe to re-run.

-- =====================================================================
-- A. Recipe attribution: link a copied brew back to its source
-- =====================================================================
alter table public.brews
  add column if not exists derived_from_brew_id uuid
    references public.brews(id) on delete set null;

create index if not exists brews_derived_from_idx on public.brews(derived_from_brew_id);

-- =====================================================================
-- B. Bean bookmarks (Want to try)
-- =====================================================================
create table if not exists public.bean_bookmarks (
  user_id uuid not null references public.users(id) on delete cascade,
  bean_id uuid not null references public.beans(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, bean_id)
);

alter table public.bean_bookmarks enable row level security;

drop policy if exists "bean_bookmarks_owner_all" on public.bean_bookmarks;
create policy "bean_bookmarks_owner_all" on public.bean_bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
