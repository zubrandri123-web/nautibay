"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fishingListingSchema } from "@/lib/fishing/schema";
import { fishingToRow } from "@/lib/fishing/to-row";

export async function updateFishingAction(
  id: string,
  locale: string,
  input: unknown,
) {
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

  const { data: updated, error } = await supabase
    .from("fishing_listings")
    .update(fishingToRow(data))
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("id")
    .single();

  if (error || !updated) {
    return { error: error?.message ?? "Could not update listing" };
  }

  await supabase.from("fishing_listing_photos").delete().eq("listing_id", id);
  const { error: photosError } = await supabase
    .from("fishing_listing_photos")
    .insert(
      data.photoPaths.map((path, index) => ({
        listing_id: id,
        storage_path: path,
        sort_order: index,
      })),
    );
  if (photosError) return { error: photosError.message };

  redirect(`/${locale}/fishing/${id}`);
}
