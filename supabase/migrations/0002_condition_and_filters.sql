-- Adds the "new vs used" condition field and indexes for the extra search
-- filters (hull material, fuel type, condition) added after comparing the
-- filter panel against real competitors.

alter table public.boat_listings
  add column if not exists condition text
    check (condition in ('new', 'used'));

create index if not exists boat_listings_condition_idx on public.boat_listings (condition);
create index if not exists boat_listings_hull_material_idx on public.boat_listings (hull_material);
create index if not exists boat_listings_fuel_type_idx on public.boat_listings (fuel_type);
