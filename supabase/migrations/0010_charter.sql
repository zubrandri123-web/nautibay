-- Section 3: charter & boat rental. A boat offered for hire — bareboat (you
-- skipper it), skippered (with a captain), crewed (captain + crew), or by the
-- cabin (cruise-style). Separate from boats-for-sale and berths. Photos reuse
-- the existing "boat-photos" storage bucket.

create table if not exists public.charter_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'archived')),

  charter_type text not null
    check (charter_type in ('bareboat', 'skippered', 'crewed', 'cabin')),
  boat_type text,
  boat_name text,
  year_built int,

  marina text,
  country text,
  region text,
  city text,

  length_m numeric,
  cabins int,
  berths_count int,
  max_people int,

  -- Price is optional here — a seller may only describe pricing in the text.
  price numeric check (price is null or price > 0),
  currency text not null default 'EUR',
  rate_period text check (rate_period in ('hour', 'day', 'week', 'person')),
  min_days int,

  license_required boolean not null default false,
  skipper_included boolean not null default false,
  fuel_included boolean not null default false,
  cleaning_included boolean not null default false,
  bedding_included boolean not null default false,

  season text,
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

create index if not exists charter_listings_status_idx on public.charter_listings (status);
create index if not exists charter_listings_charter_type_idx on public.charter_listings (charter_type);
create index if not exists charter_listings_country_idx on public.charter_listings (country);

alter table public.charter_listings enable row level security;

drop policy if exists "Active charters are viewable by everyone" on public.charter_listings;
create policy "Active charters are viewable by everyone"
  on public.charter_listings for select
  using (status = 'active' or seller_id = auth.uid());

drop policy if exists "Sellers can insert their own charters" on public.charter_listings;
create policy "Sellers can insert their own charters"
  on public.charter_listings for insert
  with check (seller_id = auth.uid());

drop policy if exists "Sellers can update their own charters" on public.charter_listings;
create policy "Sellers can update their own charters"
  on public.charter_listings for update
  using (seller_id = auth.uid());

drop policy if exists "Sellers can delete their own charters" on public.charter_listings;
create policy "Sellers can delete their own charters"
  on public.charter_listings for delete
  using (seller_id = auth.uid());

create table if not exists public.charter_listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.charter_listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0
);

create index if not exists charter_listing_photos_listing_id_idx
  on public.charter_listing_photos (listing_id);

alter table public.charter_listing_photos enable row level security;

drop policy if exists "Charter photos are viewable by everyone" on public.charter_listing_photos;
create policy "Charter photos are viewable by everyone"
  on public.charter_listing_photos for select
  using (true);

drop policy if exists "Sellers can manage photos on their own charters" on public.charter_listing_photos;
create policy "Sellers can manage photos on their own charters"
  on public.charter_listing_photos for all
  using (
    exists (
      select 1 from public.charter_listings
      where charter_listings.id = charter_listing_photos.listing_id
        and charter_listings.seller_id = auth.uid()
    )
  );
