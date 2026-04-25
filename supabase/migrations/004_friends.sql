-- Pour — v4: friendships + visibility + username
-- Apply in Supabase SQL Editor → New query → paste all → Run
-- Safe to re-run.

-- =====================================================================
-- usernames: backfill from email; needed so friends can find each other
-- =====================================================================
update public.users u
set username = lower(regexp_replace(split_part(au.email, '@', 1), '[^a-z0-9]', '', 'g'))
from auth.users au
where u.id = au.id and (u.username is null or u.username = '');

-- Trigger for new sign-ups: also set username
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'g'));
  if base = '' then base := 'user'; end if;
  candidate := base;
  while exists(select 1 from public.users where username = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;

  insert into public.users (id, username, display_name)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Allow signed-in users to look up other users (needed for username search)
drop policy if exists "users_lookup_authed" on public.users;
create policy "users_lookup_authed" on public.users
  for select using (auth.uid() is not null);

-- =====================================================================
-- friendships
-- =====================================================================
create table if not exists public.friendships (
  user_id uuid not null references public.users(id) on delete cascade,
  friend_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create index if not exists friendships_friend_idx on public.friendships(friend_id);

alter table public.friendships enable row level security;

drop policy if exists "friendships_read_self" on public.friendships;
create policy "friendships_read_self" on public.friendships
  for select using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "friendships_insert_self" on public.friendships;
create policy "friendships_insert_self" on public.friendships
  for insert with check (auth.uid() = user_id);

drop policy if exists "friendships_update_either" on public.friendships;
create policy "friendships_update_either" on public.friendships
  for update using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "friendships_delete_either" on public.friendships;
create policy "friendships_delete_either" on public.friendships
  for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- =====================================================================
-- brews visibility — flip default to 'friends' so brews are shared by default
-- =====================================================================
alter table public.brews alter column visibility set default 'friends';

-- Backfill: surface existing brews to friends (Pin had no friends before so no leak)
update public.brews set visibility = 'friends' where visibility = 'self';

-- Add a read policy for accepted friends
drop policy if exists "brews_friends_read" on public.brews;
create policy "brews_friends_read" on public.brews
  for select using (
    visibility = 'friends'
    and exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
      and (
        (f.user_id = auth.uid() and f.friend_id = brews.user_id)
        or (f.friend_id = auth.uid() and f.user_id = brews.user_id)
      )
    )
  );

-- Existing brews_owner_all policy already covers owner read/write.
