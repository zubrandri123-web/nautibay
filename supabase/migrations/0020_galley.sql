-- Galley (kitchen) stove + grill — same optional, icon-if-filled pattern as
-- the toilet/shower fields. Grill matters most for charter/cruise listings,
-- but sellers of boats and fishing trips may want to mention it too.
alter table public.boat_listings
  add column if not exists stove_type text
    check (stove_type in ('none', 'gas', 'electric', 'induction', 'alcohol')),
  add column if not exists grill boolean not null default false;

alter table public.charter_listings
  add column if not exists stove_type text
    check (stove_type in ('none', 'gas', 'electric', 'induction', 'alcohol')),
  add column if not exists grill boolean not null default false;

alter table public.fishing_listings
  add column if not exists stove_type text
    check (stove_type in ('none', 'gas', 'electric', 'induction', 'alcohol')),
  add column if not exists grill boolean not null default false;
