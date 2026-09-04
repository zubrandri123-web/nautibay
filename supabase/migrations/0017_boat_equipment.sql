-- More optional boat detail fields — same rule as the tank/headroom fields:
-- nothing required, shown with an icon only when the seller fills it in.
alter table public.boat_listings
  add column if not exists toilet_type text
    check (toilet_type in ('none', 'portable', 'manual_overboard', 'holding_tank', 'composting')),
  add column if not exists shower boolean not null default false,
  add column if not exists steering_type text
    check (steering_type in ('tiller', 'wheel')),
  add column if not exists keel_type text
    check (keel_type in ('fin', 'full', 'bulb', 'wing', 'bilge', 'centerboard', 'lifting')),
  add column if not exists engine_mount text
    check (engine_mount in ('inboard', 'outboard', 'sterndrive'));
