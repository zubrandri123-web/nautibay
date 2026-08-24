import { createClient } from "@/lib/supabase/server";
import type { SearchFilters } from "./schema";

const LISTING_SUMMARY_COLUMNS =
  "id, boat_type, price, currency, year_built, length_ft, country, region, city, brand, model, boat_listing_photos(storage_path, sort_order)";

// Supabase's query builder can't infer real column types from a plain
// string select list without generated Database types (that requires a
// linked project, which doesn't exist until the user creates one), so the
// shape is asserted explicitly here instead.
export type BoatListingSummary = {
  id: string;
  boat_type: string;
  price: number;
  currency: string;
  year_built: number;
  length_ft: number;
  country: string;
  region: string | null;
  city: string | null;
  brand: string | null;
  model: string | null;
  boat_listing_photos: { storage_path: string; sort_order: number }[] | null;
};

export async function searchBoatListings(
  filters: SearchFilters,
): Promise<BoatListingSummary[]> {
  const supabase = await createClient();

  let query = supabase
    .from("boat_listings")
    .select(LISTING_SUMMARY_COLUMNS)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters.type) query = query.eq("boat_type", filters.type);
  if (filters.priceMin != null) query = query.gte("price", filters.priceMin);
  if (filters.priceMax != null) query = query.lte("price", filters.priceMax);
  if (filters.yearMin != null) query = query.gte("year_built", filters.yearMin);
  if (filters.yearMax != null) query = query.lte("year_built", filters.yearMax);
  if (filters.lengthMin != null) query = query.gte("length_ft", filters.lengthMin);
  if (filters.lengthMax != null) query = query.lte("length_ft", filters.lengthMax);
  if (filters.country && filters.country.length > 0) {
    query = query.in("country", filters.country);
  }
  if (filters.hullMaterial) query = query.eq("hull_material", filters.hullMaterial);
  if (filters.fuelType) query = query.eq("fuel_type", filters.fuelType);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.q) {
    // Strip PostgREST filter-string delimiters from free-text input so a
    // search term can't inject extra filter clauses into .or().
    const safeQ = filters.q.replace(/[,()]/g, " ").trim();
    if (safeQ) query = query.or(`brand.ilike.%${safeQ}%,model.ilike.%${safeQ}%`);
  }

  const { data, error } = await query.limit(60);
  if (error) throw error;
  return (data ?? []) as unknown as BoatListingSummary[];
}

export async function searchNearbyListings(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<BoatListingSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("nearby_listings", {
      origin_lat: lat,
      origin_lng: lng,
      radius_km: radiusKm,
    })
    .select(LISTING_SUMMARY_COLUMNS)
    .limit(60);

  if (error) throw error;
  return (data ?? []) as unknown as BoatListingSummary[];
}

export async function getBoatListing(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boat_listings")
    .select("*, boat_listing_photos(storage_path, sort_order), profiles(full_name)")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error) return null;
  return data;
}
