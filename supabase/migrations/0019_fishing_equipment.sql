-- Toilet/shower on the fishing boat — so guests know what a multi-hour trip
-- actually involves. Optional, shown only when filled in.
alter table public.fishing_listings
  add column if not exists toilet_type text
    check (toilet_type in ('none', 'portable', 'manual_overboard', 'holding_tank', 'composting')),
  add column if not exists shower boolean not null default false;
