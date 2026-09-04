"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bumpRow } from "@/lib/bump";

const STATUSES = ["active", "archived"] as const;
type Status = (typeof STATUSES)[number];

export async function setFishingStatusAction(id: string, status: Status) {
  if (!STATUSES.includes(status)) return { error: "Bad status" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("fishing_listings")
    .update({ status })
    .eq("id", id)
    .eq("seller_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/fishing/mine", "page");
  return {};
}

export async function bumpFishingAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const result = await bumpRow(supabase, "fishing_listings", id, user.id);
  if (!result.error && !result.hoursLeft) {
    revalidatePath("/[locale]/fishing/mine", "page");
  }
  return result;
}

export async function deleteFishingAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("fishing_listings")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/fishing/mine", "page");
  return {};
}
