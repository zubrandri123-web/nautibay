-- Yacht Marketplace — initial schema for the "Sell a boat" vertical slice.
-- Run this once in the Supabase project's SQL Editor (Dashboard > SQL Editor > New query).

-- 1. profiles ----------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  home_country text,
  current_location text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. boat_listings -------------------------------------------------------

create table if not exists public.boat_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active'
    check (status in ('draft', 'pending_review', 'active', 'sold', 'archived')),

  -- Required fields — also the primary search filters.
  boat_type text not null
    check (boat_type in ('sailboat', 'motorboat', 'catamaran', 'trimaran', 'motor_yacht', 'rib', 'other')),
  price numeric not null check (price > 0),
  currency text not null default 'EUR',
  year_built int not null,
  length_ft numeric not null check (length_ft > 0),
  country text not null,
  region text,
  city text,

  -- Important, optional.
  brand text,
  model text,
  beam_ft numeric,
  draft_ft numeric,
  fuel_type text check (fuel_type in ('diesel', 'gasoline', 'electric', 'none')),
  engine_power_hp numeric,
  hull_material text
    check (hull_material in ('fiberglass', 'wood', 'aluminum', 'steel', 'ferrocement', 'carbon_composite')),
  cabins int,
  berths int,

  -- Secondary detail fields.
  refit_year int,
  hull_condition text,
  engine_type text,
  engine_brand text,
  engine_hours numeric,
  engine_volume_l numeric,
  rig_type text,
  sail_area_m2 numeric,
  tank_volume_l numeric,
  heads int,
  equipment text[],
  documents jsonb,
  lat numeric,
  lng numeric,
  video_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists boat_listings_status_idx on public.boat_listings (status);
create index if not exists boat_listings_boat_type_idx on public.boat_listings (boat_type);
create index if not exists boat_listings_country_idx on public.boat_listings (country);
create index if not exists boat_listings_price_idx on public.boat_listings (price);
create index if not exists boat_listings_year_built_idx on public.boat_listings (year_built);
create index if not exists boat_listings_lat_lng_idx on public.boat_listings (lat, lng);

alter table public.boat_listings enable row level security;

create policy "Active listings are viewable by everyone"
  on public.boat_listings for select
  using (status = 'active' or seller_id = auth.uid());

create policy "Sellers can insert their own listings"
  on public.boat_listings for insert
  with check (seller_id = auth.uid());

create policy "Sellers can update their own listings"
  on public.boat_listings for update
  using (seller_id = auth.uid());

create policy "Sellers can delete their own listings"
  on public.boat_listings for delete
  using (seller_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists boat_listings_set_updated_at on public.boat_listings;
create trigger boat_listings_set_updated_at
  before update on public.boat_listings
  for each row execute function public.set_updated_at();

-- 3. boat_listing_photos --------------------------------------------------

create table if not exists public.boat_listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.boat_listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0
);

create index if not exists boat_listing_photos_listing_id_idx
  on public.boat_listing_photos (listing_id);

alter table public.boat_listing_photos enable row level security;

create policy "Photos are viewable by everyone"
  on public.boat_listing_photos for select
  using (true);

create policy "Sellers can manage photos on their own listings"
  on public.boat_listing_photos for all
  using (
    exists (
      select 1 from public.boat_listings
      where boat_listings.id = boat_listing_photos.listing_id
        and boat_listings.seller_id = auth.uid()
    )
  );

-- 4. Storage bucket for listing photos ------------------------------------

insert into storage.buckets (id, name, public)
values ('boat-photos', 'boat-photos', true)
on conflict (id) do nothing;

create policy "Boat photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'boat-photos');

create policy "Authenticated users can upload boat photos"
  on storage.objects for insert
  with check (
    bucket_id = 'boat-photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners can delete their boat photos"
  on storage.objects for delete
  using (bucket_id = 'boat-photos' and owner = auth.uid());

-- 5. Radius search (haversine, no PostGIS needed on the free tier) --------

create or replace function public.nearby_listings(
  origin_lat numeric,
  origin_lng numeric,
  radius_km numeric
)
returns setof public.boat_listings
language sql
stable
as $$
  select bl.*
  from public.boat_listings bl
  where bl.status = 'active'
    and bl.lat is not null
    and bl.lng is not null
    and (
      6371 * acos(
        least(1.0, greatest(-1.0,
          cos(radians(origin_lat)) * cos(radians(bl.lat)) *
          cos(radians(bl.lng) - radians(origin_lng)) +
          sin(radians(origin_lat)) * sin(radians(bl.lat))
        ))
      )
    ) <= radius_km
  order by (
    6371 * acos(
      least(1.0, greatest(-1.0,
        cos(radians(origin_lat)) * cos(radians(bl.lat)) *
        cos(radians(bl.lng) - radians(origin_lng)) +
        sin(radians(origin_lat)) * sin(radians(bl.lat))
      ))
    )
  ) asc;
$$;
