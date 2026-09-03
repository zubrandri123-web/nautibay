import { createClient } from "@/lib/supabase/server";
import type { CrewFilters } from "./schema";

const SUMMARY =
  "id, role, availability, display_name, headline, years_experience," +
  " languages, home_base, available_worldwide," +
  " price, currency, rate_period, status," +
  " crew_listing_photos(storage_path, sort_order)";

export type CrewSummary = {
  id: string;
  role: string | null;
  availability: string | null;
  display_name: string | null;
  headline: string | null;
  years_experience: number | null;
  languages: string | null;
  home_base: string | null;
  available_worldwide: boolean;
  price: number | null;
  currency: string;
  rate_period: string | null;
  status: string;
  crew_listing_photos: { storage_path: string; sort_order: number }[] | null;
};

export async function searchCrew(filters: CrewFilters): Promise<CrewSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("crew_listings")
    .select(SUMMARY)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters.role) query = query.eq("role", filters.role);
  if (filters.availability) query = query.eq("availability", filters.availability);
  if (filters.worldwide) query = query.eq("available_worldwide", true);
  if (filters.expMin != null) {
    query = query.gte("years_experience", filters.expMin);
  }
  if (filters.q) {
    const safe = filters.q.replace(/[,()%*\\]/g, " ").trim();
    if (safe) {
      const p = `%${safe}%`;
      query = query.or(
        [
          `headline.ilike.${p}`,
          `about.ilike.${p}`,
          `licenses.ilike.${p}`,
          `waters.ilike.${p}`,
          `vessel_experience.ilike.${p}`,
        ].join(","),
      );
    }
  }

  const { data, error } = await query.limit(60);
  if (error) throw error;
  return (data ?? []) as unknown as CrewSummary[];
}

export async function getCrewListing(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crew_listings")
    .select(
      "*, crew_listing_photos(storage_path, sort_order), profiles(full_name)",
    )
    .eq("id", id)
    .eq("status", "active")
    .single();
  if (error) return null;
  return data;
}

export async function getMyCrew() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("crew_listings")
    .select(SUMMARY)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getOwnCrew(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("crew_listings")
    .select("*, crew_listing_photos(storage_path, sort_order)")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();
  if (error) return null;
  return data;
}
