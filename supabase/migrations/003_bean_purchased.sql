-- Pour — v3c: track where the bean was purchased
-- Apply in Supabase SQL Editor → New query → paste all → Run
-- Safe to re-run.

alter table public.beans
  add column if not exists purchased_country text,
  add column if not exists purchased_city text,
  add column if not exists purchased_at text; -- shop/cafe name
