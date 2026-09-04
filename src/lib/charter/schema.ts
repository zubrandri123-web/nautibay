import { z } from "zod";
import { optionalEnum, optionalNumber } from "@/lib/zod-helpers";
import { COUNTRIES, CURRENCIES, STOVE_TYPES, TOILET_TYPES } from "@/lib/boats/constants";
import { CHARTER_BOAT_TYPES, CHARTER_TYPES, RATE_PERIODS } from "./constants";

export const charterListingSchema = z
  .object({
    charterType: z.enum(CHARTER_TYPES),
    boatType: optionalEnum(CHARTER_BOAT_TYPES),
    boatName: z.string().trim().max(160).optional().or(z.literal("")),
    yearBuilt: optionalNumber(z.coerce.number().int().min(1900).max(2100)),

    marina: z.string().trim().max(160).optional().or(z.literal("")),
    country: optionalEnum(COUNTRIES),
    region: z.string().trim().max(120).optional().or(z.literal("")),
    city: z.string().trim().max(120).optional().or(z.literal("")),

    lengthM: optionalNumber(z.coerce.number().positive()),
    dimUnit: z.enum(["m", "ft"]).default("m"),
    cabins: optionalNumber(z.coerce.number().int().nonnegative()),
    berthsCount: optionalNumber(z.coerce.number().int().nonnegative()),
    maxPeople: optionalNumber(z.coerce.number().int().positive()),

    // Price is optional — a seller can describe pricing in the text instead.
    price: optionalNumber(z.coerce.number().positive()),
    currency: z.enum(CURRENCIES).default("EUR"),
    ratePeriod: optionalEnum(RATE_PERIODS),
    minDays: optionalNumber(z.coerce.number().int().positive()),

    licenseRequired: z.coerce.boolean().optional(),
    skipperIncluded: z.coerce.boolean().optional(),
    fuelIncluded: z.coerce.boolean().optional(),
    cleaningIncluded: z.coerce.boolean().optional(),
    beddingIncluded: z.coerce.boolean().optional(),
    toiletType: optionalEnum(TOILET_TYPES),
    shower: z.coerce.boolean().optional(),
    stoveType: optionalEnum(STOVE_TYPES),
    grill: z.coerce.boolean().optional(),

    season: z.string().trim().max(200).optional().or(z.literal("")),
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

export type CharterListingFormValues = z.input<typeof charterListingSchema>;
export type CharterListingInput = z.output<typeof charterListingSchema>;

export const charterFiltersSchema = z.object({
  charterType: optionalEnum(CHARTER_TYPES),
  boatType: optionalEnum(CHARTER_BOAT_TYPES),
  country: optionalEnum(COUNTRIES),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
});

export type CharterFilters = z.infer<typeof charterFiltersSchema>;
