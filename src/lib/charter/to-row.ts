import type { CharterListingInput } from "./schema";

// Maps parsed form data to a charter_listings row. Length arrives already in
// metres (the form converts). Shared by create and edit.
export function charterToRow(data: CharterListingInput) {
  return {
    charter_type: data.charterType,
    boat_type: data.boatType || null,
    boat_name: data.boatName || null,
    year_built: data.yearBuilt ?? null,

    marina: data.marina || null,
    country: data.country || null,
    region: data.region || null,
    city: data.city || null,

    length_m: data.lengthM ?? null,
    cabins: data.cabins ?? null,
    berths_count: data.berthsCount ?? null,
    max_people: data.maxPeople ?? null,

    price: data.price ?? null,
    currency: data.currency,
    // A period only means something next to a price.
    rate_period: data.price != null ? (data.ratePeriod ?? null) : null,
    min_days: data.minDays ?? null,

    license_required: data.licenseRequired ?? false,
    skipper_included: data.skipperIncluded ?? false,
    fuel_included: data.fuelIncluded ?? false,
    cleaning_included: data.cleaningIncluded ?? false,
    bedding_included: data.beddingIncluded ?? false,
    toilet_type: data.toiletType ?? null,
    shower: data.shower ?? false,
    stove_type: data.stoveType ?? null,
    grill: data.grill ?? false,

    season: data.season || null,
    description: data.description || null,

    promote_social: data.promoteSocial ?? false,

    contact_phone: data.contactPhone || null,
    contact_phone_whatsapp: data.contactPhoneWhatsapp ?? false,
    contact_phone_telegram: data.contactPhoneTelegram ?? false,
    contact_email: data.contactEmail || null,
    contact_note: data.contactNote || null,
  };
}
