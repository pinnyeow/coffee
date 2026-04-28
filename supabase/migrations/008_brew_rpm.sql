-- Add xBloom motor RPM to brews. Nullable — only relevant for xBloom brews.
alter table public.brews
  add column if not exists rpm_xbloom integer;
