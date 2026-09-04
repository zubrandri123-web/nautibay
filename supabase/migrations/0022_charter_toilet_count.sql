-- How many heads aboard — optional, independent of toilet_type.
alter table public.charter_listings
  add column if not exists toilet_count int;
