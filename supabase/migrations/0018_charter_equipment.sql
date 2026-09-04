-- Toilet/shower on a chartered boat — guests want to know before they book.
-- Optional, same rule as everything else: shown only when filled in.
alter table public.charter_listings
  add column if not exists toilet_type text
    check (toilet_type in ('none', 'portable', 'manual_overboard', 'holding_tank', 'composting')),
  add column if not exists shower boolean not null default false;
