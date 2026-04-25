-- Pour — v4.1: clean up auto-derived display names; let user set their own
-- Apply in Supabase SQL Editor → New query → paste all → Run
-- Safe to re-run.

-- Stop auto-deriving display_name from email — leave NULL so UI prompts user
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

  insert into public.users (id, username)
  values (new.id, candidate)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Clear ugly auto-derived display names (containing dot or plus) so UI falls back to username
update public.users
set display_name = null
where display_name like '%.%' or display_name like '%+%';
