import type { ServiceListingInput } from "./schema";

// Maps parsed form data to a service_listings row. Shared by create and edit.
// Note: `pinned` (the owner's house-ad flag) is intentionally NOT written here
// so editing a listing never clears it — it is set directly in the database.
export function serviceToRow(data: ServiceListingInput) {
  return {
    category: data.category || null,
    name: data.name,

    description: data.description || null,
    website: data.website || null,

    address: data.address || null,
    country: data.country,
    region: data.region || null,
    city: data.city,
    postal_code: data.postalCode,
    travels_to_client: data.travelsToClient ?? false,

    promote_social: data.promoteSocial ?? false,

    contact_phone: data.contactPhone || null,
    contact_phone_whatsapp: data.contactPhoneWhatsapp ?? false,
    contact_phone_telegram: data.contactPhoneTelegram ?? false,
    contact_email: data.contactEmail || null,
    contact_note: data.contactNote || null,
  };
}
