-- Dimensions are now stored in metres (the form lets the seller type in
-- feet, but converts before saving). Rename the columns and convert the
-- handful of existing rows from feet to metres.

alter table public.boat_listings rename column length_ft to length_m;
alter table public.boat_listings rename column beam_ft  to beam_m;
alter table public.boat_listings rename column draft_ft to draft_m;

update public.boat_listings set
  length_m = round(length_m / 3.28084, 2),
  beam_m   = round(beam_m   / 3.28084, 2),
  draft_m  = round(draft_m  / 3.28084, 2);
