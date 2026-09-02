"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const STATUSES = ["active", "rented", "sold", "archived"] as const;
type Status = (typeof STATUSES)[number];

export async function setBerthStatusAction(id: string, status: Status) {
  if (!STATUSES.includes(status)) return { error: "Bad status" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("berth_listings")
    .update({ status })
    .eq("id", id)
    .eq("seller_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/berths/mine", "page");
  return {};
}

export async function deleteBerthAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("berth_listings")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/berths/mine", "page");
  return {};
}
