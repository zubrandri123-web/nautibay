-- Owner / moderator access. Emails in `admins` may review the Services
-- directory (see every listing, approve or reject). Add a moderator later
-- with:  insert into public.admins (email) values ('name@example.com');

create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into public.admins (email) values ('zubrandri123@gmail.com')
  on conflict (email) do nothing;

alter table public.admins enable row level security;

-- A signed-in user can check whether *their own* email is an admin — nothing
-- more. The list itself is not readable from the client.
drop policy if exists "Check your own admin row" on public.admins;
create policy "Check your own admin row"
  on public.admins for select
  using (email = (auth.jwt() ->> 'email'));

-- Admins can see and moderate every service listing, not just their own.
drop policy if exists "Admins can view all services" on public.service_listings;
create policy "Admins can view all services"
  on public.service_listings for select
  using (
    exists (
      select 1 from public.admins a
      where a.email = (auth.jwt() ->> 'email')
    )
  );

drop policy if exists "Admins can moderate any service" on public.service_listings;
create policy "Admins can moderate any service"
  on public.service_listings for update
  using (
    exists (
      select 1 from public.admins a
      where a.email = (auth.jwt() ->> 'email')
    )
  );
