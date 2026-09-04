"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bumpRow } from "@/lib/bump";

// A regular seller may only hide their listing or resubmit it for review —
// approving to 'active' is the owner's call, done in the database.
const STATUSES = ["pending_review", "archived"] as const;
type Status = (typeof STATUSES)[number];

export async function setServiceStatusAction(id: string, status: Status) {
  if (!STATUSES.includes(status)) return { error: "Bad status" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("service_listings")
    .update({ status })
    .eq("id", id)
    .eq("seller_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/services/mine", "page");
  return {};
}

export async function bumpServiceAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const result = await bumpRow(supabase, "service_listings", id, user.id);
  if (!result.error && !result.hoursLeft) {
    revalidatePath("/[locale]/services/mine", "page");
  }
  return result;
}

export async function deleteServiceAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("service_listings")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/services/mine", "page");
  return {};
}
