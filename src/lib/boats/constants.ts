export const BOAT_TYPES = [
  "sailboat",
  "motorboat",
  "catamaran",
  "trimaran",
  "motor_yacht",
  "rib",
  "other",
] as const;

export const HULL_MATERIALS = [
  "fiberglass",
  "wood",
  "aluminum",
  "steel",
  "ferrocement",
  "carbon_composite",
] as const;

export const FUEL_TYPES = [
  "diesel",
  "gasoline",
  "electric",
  "hybrid",
  "none",
] as const;

export const CONDITIONS = ["new", "used"] as const;

// Listing prices are shown as entered — no conversion. Kept short on purpose.
export const CURRENCIES = ["EUR", "USD", "GBP"] as const;

// ISO 3166-1 alpha-2 codes for the yachting markets covered by the current
// interface languages. Extend freely — search filters read this list, so
// adding a country here does not require touching any component.
export const COUNTRIES = [
  "FR",
  "ES",
  "IT",
  "GR",
  "HR",
  "TR",
  "DE",
  "PT",
  "MT",
  "ME",
  "GB",
  "US",
  "RU",
] as const;

export type BoatType = (typeof BOAT_TYPES)[number];
export type HullMaterial = (typeof HULL_MATERIALS)[number];
export type FuelType = (typeof FUEL_TYPES)[number];
export type Condition = (typeof CONDITIONS)[number];
export type CountryCode = (typeof COUNTRIES)[number];
