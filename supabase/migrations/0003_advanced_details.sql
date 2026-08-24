-- Optional "advanced details" fields for sellers who want to fill in more —
-- all nullable, all quick-pick dropdowns rather than free text, so filling
-- them in is a few clicks, not typing.

alter table public.boat_listings
  add column if not exists description text,
  add column if not exists flag_country text,
  add column if not exists heads int,
  add column if not exists water_tank_l numeric,
  add column if not exists heating text
    check (heating in ('none', 'diesel', 'electric', 'gas')),
  add column if not exists mast_material text
    check (mast_material in ('aluminum', 'carbon', 'wood', 'steel')),
  add column if not exists steering_type text
    check (steering_type in ('wheel', 'tiller')),
  add column if not exists drive_type text
    check (drive_type in ('shaft', 'saildrive', 'outboard', 'jet')),
  add column if not exists is_broker boolean not null default false,
  add column if not exists broker_company_name text;
