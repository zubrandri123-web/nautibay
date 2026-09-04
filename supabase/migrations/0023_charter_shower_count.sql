-- How many showers aboard — catamarans and larger charter boats often have
-- more than one. Optional, independent of the shower checkbox.
alter table public.charter_listings
  add column if not exists shower_count int;
