// Section 4: sea fishing with a skipper. The owner has a boat and offers
// fishing trips; guests contact and arrange the rest directly. Kept as light
// as possible — almost every field is optional.

export const TRIP_TYPES = [
  "trolling",
  "bottom",
  "jigging",
  "spinning",
  "big_game",
  "spearfishing",
  "other",
] as const;

export const TRIP_DURATIONS = [
  "few_hours",
  "half_day",
  "full_day",
  "multi_day",
  "night",
] as const;

// Price unit when a price is given. Reads from the shared RatePeriod
// namespace (with an extra "trip" key). "trip" = за выход.
export const FISHING_RATE_PERIODS = ["trip", "hour", "day", "person"] as const;

export type TripType = (typeof TRIP_TYPES)[number];
export type TripDuration = (typeof TRIP_DURATIONS)[number];
export type FishingRatePeriod = (typeof FISHING_RATE_PERIODS)[number];
