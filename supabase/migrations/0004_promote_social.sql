-- Opt-in consent: the owner allows NautiBay to re-post this listing on
-- outside platforms (Facebook, Instagram, YouTube, TikTok). Defaults to
-- false, so a listing is never promoted without an explicit tick.

alter table public.boat_listings
  add column if not exists promote_social boolean not null default false;
