import { z } from "zod";
import { optionalEnum, optionalNumber } from "@/lib/zod-helpers";
import { COUNTRIES, CURRENCIES } from "@/lib/boats/constants";
import { CREW_AVAILABILITY, CREW_RATE_PERIODS, CREW_ROLES } from "./constants";

export const crewListingSchema = z
  .object({
    role: optionalEnum(CREW_ROLES),
    availability: optionalEnum(CREW_AVAILABILITY),

    displayName: z.string().trim().max(120).optional().or(z.literal("")),
    headline: z.string().trim().max(200).optional().or(z.literal("")),
    yearsExperience: optionalNumber(z.coerce.number().int().min(0).max(80)),
    languages: z.string().trim().max(300).optional().or(z.literal("")),

    licenses: z.string().trim().max(1000).optional().or(z.literal("")),
    vesselExperience: z.string().trim().max(1000).optional().or(z.literal("")),

    homeBase: z.string().trim().max(160).optional().or(z.literal("")),
    country: optionalEnum(COUNTRIES),
    region: z.string().trim().max(120).optional().or(z.literal("")),
    city: z.string().trim().max(120).optional().or(z.literal("")),
    willingToTravel: z.coerce.boolean().optional(),

    // Rate is optional and stands alone — people arrange pay directly.
    price: optionalNumber(z.coerce.number().positive()),
    currency: z.enum(CURRENCIES).default("EUR"),
    ratePeriod: optionalEnum(CREW_RATE_PERIODS),

    about: z.string().trim().max(4000).optional().or(z.literal("")),

    promoteSocial: z.coerce.boolean().optional(),

    contactPhone: z.string().trim().max(40).optional().or(z.literal("")),
    contactPhoneWhatsapp: z.coerce.boolean().optional(),
    contactPhoneTelegram: z.coerce.boolean().optional(),
    contactEmail: z.string().trim().email().optional().or(z.literal("")),
    contactNote: z.string().trim().max(500).optional().or(z.literal("")),

    // A photo is optional here — some people prefer not to post their face.
    photoPaths: z.array(z.string()).optional().default([]),
  })
  .refine(
    (d) => Boolean(d.contactPhone?.trim() || d.contactEmail?.trim()),
    { path: ["contactPhone"], message: "Add at least a phone number or an email" },
  );

export type CrewListingFormValues = z.input<typeof crewListingSchema>;
export type CrewListingInput = z.output<typeof crewListingSchema>;

export const crewFiltersSchema = z.object({
  role: optionalEnum(CREW_ROLES),
  availability: optionalEnum(CREW_AVAILABILITY),
  country: optionalEnum(COUNTRIES),
});

export type CrewFilters = z.infer<typeof crewFiltersSchema>;
