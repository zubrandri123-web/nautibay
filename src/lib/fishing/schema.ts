import { z } from "zod";
import { optionalEnum, optionalNumber } from "@/lib/zod-helpers";
import { COUNTRIES, CURRENCIES } from "@/lib/boats/constants";
import { CHARTER_BOAT_TYPES } from "@/lib/charter/constants";
import {
  FISHING_RATE_PERIODS,
  TRIP_DURATIONS,
  TRIP_TYPES,
} from "./constants";

export const fishingListingSchema = z
  .object({
    // Everything about the trip is optional — the owner describes what they
    // offer and guests arrange the rest by contacting them.
    tripType: optionalEnum(TRIP_TYPES),
    duration: optionalEnum(TRIP_DURATIONS),

    boatType: optionalEnum(CHARTER_BOAT_TYPES),
    boatName: z.string().trim().max(160).optional().or(z.literal("")),
    boatLengthM: optionalNumber(z.coerce.number().positive()),
    dimUnit: z.enum(["m", "ft"]).default("m"),
    maxAnglers: optionalNumber(z.coerce.number().int().positive()),

    marina: z.string().trim().max(160).optional().or(z.literal("")),
    country: optionalEnum(COUNTRIES),
    region: z.string().trim().max(120).optional().or(z.literal("")),
    city: z.string().trim().max(120).optional().or(z.literal("")),

    // Price is optional and stands alone — no period is forced.
    price: optionalNumber(z.coerce.number().positive()),
    currency: z.enum(CURRENCIES).default("EUR"),
    ratePeriod: optionalEnum(FISHING_RATE_PERIODS),

    tackleIncluded: z.coerce.boolean().optional(),
    baitIncluded: z.coerce.boolean().optional(),
    licenseIncluded: z.coerce.boolean().optional(),
    foodIncluded: z.coerce.boolean().optional(),
    keepCatch: z.coerce.boolean().optional(),
    hasLicense: z.coerce.boolean().optional(),

    season: z.string().trim().max(200).optional().or(z.literal("")),
    rules: z.string().trim().max(1000).optional().or(z.literal("")),
    description: z.string().trim().max(4000).optional().or(z.literal("")),

    promoteSocial: z.coerce.boolean().optional(),

    contactPhone: z.string().trim().max(40).optional().or(z.literal("")),
    contactPhoneWhatsapp: z.coerce.boolean().optional(),
    contactPhoneTelegram: z.coerce.boolean().optional(),
    contactEmail: z.string().trim().email().optional().or(z.literal("")),
    contactNote: z.string().trim().max(500).optional().or(z.literal("")),

    photoPaths: z.array(z.string()).min(1, "At least one photo is required"),
  })
  .refine(
    (d) => Boolean(d.contactPhone?.trim() || d.contactEmail?.trim()),
    { path: ["contactPhone"], message: "Add at least a phone number or an email" },
  );

export type FishingListingFormValues = z.input<typeof fishingListingSchema>;
export type FishingListingInput = z.output<typeof fishingListingSchema>;

export const fishingFiltersSchema = z.object({
  tripType: optionalEnum(TRIP_TYPES),
  duration: optionalEnum(TRIP_DURATIONS),
  country: optionalEnum(COUNTRIES),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
});

export type FishingFilters = z.infer<typeof fishingFiltersSchema>;
