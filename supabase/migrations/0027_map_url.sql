-- Optional Google/Apple Maps link a seller can paste in, so a buyer can tap
-- straight to the pin instead of guessing from the address alone.
alter table public.boat_listings add column if not exists map_url text;
alter table public.berth_listings add column if not exists map_url text;
alter table public.charter_listings add column if not exists map_url text;
alter table public.fishing_listings add column if not exists map_url text;
alter table public.service_listings add column if not exists map_url text;
