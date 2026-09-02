-- Seller contact details, per listing. Shown on the listing page only to
-- signed-in visitors (anti-spam). The seller provides at least a phone or
-- an email; the checkboxes say which apps the phone number is on.

alter table public.boat_listings
  add column if not exists contact_phone text,
  add column if not exists contact_phone_whatsapp boolean not null default false,
  add column if not exists contact_phone_telegram boolean not null default false,
  add column if not exists contact_email text,
  add column if not exists contact_note text;
