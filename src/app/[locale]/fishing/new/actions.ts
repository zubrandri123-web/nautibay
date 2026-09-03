"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fishingListingSchema } from "@/lib/fishing/schema";
import { fishingToRow } from "@/lib/fishing/to-row";

export async function createFishingAction(locale: string, input: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = fishingListingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const { data: listing, error } = await supabase
    .from("fishing_listings")
    .insert({ seller_id: user.id, status: "active", ...fishingToRow(data) })
    .select("id")
    .single();

  if (error || !listing) {
    return { error: error?.message ?? "Could not create listing" };
  }

  const { error: photosError } = await supabase
    .from("fishing_listing_photos")
    .insert(
      data.photoPaths.map((path, index) => ({
        listing_id: listing.id,
        storage_path: path,
        sort_order: index,
      })),
    );
  if (photosError) return { error: photosError.message };

  redirect(`/${locale}/fishing/${listing.id}`);
}
