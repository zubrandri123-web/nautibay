-- Section 4: sea fishing with a skipper. The owner has a boat and offers
-- fishing trips; guests contact and arrange the rest directly. Separate from
-- charter. Almost every field is optional. Photos reuse the "boat-photos"
-- storage bucket.

create table if not exists public.fishing_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'archived')),

  trip_type text
    check (trip_type in ('trolling', 'bottom', 'jigging', 'spinning',
                         'big_game', 'spearfishing', 'other')),
  duration text
    check (duration in ('few_hours', 'half_day', 'full_day', 'multi_day', 'night')),

  boat_type text,
  boat_name text,
  boat_length_m numeric,
  max_anglers int,

  marina text,
  country text,
  region text,
  city text,

  price numeric check (price is null or price > 0),
  currency text not null default 'EUR',
  rate_period text check (rate_period in ('trip', 'hour', 'day', 'person')),

  tackle_included boolean not null default false,
  bait_included boolean not null default false,
  license_included boolean not null default false,
  food_included boolean not null default false,
  keep_catch boolean not null default false,
  has_license boolean not null default false,

  season text,
  -- Free-text house rules the skipper sets for guests (e.g. no alcohol,
  -- no drugs, family-friendly only). Helps filter out the wrong crowd.
  rules text,
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

create index if not exists fishing_listings_status_idx on public.fishing_listings (status);
create index if not exists fishing_listings_trip_type_idx on public.fishing_listings (trip_type);
create index if not exists fishing_listings_country_idx on public.fishing_listings (country);

alter table public.fishing_listings enable row level security;

drop policy if exists "Active fishing trips are viewable by everyone" on public.fishing_listings;
create policy "Active fishing trips are viewable by everyone"
  on public.fishing_listings for select
  using (status = 'active' or seller_id = auth.uid());

drop policy if exists "Sellers can insert their own fishing trips" on public.fishing_listings;
create policy "Sellers can insert their own fishing trips"
  on public.fishing_listings for insert
  with check (seller_id = auth.uid());

drop policy if exists "Sellers can update their own fishing trips" on public.fishing_listings;
create policy "Sellers can update their own fishing trips"
  on public.fishing_listings for update
  using (seller_id = auth.uid());

drop policy if exists "Sellers can delete their own fishing trips" on public.fishing_listings;
create policy "Sellers can delete their own fishing trips"
  on public.fishing_listings for delete
  using (seller_id = auth.uid());

create table if not exists public.fishing_listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.fishing_listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0
);

create index if not exists fishing_listing_photos_listing_id_idx
  on public.fishing_listing_photos (listing_id);

alter table public.fishing_listing_photos enable row level security;

drop policy if exists "Fishing photos are viewable by everyone" on public.fishing_listing_photos;
create policy "Fishing photos are viewable by everyone"
  on public.fishing_listing_photos for select
  using (true);

drop policy if exists "Sellers can manage photos on their own fishing trips" on public.fishing_listing_photos;
create policy "Sellers can manage photos on their own fishing trips"
  on public.fishing_listing_photos for all
  using (
    exists (
      select 1 from public.fishing_listings
      where fishing_listings.id = fishing_listing_photos.listing_id
        and fishing_listings.seller_id = auth.uid()
    )
  );
