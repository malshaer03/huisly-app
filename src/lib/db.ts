import { createClient } from "@supabase/supabase-js";
import type { ToolInput } from "./tools";

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!url || !key) {
      throw new Error(
        "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
      );
    }

    supabase = createClient(url, key);
  }
  return supabase;
}

export interface Listing {
  id: string;
  city: string;
  price: number;
  size_m2?: number | null;
  description: string;
  furnished: boolean;
  source: string;
  available_from?: string | null;
  room_type?: string | null;
  contact_method?: string | null;
  post_url?: string | null;
}

export async function searchListings(params: ToolInput): Promise<Listing[]> {
  const sb = getSupabase();

  let query = sb.from("listings").select("*").eq("is_active", true).limit(10);

  // Apply filters only if provided
  if (params.city) {
    query = query.ilike("city", `%${params.city}%`);
  }
  if (params.budget_max !== undefined) {
    query = query.lte("price", params.budget_max);
  }
  if (params.furnished !== undefined) {
    query = query.eq("furnished", params.furnished);
  }
  if (params.min_size_m2 !== undefined) {
    query = query.gte("size_m2", params.min_size_m2);
  }
  // room_type column not yet in DB schema — skip filter until migration adds it

  const { data, error } = await query;

  if (error) {
    console.error("Database query error:", error);
    return [];
  }

  return (data as Listing[]) || [];
}

export function formatListingsForAI(listings: Listing[]): string {
  if (listings.length === 0) {
    return "No listings found matching these criteria.";
  }

  return `Found ${listings.length} listings. Use ALL fields in render directives:
${listings
  .map((l) =>
    JSON.stringify({
      id: l.id,
      price: l.price,
      city: l.city,
      size_m2: l.size_m2 ?? null,
      furnished: l.furnished ?? null,
      available_from: l.available_from ?? null,
      room_type: l.room_type ?? null,
      source: l.source ?? null,
      contact_method: l.contact_method ?? null,
      post_url: l.post_url ?? null,
      description: l.description ?? null,
    }),
  )
  .join("\n")}`;
}
