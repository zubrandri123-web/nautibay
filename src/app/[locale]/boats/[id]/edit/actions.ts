"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { boatListingSchema } from "@/lib/boats/schema";
import { listingToRow } from "@/lib/boats/to-row";

export async function updateListingAction(
  id: string,
  locale: string,
  input: unknown,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = boatListingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((issue) => issue.message).join("; "),
    };
  }
  const data = parsed.data;

  const { data: updated, error } = await supabase
    .from("boat_listings")
    .update(listingToRow(data))
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("id")
    .single();

  if (error || !updated) {
    return { error: error?.message ?? "Could not update listing" };
  }

  // Re-sync photos: drop the current rows and re-insert from the form order.
  await supabase.from("boat_listing_photos").delete().eq("listing_id", id);
  const photoRows = data.photoPaths.map((path, index) => ({
    listing_id: id,
    storage_path: path,
    sort_order: index,
  }));
  const { error: photosError } = await supabase
    .from("boat_listing_photos")
    .insert(photoRows);
  if (photosError) return { error: photosError.message };

  redirect(`/${locale}/boats/${id}`);
}
