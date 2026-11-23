-- Distinguish placeholder ratings (Obsidian import's default 3★) from ratings
-- the user actually chose, so the UI can always show real ratings and hide
-- placeholders. New brews default to false (user-rated).
alter table public.brews
  add column if not exists rating_is_default boolean not null default false;

-- Backfill: the import wrote rating 3 with no water temp and no RPM. Brews
-- logged through the app carry a temp from the user's profile defaults.
update public.brews
  set rating_is_default = true
  where rating = 3
    and water_temp_c is null
    and rpm_xbloom is null
    and is_best = false
    and rating_is_default = false;
