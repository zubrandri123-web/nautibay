-- Hybrid propulsion (electric + combustion / generator) is increasingly
-- common on boats. Allow "hybrid" as a fuel_type value.

alter table public.boat_listings
  drop constraint if exists boat_listings_fuel_type_check;

alter table public.boat_listings
  add constraint boat_listings_fuel_type_check
    check (fuel_type in ('diesel', 'gasoline', 'electric', 'hybrid', 'none'));
