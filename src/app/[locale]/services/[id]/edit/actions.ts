"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serviceListingSchema } from "@/lib/services/schema";
import { serviceToRow } from "@/lib/services/to-row";

export async function updateServiceAction(
  id: string,
  locale: string,
  input: unknown,
) {
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

  const { data: updated, error } = await supabase
    .from("service_listings")
    .update(serviceToRow(data))
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("id")
    .single();

  if (error || !updated) {
    return { error: error?.message ?? "Could not update listing" };
  }

  await supabase.from("service_listing_photos").delete().eq("listing_id", id);
  if (data.photoPaths.length > 0) {
    const { error: photosError } = await supabase
      .from("service_listing_photos")
      .insert(
        data.photoPaths.map((path, index) => ({
          listing_id: id,
          storage_path: path,
          sort_order: index,
        })),
      );
    if (photosError) return { error: photosError.message };
  }

  redirect(`/${locale}/services/${id}`);
}
