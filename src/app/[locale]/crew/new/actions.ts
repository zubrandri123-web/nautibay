"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { crewListingSchema } from "@/lib/crew/schema";
import { crewToRow } from "@/lib/crew/to-row";

export async function createCrewAction(locale: string, input: unknown) {
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

  const { data: listing, error } = await supabase
    .from("crew_listings")
    .insert({ seller_id: user.id, status: "active", ...crewToRow(data) })
    .select("id")
    .single();

  if (error || !listing) {
    return { error: error?.message ?? "Could not create listing" };
  }

  if (data.photoPaths.length > 0) {
    const { error: photosError } = await supabase
      .from("crew_listing_photos")
      .insert(
        data.photoPaths.map((path, index) => ({
          listing_id: listing.id,
          storage_path: path,
          sort_order: index,
        })),
      );
    if (photosError) return { error: photosError.message };
  }

  redirect(`/${locale}/crew/${listing.id}`);
}
