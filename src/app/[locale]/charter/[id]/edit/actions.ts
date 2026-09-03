"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { charterListingSchema } from "@/lib/charter/schema";
import { charterToRow } from "@/lib/charter/to-row";

export async function updateCharterAction(
  id: string,
  locale: string,
  input: unknown,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = charterListingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const { data: updated, error } = await supabase
    .from("charter_listings")
    .update(charterToRow(data))
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("id")
    .single();

  if (error || !updated) {
    return { error: error?.message ?? "Could not update listing" };
  }

  await supabase.from("charter_listing_photos").delete().eq("listing_id", id);
  const { error: photosError } = await supabase
    .from("charter_listing_photos")
    .insert(
      data.photoPaths.map((path, index) => ({
        listing_id: id,
        storage_path: path,
        sort_order: index,
      })),
    );
  if (photosError) return { error: photosError.message };

  redirect(`/${locale}/charter/${id}`);
}
