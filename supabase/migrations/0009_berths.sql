-- Section 2: berths & storage. A separate listing type from boats — a place
-- in the water, a dry-storage spot, or a locker/box in a marina, for sale or
-- for rent. Photos reuse the existing "boat-photos" storage bucket.

create table if not exists public.berth_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'rented', 'sold', 'archived')),

  place_type text not null
    check (place_type in ('wet_berth', 'dry_storage', 'locker')),
  deal text not null check (deal in ('sale', 'rent')),

  marina text,
  country text,
  region text,
  city text,

  length_m numeric,
  beam_m numeric,
  draft_m numeric,

  price numeric not null check (price > 0),
  currency text not null default 'EUR',
  rent_period text check (rent_period in ('month', 'season', 'year')),

  electricity boolean not null default false,
  water boolean not null default false,
  security boolean not null default false,
  liveaboard boolean not null default false,

  description text,

  contact_phone text,
  contact_phone_whatsapp boolean not null default false,
  contact_phone_telegram boolean not null default false,
  contact_email text,
  contact_note text,

  promote_social boolean not null default false,

  -- Payment-ready: unused while the site is free. Later a listing is public
  -- only while paid_until is in the future.
  paid_until timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists berth_listings_status_idx on public.berth_listings (status);
create index if not exists berth_listings_place_type_idx on public.berth_listings (place_type);
create index if not exists berth_listings_deal_idx on public.berth_listings (deal);
create index if not exists berth_listings_country_idx on public.berth_listings (country);

alter table public.berth_listings enable row level security;

drop policy if exists "Active berths are viewable by everyone" on public.berth_listings;
create policy "Active berths are viewable by everyone"
  on public.berth_listings for select
  using (status = 'active' or seller_id = auth.uid());

drop policy if exists "Sellers can insert their own berths" on public.berth_listings;
create policy "Sellers can insert their own berths"
  on public.berth_listings for insert
  with check (seller_id = auth.uid());

drop policy if exists "Sellers can update their own berths" on public.berth_listings;
create policy "Sellers can update their own berths"
  on public.berth_listings for update
  using (seller_id = auth.uid());

drop policy if exists "Sellers can delete their own berths" on public.berth_listings;
create policy "Sellers can delete their own berths"
  on public.berth_listings for delete
  using (seller_id = auth.uid());

create table if not exists public.berth_listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.berth_listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0
);

create index if not exists berth_listing_photos_listing_id_idx
  on public.berth_listing_photos (listing_id);

alter table public.berth_listing_photos enable row level security;

drop policy if exists "Berth photos are viewable by everyone" on public.berth_listing_photos;
create policy "Berth photos are viewable by everyone"
  on public.berth_listing_photos for select
  using (true);

drop policy if exists "Sellers can manage photos on their own berths" on public.berth_listing_photos;
create policy "Sellers can manage photos on their own berths"
  on public.berth_listing_photos for all
  using (
    exists (
      select 1 from public.berth_listings
      where berth_listings.id = berth_listing_photos.listing_id
        and berth_listings.seller_id = auth.uid()
    )
  );
