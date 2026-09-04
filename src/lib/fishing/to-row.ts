import type { FishingListingInput } from "./schema";

// Maps parsed form data to a fishing_listings row. Boat length arrives
// already in metres (the form converts). Shared by create and edit.
export function fishingToRow(data: FishingListingInput) {
  return {
    trip_type: data.tripType || null,
    duration: data.duration || null,

    boat_type: data.boatType || null,
    boat_name: data.boatName || null,
    boat_length_m: data.boatLengthM ?? null,
    max_anglers: data.maxAnglers ?? null,

    marina: data.marina || null,
    country: data.country || null,
    region: data.region || null,
    city: data.city || null,
    postal_code: data.postalCode || null,
    map_url: data.mapUrl || null,

    price: data.price ?? null,
    currency: data.currency,
    rate_period: data.price != null ? (data.ratePeriod ?? null) : null,

    tackle_included: data.tackleIncluded ?? false,
    bait_included: data.baitIncluded ?? false,
    license_included: data.licenseIncluded ?? false,
    food_included: data.foodIncluded ?? false,
    keep_catch: data.keepCatch ?? false,
    has_license: data.hasLicense ?? false,
    toilet_type: data.toiletType ?? null,
    shower: data.shower ?? false,
    stove_type: data.stoveType ?? null,
    grill: data.grill ?? false,

    season: data.season || null,
    rules: data.rules || null,
    description: data.description || null,

    promote_social: data.promoteSocial ?? false,

    contact_phone: data.contactPhone || null,
    contact_phone_whatsapp: data.contactPhoneWhatsapp ?? false,
    contact_phone_telegram: data.contactPhoneTelegram ?? false,
    contact_email: data.contactEmail || null,
    contact_note: data.contactNote || null,
  };
}
