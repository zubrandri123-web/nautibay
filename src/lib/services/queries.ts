import { createClient } from "@/lib/supabase/server";
import { pageRange } from "@/lib/pagination";
import type { ServiceFilters } from "./schema";

const SUMMARY =
  "id, category, name, description, website, address, country, region, city," +
  " pinned, status, service_listing_photos(storage_path, sort_order)";

export type ServiceSummary = {
  id: string;
  category: string | null;
  name: string;
  description: string | null;
  website: string | null;
  address: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  pinned: boolean;
  status: string;
  service_listing_photos: { storage_path: string; sort_order: number }[] | null;
};

export async function searchServices(
  filters: ServiceFilters,
  page = 1,
): Promise<{ listings: ServiceSummary[]; total: number }> {
  const supabase = await createClient();
  let query = supabase
    .from("service_listings")
    .select(SUMMARY, { count: "exact" })
    .eq("status", "active")
    // Owner house-ads (pinned) float to the top.
    .order("pinned", { ascending: false })
    .order("bumped_at", { ascending: false });

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.country) query = query.eq("country", filters.country);
  if (filters.q) {
    const safe = filters.q.replace(/[,()%*\\]/g, " ").trim();
    if (safe) {
      const p = `%${safe}%`;
      query = query.or(
        [
          `name.ilike.${p}`,
          `description.ilike.${p}`,
          `city.ilike.${p}`,
          `address.ilike.${p}`,
        ].join(","),
      );
    }
  }

  const { from, to } = pageRange(page);
  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return {
    listings: (data ?? []) as unknown as ServiceSummary[],
    total: count ?? 0,
  };
}

export async function getServiceListing(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_listings")
    .select(
      "*, service_listing_photos(storage_path, sort_order), profiles(full_name)",
    )
    .eq("id", id)
    .eq("status", "active")
    .single();
  if (error) return null;
  return data;
}

export async function getMyServices() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("service_listings")
    .select(SUMMARY)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

// Every listing awaiting review — for the moderation page. Only returns other
// people's rows when the caller is an admin (enforced by RLS).
export async function getPendingServices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_listings")
    .select(
      "id, name, category, description, website, address, country, region, city," +
        " contact_phone, contact_email, contact_note, created_at," +
        " service_listing_photos(storage_path, sort_order), profiles(full_name)",
    )
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return [];
  return data ?? [];
}

export async function getOwnService(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("service_listings")
    .select("*, service_listing_photos(storage_path, sort_order)")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();
  if (error) return null;
  return data;
}
