import type { createClient } from "@/lib/supabase/server";
import { BUMP_COOLDOWN_HOURS } from "./pagination";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Shared "bump to top" logic for every section's "My listings" page: only
// the owner can bump their own row, and only once per cooldown window. This
// is the free stand-in for what becomes a paid "renew" action later — same
// mechanism, just gated by payment instead of a timer.
export async function bumpRow(
  supabase: Supabase,
  table: string,
  id: string,
  userId: string,
): Promise<{ error?: string; hoursLeft?: number }> {
  const { data: row, error: readError } = await supabase
    .from(table)
    .select("bumped_at, seller_id")
    .eq("id", id)
    .single();
  if (readError || !row) return { error: "Listing not found" };
  if (row.seller_id !== userId) return { error: "Not authorized" };

  const hoursSince = (Date.now() - new Date(row.bumped_at).getTime()) / 3_600_000;
  if (hoursSince < BUMP_COOLDOWN_HOURS) {
    return { hoursLeft: Math.max(1, Math.ceil(BUMP_COOLDOWN_HOURS - hoursSince)) };
  }

  const { error } = await supabase
    .from(table)
    .update({ bumped_at: new Date().toISOString() })
    .eq("id", id)
    .eq("seller_id", userId);
  if (error) return { error: error.message };
  return {};
}
