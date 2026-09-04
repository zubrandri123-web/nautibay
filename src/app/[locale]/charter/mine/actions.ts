"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bumpRow } from "@/lib/bump";

const STATUSES = ["active", "archived"] as const;
type Status = (typeof STATUSES)[number];

export async function setCharterStatusAction(id: string, status: Status) {
  if (!STATUSES.includes(status)) return { error: "Bad status" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("charter_listings")
    .update({ status })
    .eq("id", id)
    .eq("seller_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/charter/mine", "page");
  return {};
}

export async function bumpCharterAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const result = await bumpRow(supabase, "charter_listings", id, user.id);
  if (!result.error && !result.hoursLeft) {
    revalidatePath("/[locale]/charter/mine", "page");
  }
  return result;
}

export async function deleteCharterAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("charter_listings")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/charter/mine", "page");
  return {};
}
