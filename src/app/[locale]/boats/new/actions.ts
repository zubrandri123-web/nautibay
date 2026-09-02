"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { boatListingSchema } from "@/lib/boats/schema";
import { listingToRow } from "@/lib/boats/to-row";

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
      ...listingToRow(data),
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
