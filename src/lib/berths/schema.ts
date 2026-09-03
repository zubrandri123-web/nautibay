import { z } from "zod";
import { optionalEnum, optionalNumber } from "@/lib/zod-helpers";
import { COUNTRIES, CURRENCIES } from "@/lib/boats/constants";
import { DEALS, PLACE_TYPES, RENT_PERIODS } from "./constants";

export const berthListingSchema = z
  .object({
    placeType: z.enum(PLACE_TYPES),
    deal: z.enum(DEALS),

    marina: z.string().trim().max(160).optional().or(z.literal("")),
    country: optionalEnum(COUNTRIES),
    region: z.string().trim().max(120).optional().or(z.literal("")),
    city: z.string().trim().max(120).optional().or(z.literal("")),

    lengthM: optionalNumber(z.coerce.number().positive()),
    beamM: optionalNumber(z.coerce.number().positive()),
    draftM: optionalNumber(z.coerce.number().positive()),
    dimUnit: z.enum(["m", "ft"]).default("m"),

    price: z.coerce.number().positive(),
    currency: z.enum(CURRENCIES).default("EUR"),
    rentPeriod: optionalEnum(RENT_PERIODS),

    electricity: z.coerce.boolean().optional(),
    water: z.coerce.boolean().optional(),
    security: z.coerce.boolean().optional(),
    liveaboard: z.coerce.boolean().optional(),

    description: z.string().trim().max(4000).optional().or(z.literal("")),

    promoteSocial: z.coerce.boolean().optional(),

    contactPhone: z.string().trim().max(40).optional().or(z.literal("")),
    contactPhoneWhatsapp: z.coerce.boolean().optional(),
    contactPhoneTelegram: z.coerce.boolean().optional(),
    contactEmail: z.string().trim().email().optional().or(z.literal("")),
    contactNote: z.string().trim().max(500).optional().or(z.literal("")),

    photoPaths: z.array(z.string()).optional().default([]),
  })
  .refine(
    (d) => Boolean(d.contactPhone?.trim() || d.contactEmail?.trim()),
    { path: ["contactPhone"], message: "Add at least a phone number or an email" },
  )
  .refine((d) => d.deal === "sale" || Boolean(d.rentPeriod), {
    path: ["rentPeriod"],
    message: "Choose a rent period",
  });

export type BerthListingFormValues = z.input<typeof berthListingSchema>;
export type BerthListingInput = z.output<typeof berthListingSchema>;

export const berthFiltersSchema = z.object({
  placeType: optionalEnum(PLACE_TYPES),
  deal: optionalEnum(DEALS),
  country: optionalEnum(COUNTRIES),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
});

export type BerthFilters = z.infer<typeof berthFiltersSchema>;
