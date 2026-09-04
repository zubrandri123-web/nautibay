-- City names collide across the world; the postal code is what actually
-- pins a listing's location down for a searching buyer. Required at the
-- application layer (like country/city already are) — the column itself
-- stays nullable so existing rows aren't broken.
alter table public.boat_listings add column if not exists postal_code text;
alter table public.berth_listings add column if not exists postal_code text;
alter table public.charter_listings add column if not exists postal_code text;
alter table public.fishing_listings add column if not exists postal_code text;
alter table public.service_listings add column if not exists postal_code text;
