import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://erfvtaswzlawzegwnlww.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZnZ0YXN3emxhd3plZ3dubHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzkyMjUsImV4cCI6MjA4NTM1NTIyNX0.wFwN0QzRTJMROTVMIyduzlGuhBwnRQ_JUb414aJjkSo";

export const supabase = createClient(supabaseUrl, supabaseKey);





export interface BuyerProfile {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  market: string | null;
  buy_box: string | null;
  notes: string | null;
  buyer_type: string | null;
  created_at: string;
}

export async function getAllBuyers(): Promise<BuyerProfile[]> {
  const { data, error } = await supabase
    .from("buyer_profiles")
    .select("*")
    .order("company", { ascending: true });

  if (error) {
    console.error("Error fetching buyers:", error);
    throw new Error(`Failed to fetch buyers: ${error.message}`);
  }

  return data || [];
}

export async function searchBuyers(
  query: string,
  marketFilter?: string,
  buyerTypeFilter?: string
): Promise<BuyerProfile[]> {
  let q = supabase.from("buyer_profiles").select("*");

  // Search by name, company, email
  if (query) {
    q = q.or(
      `name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`
    );
  }

  // Filter by market
  if (marketFilter && marketFilter !== "all") {
    q = q.eq("market", marketFilter);
  }

  // Filter by buyer type
  if (buyerTypeFilter && buyerTypeFilter !== "all") {
    q = q.eq("buyer_type", buyerTypeFilter);
  }

  const { data, error } = await q.order("company", { ascending: true });

  if (error) {
    console.error("Error searching buyers:", error);
    throw new Error(`Failed to search buyers: ${error.message}`);
  }

  return data || [];
}

export async function getUniqueMarkets(): Promise<string[]> {
  const { data, error } = await supabase
    .from("buyer_profiles")
    .select("market")
    .not("market", "is", null);

  if (error) {
    console.error("Error fetching markets:", error);
    return [];
  }

  const markets = data
    ?.map((item: { market: string | null }) => item.market)
    .filter((m: string | null | undefined): m is string => m !== null && m !== "");

  return Array.from(new Set<string>(markets || [])).sort();
}

export async function getUniqueBuyerTypes(): Promise<string[]> {
  const { data, error } = await supabase
    .from("buyer_profiles")
    .select("buyer_type")
    .not("buyer_type", "is", null);

  if (error) {
    console.error("Error fetching buyer types:", error);
    return [];
  }

  const types = data
    ?.map((item: { buyer_type: string | null }) => item.buyer_type)
    .filter((t: string | null | undefined): t is string => t !== null && t !== "");

  return Array.from(new Set<string>(types || [])).sort();
}
