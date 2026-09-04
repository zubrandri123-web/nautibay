import type { BoatListingInput } from "./schema";

// Maps parsed form data to a boat_listings row. Shared by create and edit so
// the column mapping lives in one place.
export function listingToRow(data: BoatListingInput) {
  return {
    boat_type: data.boatType,
    price: data.price,
    currency: data.currency,
    year_built: data.yearBuilt,
    length_m: data.lengthM,
    condition: data.condition ?? null,
    country: data.country || null,
    region: data.region || null,
    city: data.city || null,
    brand: data.brand || null,
    model: data.model || null,
    beam_m: data.beamM ?? null,
    draft_m: data.draftM ?? null,
    headroom_m: data.headroomM ?? null,
    fuel_type: data.fuelType ?? null,
    engine_power_hp: data.enginePowerHp ?? null,
    fuel_tank_l: data.fuelTankL ?? null,
    water_tank_l: data.waterTankL ?? null,
    hull_material: data.hullMaterial ?? null,
    cabins: data.cabins ?? null,
    berths: data.berths ?? null,
    refit_year: data.refitYear ?? null,
    sail_area_m2:
      data.boatType === "sailboat" ? (data.sailAreaM2 ?? null) : null,
    video_url: data.videoUrl || null,
    description: data.description || null,
    flag_country: data.flagCountry ?? null,
    is_broker: data.isBroker ?? false,
    broker_company_name: data.isBroker ? data.brokerCompanyName || null : null,
    promote_social: data.promoteSocial ?? false,
    contact_phone: data.contactPhone || null,
    contact_phone_whatsapp: data.contactPhoneWhatsapp ?? false,
    contact_phone_telegram: data.contactPhoneTelegram ?? false,
    contact_email: data.contactEmail || null,
    contact_note: data.contactNote || null,
  };
}
