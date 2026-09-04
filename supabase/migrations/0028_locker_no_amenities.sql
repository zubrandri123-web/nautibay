-- A locker/box has no water hookup and nobody lives aboard it, but it can
-- still have electricity and be under security, so those stay. Dry storage
-- isn't in the water either — clear draft on both, on listings created
-- before this was enforced.
update public.berth_listings
set water = false, liveaboard = false, draft_m = null
where place_type = 'locker';

update public.berth_listings
set draft_m = null
where place_type = 'dry_storage';
