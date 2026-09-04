-- "Freshness" sort: every catalog now orders by bumped_at (not created_at).
-- A seller can manually refresh their own listing (rate-limited in the app,
-- 24h) to float it back to the top — the free version of what becomes a
-- paid "renew" action once payments are live.

alter table public.boat_listings add column if not exists bumped_at timestamptz;
update public.boat_listings set bumped_at = created_at where bumped_at is null;
alter table public.boat_listings alter column bumped_at set default now();
alter table public.boat_listings alter column bumped_at set not null;
create index if not exists boat_listings_bumped_at_idx on public.boat_listings (bumped_at desc);

alter table public.berth_listings add column if not exists bumped_at timestamptz;
update public.berth_listings set bumped_at = created_at where bumped_at is null;
alter table public.berth_listings alter column bumped_at set default now();
alter table public.berth_listings alter column bumped_at set not null;
create index if not exists berth_listings_bumped_at_idx on public.berth_listings (bumped_at desc);

alter table public.charter_listings add column if not exists bumped_at timestamptz;
update public.charter_listings set bumped_at = created_at where bumped_at is null;
alter table public.charter_listings alter column bumped_at set default now();
alter table public.charter_listings alter column bumped_at set not null;
create index if not exists charter_listings_bumped_at_idx on public.charter_listings (bumped_at desc);

alter table public.fishing_listings add column if not exists bumped_at timestamptz;
update public.fishing_listings set bumped_at = created_at where bumped_at is null;
alter table public.fishing_listings alter column bumped_at set default now();
alter table public.fishing_listings alter column bumped_at set not null;
create index if not exists fishing_listings_bumped_at_idx on public.fishing_listings (bumped_at desc);

alter table public.crew_listings add column if not exists bumped_at timestamptz;
update public.crew_listings set bumped_at = created_at where bumped_at is null;
alter table public.crew_listings alter column bumped_at set default now();
alter table public.crew_listings alter column bumped_at set not null;
create index if not exists crew_listings_bumped_at_idx on public.crew_listings (bumped_at desc);

alter table public.service_listings add column if not exists bumped_at timestamptz;
update public.service_listings set bumped_at = created_at where bumped_at is null;
alter table public.service_listings alter column bumped_at set default now();
alter table public.service_listings alter column bumped_at set not null;
create index if not exists service_listings_bumped_at_idx on public.service_listings (bumped_at desc);
