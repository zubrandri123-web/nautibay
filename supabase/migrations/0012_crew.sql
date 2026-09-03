-- Section 5: crew & skippers looking for work. A person posts their profile
-- (role, experience, licences, where they can work) and boat owners / charter
-- companies contact them directly. Photos reuse the "boat-photos" bucket.

create table if not exists public.crew_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'archived')),

  role text
    check (role in ('skipper', 'first_mate', 'deckhand', 'engineer', 'cook',
                    'steward', 'instructor', 'delivery', 'other')),
  availability text
    check (availability in ('permanent', 'seasonal', 'daily', 'delivery',
                           'occasional')),

  display_name text,
  headline text,
  years_experience int,
  languages text,

  licenses text,
  vessel_experience text,

  home_base text,
  country text,
  region text,
  city text,
  willing_to_travel boolean not null default false,

  price numeric check (price is null or price > 0),
  currency text not null default 'EUR',
  rate_period text check (rate_period in ('month', 'week', 'day', 'trip')),

  about text,

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

create index if not exists crew_listings_status_idx on public.crew_listings (status);
create index if not exists crew_listings_role_idx on public.crew_listings (role);
create index if not exists crew_listings_availability_idx on public.crew_listings (availability);
create index if not exists crew_listings_country_idx on public.crew_listings (country);

alter table public.crew_listings enable row level security;

drop policy if exists "Active crew profiles are viewable by everyone" on public.crew_listings;
create policy "Active crew profiles are viewable by everyone"
  on public.crew_listings for select
  using (status = 'active' or seller_id = auth.uid());

drop policy if exists "Sellers can insert their own crew profile" on public.crew_listings;
create policy "Sellers can insert their own crew profile"
  on public.crew_listings for insert
  with check (seller_id = auth.uid());

drop policy if exists "Sellers can update their own crew profile" on public.crew_listings;
create policy "Sellers can update their own crew profile"
  on public.crew_listings for update
  using (seller_id = auth.uid());

drop policy if exists "Sellers can delete their own crew profile" on public.crew_listings;
create policy "Sellers can delete their own crew profile"
  on public.crew_listings for delete
  using (seller_id = auth.uid());

create table if not exists public.crew_listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.crew_listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0
);

create index if not exists crew_listing_photos_listing_id_idx
  on public.crew_listing_photos (listing_id);

alter table public.crew_listing_photos enable row level security;

drop policy if exists "Crew photos are viewable by everyone" on public.crew_listing_photos;
create policy "Crew photos are viewable by everyone"
  on public.crew_listing_photos for select
  using (true);

drop policy if exists "Sellers can manage photos on their own crew profile" on public.crew_listing_photos;
create policy "Sellers can manage photos on their own crew profile"
  on public.crew_listing_photos for all
  using (
    exists (
      select 1 from public.crew_listings
      where crew_listings.id = crew_listing_photos.listing_id
        and crew_listings.seller_id = auth.uid()
    )
  );
