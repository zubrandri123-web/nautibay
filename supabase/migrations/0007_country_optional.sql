-- Boats can sit anywhere, including countries not in the pick-list. Country
-- is now optional; when blank, location comes from region/city/description.

alter table public.boat_listings
  alter column country drop not null;
