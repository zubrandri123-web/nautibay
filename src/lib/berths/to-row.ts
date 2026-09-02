import type { BerthListingInput } from "./schema";

// Maps parsed form data to a berth_listings row. Dimensions arrive already in
// metres (the form converts). Shared by create and edit.
export function berthToRow(data: BerthListingInput) {
  return {
    place_type: data.placeType,
    deal: data.deal,
    marina: data.marina || null,
    country: data.country || null,
    region: data.region || null,
    city: data.city || null,
    length_m: data.lengthM ?? null,
    beam_m: data.beamM ?? null,
    draft_m: data.draftM ?? null,
    price: data.price,
    currency: data.currency,
    rent_period: data.deal === "rent" ? (data.rentPeriod ?? null) : null,
    electricity: data.electricity ?? false,
    water: data.water ?? false,
    security: data.security ?? false,
    liveaboard: data.liveaboard ?? false,
    description: data.description || null,
    promote_social: data.promoteSocial ?? false,
    contact_phone: data.contactPhone || null,
    contact_phone_whatsapp: data.contactPhoneWhatsapp ?? false,
    contact_phone_telegram: data.contactPhoneTelegram ?? false,
    contact_email: data.contactEmail || null,
    contact_note: data.contactNote || null,
  };
}
