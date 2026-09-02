import { createClient } from "@/lib/supabase/server";
import type { BerthFilters } from "./schema";

const SUMMARY =
  "id, place_type, deal, price, currency, rent_period, marina," +
  " country, region, city, length_m, status," +
  " berth_listing_photos(storage_path, sort_order)";

export type BerthSummary = {
  id: string;
  place_type: string;
  deal: string;
  price: number;
  currency: string;
  rent_period: string | null;
  marina: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  length_m: number | null;
  status: string;
  berth_listing_photos: { storage_path: string; sort_order: number }[] | null;
};

export async function searchBerths(filters: BerthFilters): Promise<BerthSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("berth_listings")
    .select(SUMMARY)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters.placeType) query = query.eq("place_type", filters.placeType);
  if (filters.deal) query = query.eq("deal", filters.deal);
  if (filters.priceMin != null) query = query.gte("price", filters.priceMin);
  if (filters.priceMax != null) query = query.lte("price", filters.priceMax);
  if (filters.country) query = query.eq("country", filters.country);

  const { data, error } = await query.limit(60);
  if (error) throw error;
  return (data ?? []) as unknown as BerthSummary[];
}

export async function getBerthListing(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("berth_listings")
    .select("*, berth_listing_photos(storage_path, sort_order), profiles(full_name)")
    .eq("id", id)
    .eq("status", "active")
    .single();
  if (error) return null;
  return data;
}

export async function getMyBerths() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("berth_listings")
    .select(SUMMARY)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getOwnBerth(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("berth_listings")
    .select("*, berth_listing_photos(storage_path, sort_order)")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();
  if (error) return null;
  return data;
}
