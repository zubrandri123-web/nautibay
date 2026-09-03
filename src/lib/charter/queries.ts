import { createClient } from "@/lib/supabase/server";
import type { CharterFilters } from "./schema";

const SUMMARY =
  "id, charter_type, boat_type, boat_name, price, currency, rate_period," +
  " marina, country, region, city, length_m, max_people, status," +
  " charter_listing_photos(storage_path, sort_order)";

export type CharterSummary = {
  id: string;
  charter_type: string;
  boat_type: string | null;
  boat_name: string | null;
  price: number | null;
  currency: string;
  rate_period: string | null;
  marina: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  length_m: number | null;
  max_people: number | null;
  status: string;
  charter_listing_photos: { storage_path: string; sort_order: number }[] | null;
};

export async function searchCharters(
  filters: CharterFilters,
): Promise<CharterSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("charter_listings")
    .select(SUMMARY)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters.charterType) query = query.eq("charter_type", filters.charterType);
  if (filters.boatType) query = query.eq("boat_type", filters.boatType);
  if (filters.priceMin != null) query = query.gte("price", filters.priceMin);
  if (filters.priceMax != null) query = query.lte("price", filters.priceMax);
  if (filters.country) query = query.eq("country", filters.country);

  const { data, error } = await query.limit(60);
  if (error) throw error;
  return (data ?? []) as unknown as CharterSummary[];
}

export async function getCharterListing(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("charter_listings")
    .select(
      "*, charter_listing_photos(storage_path, sort_order), profiles(full_name)",
    )
    .eq("id", id)
    .eq("status", "active")
    .single();
  if (error) return null;
  return data;
}

export async function getMyCharters() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("charter_listings")
    .select(SUMMARY)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getOwnCharter(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("charter_listings")
    .select("*, charter_listing_photos(storage_path, sort_order)")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();
  if (error) return null;
  return data;
}
