-- Electrical system — optional, same icon-if-filled rule.
alter table public.boat_listings
  add column if not exists battery_voltage text
    check (battery_voltage in ('12v', '24v', '48v', 'other')),
  add column if not exists shore_power text
    check (shore_power in ('eu_230v', 'us_120v', 'both'));
