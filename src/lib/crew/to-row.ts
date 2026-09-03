import type { CrewListingInput } from "./schema";

// Maps parsed form data to a crew_listings row. Shared by create and edit.
export function crewToRow(data: CrewListingInput) {
  return {
    role: data.role || null,
    availability: data.availability || null,

    display_name: data.displayName || null,
    headline: data.headline || null,
    years_experience: data.yearsExperience ?? null,
    languages: data.languages || null,

    licenses: data.licenses || null,
    vessel_experience: data.vesselExperience || null,

    home_base: data.homeBase || null,
    country: data.country || null,
    region: data.region || null,
    city: data.city || null,
    willing_to_travel: data.willingToTravel ?? false,

    price: data.price ?? null,
    currency: data.currency,
    rate_period: data.price != null ? (data.ratePeriod ?? null) : null,

    about: data.about || null,

    promote_social: data.promoteSocial ?? false,

    contact_phone: data.contactPhone || null,
    contact_phone_whatsapp: data.contactPhoneWhatsapp ?? false,
    contact_phone_telegram: data.contactPhoneTelegram ?? false,
    contact_email: data.contactEmail || null,
    contact_note: data.contactNote || null,
  };
}
