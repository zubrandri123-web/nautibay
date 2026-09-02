"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { boatListingSchema } from "@/lib/boats/schema";

export async function createListingAction(locale: string, input: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = boatListingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join("; ") };
  }

  const data = parsed.data;

  const { data: listing, error } = await supabase
    .from("boat_listings")
    .insert({
      seller_id: user.id,
      status: "active",
      boat_type: data.boatType,
      price: data.price,
      currency: data.currency,
      year_built: data.yearBuilt,
      length_ft: data.lengthFt,
      condition: data.condition ?? null,
      country: data.country,
      region: data.region || null,
      city: data.city || null,
      brand: data.brand || null,
      model: data.model || null,
      beam_ft: data.beamFt ?? null,
      draft_ft: data.draftFt ?? null,
      fuel_type: data.fuelType ?? null,
      engine_power_hp: data.enginePowerHp ?? null,
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
    })
    .select("id")
    .single();

  if (error || !listing) {
    return { error: error?.message ?? "Could not create listing" };
  }

  const photoRows = data.photoPaths.map((path, index) => ({
    listing_id: listing.id,
    storage_path: path,
    sort_order: index,
  }));

  const { error: photosError } = await supabase
    .from("boat_listing_photos")
    .insert(photoRows);

  if (photosError) {
    return { error: photosError.message };
  }

  redirect(`/${locale}/boats/${listing.id}`);
}
