// Section 3: charter & boat rental. A boat offered for hire.
//  - bareboat  — you skipper it yourself (licence needed)
//  - skippered — comes with a professional skipper
//  - crewed    — skipper + crew (cook / hostess), gulets and larger yachts
//  - cabin     — you book one cabin on a shared boat, cruise-style
//  - day_trip  — a short outing / day on the water with the owner or a skipper
export const CHARTER_TYPES = [
  "bareboat",
  "skippered",
  "crewed",
  "cabin",
  "day_trip",
] as const;

// What the price is quoted per. "person" is used for cabin charter / day trips.
export const RATE_PERIODS = ["hour", "day", "week", "person"] as const;

// Boat kinds relevant to charter. Reuses the BoatType translation namespace
// (with an extra "gulet" key added there).
export const CHARTER_BOAT_TYPES = [
  "sailboat",
  "catamaran",
  "motorboat",
  "motor_yacht",
  "rib",
  "gulet",
  "other",
] as const;

export type CharterType = (typeof CHARTER_TYPES)[number];
export type RatePeriod = (typeof RATE_PERIODS)[number];
export type CharterBoatType = (typeof CHARTER_BOAT_TYPES)[number];
