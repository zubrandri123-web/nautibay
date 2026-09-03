// Section 5: crew & skippers looking for work. A person posts their profile;
// boat owners and charter companies browse and contact them. Kept light —
// only a contact is required.

export const CREW_ROLES = [
  "skipper",
  "first_mate",
  "deckhand",
  "engineer",
  "cook",
  "steward",
  "instructor",
  "delivery",
  "other",
] as const;

export const CREW_AVAILABILITY = [
  "permanent",
  "seasonal",
  "daily",
  "delivery",
  "occasional",
] as const;

// Pay unit when a rate is given. Reads from the shared RatePeriod namespace
// (with an extra "month" key).
export const CREW_RATE_PERIODS = ["month", "week", "day", "trip"] as const;

export type CrewRole = (typeof CREW_ROLES)[number];
export type CrewAvailability = (typeof CREW_AVAILABILITY)[number];
export type CrewRatePeriod = (typeof CREW_RATE_PERIODS)[number];
