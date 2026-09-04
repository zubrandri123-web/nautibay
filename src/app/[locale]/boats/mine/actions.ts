"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bumpRow } from "@/lib/bump";

const STATUSES = ["active", "sold", "archived"] as const;
type Status = (typeof STATUSES)[number];

export async function setListingStatusAction(id: string, status: Status) {
  if (!STATUSES.includes(status)) return { error: "Bad status" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("boat_listings")
    .update({ status })
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/[locale]/boats/mine", "page");
  return {};
}

export async function bumpListingAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const result = await bumpRow(supabase, "boat_listings", id, user.id);
  if (!result.error && !result.hoursLeft) {
    revalidatePath("/[locale]/boats/mine", "page");
  }
  return result;
}

export async function deleteListingAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // boat_listing_photos rows cascade on delete of the listing.
  const { error } = await supabase
    .from("boat_listings")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/[locale]/boats/mine", "page");
  return {};
}
