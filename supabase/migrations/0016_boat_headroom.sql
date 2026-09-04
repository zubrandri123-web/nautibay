-- Interior headroom (standing height below deck) — optional, metric like the
-- other dimensions, converted from feet in the form the same way.
alter table public.boat_listings
  add column if not exists headroom_m numeric;
