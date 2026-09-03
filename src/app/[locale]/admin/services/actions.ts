"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

async function setStatus(id: string, status: "active" | "archived") {
  if (!(await isAdmin())) return { error: "Not authorized" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("service_listings")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/admin/services", "page");
  return {};
}

export async function approveServiceAction(id: string) {
  return setStatus(id, "active");
}

export async function rejectServiceAction(id: string) {
  return setStatus(id, "archived");
}
