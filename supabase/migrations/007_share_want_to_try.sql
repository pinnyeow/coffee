-- Pour — v4.5: opt-in sharing of Want-to-try list with friends
-- Apply in Supabase SQL Editor → New query → paste all → Run
-- Safe to re-run.

-- Add opt-in flag (default off, so behavior is unchanged unless user enables)
alter table public.settings
  add column if not exists share_want_to_try boolean not null default false;

-- Allow friends to read each other's bookmarks when the owner has enabled sharing.
-- Owner-all policy from migration 006 still allows owner full control.
drop policy if exists "bean_bookmarks_friends_read" on public.bean_bookmarks;
create policy "bean_bookmarks_friends_read" on public.bean_bookmarks
  for select using (
    exists (
      select 1 from public.settings s
      where s.user_id = bean_bookmarks.user_id
        and s.share_want_to_try = true
    )
    and exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and (
          (f.user_id = auth.uid() and f.friend_id = bean_bookmarks.user_id)
          or (f.friend_id = auth.uid() and f.user_id = bean_bookmarks.user_id)
        )
    )
  );
