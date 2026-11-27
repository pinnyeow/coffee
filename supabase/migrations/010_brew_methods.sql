-- Pour — 010: brew methods (pour over + espresso)
-- Apply in Supabase SQL Editor → New query → paste all → Run. Safe to re-run.
-- Additive only: no existing column is changed or dropped. Every existing brew
-- becomes 'xBloom' via the column default; profiles are untouched apart from a
-- new empty grind_setting column.

-- ── brews ──────────────────────────────────────────────────────────────
alter table public.brews
  add column if not exists brew_method text not null default 'xBloom'
    constraint brews_brew_method_check check (brew_method in
      ('xBloom','V60','Chemex','AeroPress','Espresso','French press','Cold brew')),
  add column if not exists yield_g numeric(5,2),          -- espresso shot weight out
  add column if not exists grind_setting text,            -- non-xBloom grinders, e.g. 'Niche 14'
  add column if not exists drink_style text
    constraint brews_drink_style_check check (drink_style in
      ('Espresso','Americano','Cortado','Macchiato','Flat white','Cappuccino','Latte')),
  add column if not exists milk_kind text
    constraint brews_milk_kind_check check (milk_kind in ('whole','oat','other')),
  add column if not exists taste_balance text
    constraint brews_taste_balance_check check (taste_balance in ('sour','balanced','bitter'));

create index if not exists brews_user_bean_method_idx
  on public.brews (user_id, bean_id, brew_method);

-- One best brew per user + bean + method. Run the duplicate check in the PR
-- description first; this fails (harmlessly, nothing else changes) if duplicates exist.
create unique index if not exists brews_one_best_per_method
  on public.brews (user_id, bean_id, brew_method) where is_best;

-- ── beans ──────────────────────────────────────────────────────────────
alter table public.beans
  add column if not exists roast_level text
    constraint beans_roast_level_check check (roast_level in ('light','medium','dark')),
  add column if not exists process text
    constraint beans_process_check check (process in ('washed','natural','honey','anaerobic'));

-- ── profiles ───────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists grind_setting text;
