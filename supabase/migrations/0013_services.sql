-- Section 6: services & shops — a directory of marine businesses (yards,
-- chandlers, sailmakers, electricians, surveyors, transport, schools, …).
-- A business lists itself once; buyers browse and contact directly. Only a
-- name and a contact are required. Photos reuse the "boat-photos" bucket.

create table if not exists public.service_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  -- New listings land in 'pending_review' — they carry an outbound link, so
  -- the owner checks the site before flipping them to 'active'.
  status text not null default 'pending_review'
    check (status in ('pending_review', 'active', 'archived')),

  category text
    check (category in ('shipyard','chandlery','sails_rigging','engines',
      'electrics','hull_paint','cleaning','brokerage','insurance_finance',
      'surveyor','transport_haulage','provisioning','diving','canvas_upholstery',
      'refit_carpentry','charter_agency','school','other')),
  name text not null,

  description text,
  website text,

  address text,
  country text,
  region text,
  city text,

  contact_phone text,
  contact_phone_whatsapp boolean not null default false,
  contact_phone_telegram boolean not null default false,
  contact_email text,
  contact_note text,

  promote_social boolean not null default false,

  -- Owner house-ad: when true the listing skips the payment gate entirely and
  -- floats to the top of the catalogue. Set directly in the DB, never via the
  -- public form.
  pinned boolean not null default false,

  -- Payment-ready: unused while the site is free. Later a listing is public
  -- only while `pinned` is true OR `paid_until` is in the future.
  paid_until timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_listings_status_idx on public.service_listings (status);
create index if not exists service_listings_category_idx on public.service_listings (category);
create index if not exists service_listings_country_idx on public.service_listings (country);
create index if not exists service_listings_pinned_idx on public.service_listings (pinned);

alter table public.service_listings enable row level security;

drop policy if exists "Active services are viewable by everyone" on public.service_listings;
create policy "Active services are viewable by everyone"
  on public.service_listings for select
  using (status = 'active' or seller_id = auth.uid());

drop policy if exists "Sellers can insert their own service" on public.service_listings;
create policy "Sellers can insert their own service"
  on public.service_listings for insert
  with check (seller_id = auth.uid());

drop policy if exists "Sellers can update their own service" on public.service_listings;
create policy "Sellers can update their own service"
  on public.service_listings for update
  using (seller_id = auth.uid());

drop policy if exists "Sellers can delete their own service" on public.service_listings;
create policy "Sellers can delete their own service"
  on public.service_listings for delete
  using (seller_id = auth.uid());

create table if not exists public.service_listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.service_listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0
);

create index if not exists service_listing_photos_listing_id_idx
  on public.service_listing_photos (listing_id);

alter table public.service_listing_photos enable row level security;

drop policy if exists "Service photos are viewable by everyone" on public.service_listing_photos;
create policy "Service photos are viewable by everyone"
  on public.service_listing_photos for select
  using (true);

drop policy if exists "Sellers can manage photos on their own service" on public.service_listing_photos;
create policy "Sellers can manage photos on their own service"
  on public.service_listing_photos for all
  using (
    exists (
      select 1 from public.service_listings
      where service_listings.id = service_listing_photos.listing_id
        and service_listings.seller_id = auth.uid()
    )
  );
