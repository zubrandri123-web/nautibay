import { z } from "zod";
import {
  BOAT_TYPES,
  CONDITIONS,
  COUNTRIES,
  FUEL_TYPES,
  HULL_MATERIALS,
} from "./constants";

// HTML number inputs hand back "" when left blank, and z.coerce.number()
// turns "" into 0 — which then fails .positive()/.min(). Treat blank as
// "not provided" so an untouched optional field validates cleanly.
const optionalNumber = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    schema.optional(),
  );

// Single source of truth for the listing form: drives client-side
// validation (react-hook-form) and is re-run on the server before writing
// to Supabase, so a tampered client request can't skip validation.
export const boatListingSchema = z.object({
  // Required — also the primary search filters.
  boatType: z.enum(BOAT_TYPES),
  price: z.coerce.number().positive(),
  currency: z.string().default("EUR"),
  yearBuilt: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  lengthFt: z.coerce.number().positive(),
  condition: z.enum(CONDITIONS).optional(),
  country: z.enum(COUNTRIES),
  region: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),

  // Important but optional.
  brand: z.string().trim().max(120).optional().or(z.literal("")),
  model: z.string().trim().max(120).optional().or(z.literal("")),
  beamFt: optionalNumber(z.coerce.number().positive()),
  draftFt: optionalNumber(z.coerce.number().positive()),
  fuelType: z.enum(FUEL_TYPES).optional(),
  enginePowerHp: optionalNumber(z.coerce.number().positive()),
  hullMaterial: z.enum(HULL_MATERIALS).optional(),
  cabins: optionalNumber(z.coerce.number().int().min(0)),
  berths: optionalNumber(z.coerce.number().int().min(0)),

  // Secondary — detail page only.
  refitYear: optionalNumber(z.coerce.number().int().min(1900)),
  sailAreaM2: optionalNumber(z.coerce.number().positive()),
  videoUrl: z.string().trim().url().optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),

  // Advanced — optional, quick-pick fields for sellers who want to add more.
  flagCountry: z.enum(COUNTRIES).optional(),
  isBroker: z.coerce.boolean().optional(),
  brokerCompanyName: z.string().trim().max(160).optional().or(z.literal("")),

  photoPaths: z.array(z.string()).min(1, "At least one photo is required"),
});

// Raw form values (numbers still strings, as HTML inputs produce them).
export type BoatListingFormValues = z.input<typeof boatListingSchema>;
// Parsed values after zod's coercion — what actually gets sent to the server.
export type BoatListingInput = z.output<typeof boatListingSchema>;

export const searchFiltersSchema = z.object({
  type: z.enum(BOAT_TYPES).optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  yearMin: z.coerce.number().int().optional(),
  yearMax: z.coerce.number().int().optional(),
  lengthMin: z.coerce.number().nonnegative().optional(),
  lengthMax: z.coerce.number().nonnegative().optional(),
  country: z.array(z.enum(COUNTRIES)).optional(),
  hullMaterial: z.enum(HULL_MATERIALS).optional(),
  fuelType: z.enum(FUEL_TYPES).optional(),
  condition: z.enum(CONDITIONS).optional(),
  q: z.string().trim().max(200).optional(),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
