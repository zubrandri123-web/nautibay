"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serviceListingSchema } from "@/lib/services/schema";
import { serviceToRow } from "@/lib/services/to-row";

export async function createServiceAction(locale: string, input: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = serviceListingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  // Services carry an outbound link — new ones wait for the owner's review.
  const { data: listing, error } = await supabase
    .from("service_listings")
    .insert({
      seller_id: user.id,
      status: "pending_review",
      ...serviceToRow(data),
    })
    .select("id")
    .single();

  if (error || !listing) {
    return { error: error?.message ?? "Could not create listing" };
  }

  if (data.photoPaths.length > 0) {
    const { error: photosError } = await supabase
      .from("service_listing_photos")
      .insert(
        data.photoPaths.map((path, index) => ({
          listing_id: listing.id,
          storage_path: path,
          sort_order: index,
        })),
      );
    if (photosError) return { error: photosError.message };
  }

  redirect(`/${locale}/services/${listing.id}`);
}
