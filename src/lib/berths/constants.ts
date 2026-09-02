export const PLACE_TYPES = ["wet_berth", "dry_storage", "locker"] as const;
export const DEALS = ["sale", "rent"] as const;
export const RENT_PERIODS = ["month", "season", "year"] as const;

export type PlaceType = (typeof PLACE_TYPES)[number];
export type Deal = (typeof DEALS)[number];
export type RentPeriod = (typeof RENT_PERIODS)[number];
