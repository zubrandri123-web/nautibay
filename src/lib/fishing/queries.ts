import { createClient } from "@/lib/supabase/server";
import type { FishingFilters } from "./schema";

const SUMMARY =
  "id, trip_type, duration, boat_type, boat_name, price, currency, rate_period," +
  " marina, country, region, city, boat_length_m, max_anglers, status," +
  " fishing_listing_photos(storage_path, sort_order)";

export type FishingSummary = {
  id: string;
  trip_type: string | null;
  duration: string | null;
  boat_type: string | null;
  boat_name: string | null;
  price: number | null;
  currency: string;
  rate_period: string | null;
  marina: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  boat_length_m: number | null;
  max_anglers: number | null;
  status: string;
  fishing_listing_photos: { storage_path: string; sort_order: number }[] | null;
};

export async function searchFishing(
  filters: FishingFilters,
): Promise<FishingSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("fishing_listings")
    .select(SUMMARY)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters.tripType) query = query.eq("trip_type", filters.tripType);
  if (filters.duration) query = query.eq("duration", filters.duration);
  if (filters.boatType) query = query.eq("boat_type", filters.boatType);
  if (filters.priceMin != null) query = query.gte("price", filters.priceMin);
  if (filters.priceMax != null) query = query.lte("price", filters.priceMax);
  if (filters.country) query = query.eq("country", filters.country);

  const { data, error } = await query.limit(60);
  if (error) throw error;
  return (data ?? []) as unknown as FishingSummary[];
}

export async function getFishingListing(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fishing_listings")
    .select(
      "*, fishing_listing_photos(storage_path, sort_order), profiles(full_name)",
    )
    .eq("id", id)
    .eq("status", "active")
    .single();
  if (error) return null;
  return data;
}

export async function getMyFishing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("fishing_listings")
    .select(SUMMARY)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getOwnFishing(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("fishing_listings")
    .select("*, fishing_listing_photos(storage_path, sort_order)")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();
  if (error) return null;
  return data;
}
