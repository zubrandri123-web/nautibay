"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { crewListingSchema } from "@/lib/crew/schema";
import { crewToRow } from "@/lib/crew/to-row";

export async function updateCrewAction(
  id: string,
  locale: string,
  input: unknown,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = crewListingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const { data: updated, error } = await supabase
    .from("crew_listings")
    .update(crewToRow(data))
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("id")
    .single();

  if (error || !updated) {
    return { error: error?.message ?? "Could not update listing" };
  }

  await supabase.from("crew_listing_photos").delete().eq("listing_id", id);
  if (data.photoPaths.length > 0) {
    const { error: photosError } = await supabase
      .from("crew_listing_photos")
      .insert(
        data.photoPaths.map((path, index) => ({
          listing_id: id,
          storage_path: path,
          sort_order: index,
        })),
      );
    if (photosError) return { error: photosError.message };
  }

  redirect(`/${locale}/crew/${id}`);
}
