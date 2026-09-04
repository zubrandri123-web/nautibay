-- Optional tank capacities, shown with icons on the detail page alongside
-- the other engine/hull specs. Nullable, nothing depends on them.
alter table public.boat_listings
  add column if not exists fuel_tank_l numeric,
  add column if not exists water_tank_l numeric;
