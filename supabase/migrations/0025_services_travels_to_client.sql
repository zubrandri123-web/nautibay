-- Mobile/on-site service businesses (e.g. mobile mechanics) still need a
-- required base location (country/city), but can flag that they also come
-- to the client instead of only serving customers at a fixed shop.
alter table public.service_listings
  add column if not exists travels_to_client boolean not null default false;
