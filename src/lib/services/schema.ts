import { z } from "zod";
import { optionalEnum } from "@/lib/zod-helpers";
import { COUNTRIES } from "@/lib/boats/constants";
import { SERVICE_CATEGORIES } from "./constants";

export const serviceListingSchema = z
  .object({
    category: optionalEnum(SERVICE_CATEGORIES),
    name: z.string().trim().min(1, "Add a business name").max(160),

    description: z.string().trim().max(4000).optional().or(z.literal("")),
    website: z
      .string()
      .trim()
      .url()
      .max(300)
      .optional()
      .or(z.literal("")),

    address: z.string().trim().max(200).optional().or(z.literal("")),
    // Required — a base location is mandatory even for a mobile business;
    // travelsToClient below is how they say they also come to the customer.
    country: z.enum(COUNTRIES),
    region: z.string().trim().max(120).optional().or(z.literal("")),
    city: z.string().trim().min(1).max(120),
    // Required alongside city — city names collide across the world, the
    // postal code is what actually pins the place down for a searching buyer.
    postalCode: z.string().trim().min(1).max(20),
    travelsToClient: z.coerce.boolean().optional(),

    promoteSocial: z.coerce.boolean().optional(),

    // Must be ticked — a genuine marine business, nothing off-topic.
    agreeRules: z.coerce.boolean().optional(),

    contactPhone: z.string().trim().max(40).optional().or(z.literal("")),
    contactPhoneWhatsapp: z.coerce.boolean().optional(),
    contactPhoneTelegram: z.coerce.boolean().optional(),
    contactEmail: z.string().trim().email().optional().or(z.literal("")),
    contactNote: z.string().trim().max(500).optional().or(z.literal("")),

    // Logo / storefront / workshop shots — optional.
    photoPaths: z.array(z.string()).optional().default([]),
  })
  .refine(
    (d) => Boolean(d.contactPhone?.trim() || d.contactEmail?.trim()),
    { path: ["contactPhone"], message: "Add at least a phone number or an email" },
  )
  .refine((d) => d.agreeRules === true, {
    path: ["agreeRules"],
    message: "Please confirm this is a genuine marine business",
  });

export type ServiceListingFormValues = z.input<typeof serviceListingSchema>;
export type ServiceListingInput = z.output<typeof serviceListingSchema>;

export const serviceFiltersSchema = z.object({
  category: optionalEnum(SERVICE_CATEGORIES),
  country: optionalEnum(COUNTRIES),
  q: z.string().trim().max(80).optional(),
});

export type ServiceFilters = z.infer<typeof serviceFiltersSchema>;
