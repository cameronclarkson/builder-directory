import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ?? "https://erfvtaswzlawzegwnlww.supabase.co";
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZnZ0YXN3emxhd3plZ3dubHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzkyMjUsImV4cCI6MjA4NTM1NTIyNX0.wFwN0QzRTJMROTVMIyduzlGuhBwnRQ_JUb414aJjkSo";

export const supabase = createClient(supabaseUrl, supabaseKey);





export interface Contact {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  website: string | null;
  business: string | null;
  status: string | null;
  focus: string | null;
  target_markets: string[] | null;
  market: string | null;
  buy_box: string | null;
  notes: string | null;
  buyer_type: string | null;
  next_action: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string | null;
}

export async function getAllContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("company", { ascending: true });

  if (error) {
    console.error("Error fetching contacts:", error);
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }

  return data || [];
}

export async function searchContacts(
  query: string,
  marketFilter?: string | string[],
  buyerTypeFilter?: string | string[]
): Promise<Contact[]> {
  let q = supabase.from("contacts").select("*");

  // Search by name, company, email
  if (query) {
    q = q.or(
      `name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`
    );
  }

  // Filter by market
  if (marketFilter) {
    const markets = Array.isArray(marketFilter) ? marketFilter : [marketFilter];
    const validMarkets = markets.filter(m => m !== "all");
    if (validMarkets.length > 0) {
      q = q.in("market", validMarkets);
    }
  }

  // Filter by buyer type
  if (buyerTypeFilter) {
    const buyerTypes = Array.isArray(buyerTypeFilter) ? buyerTypeFilter : [buyerTypeFilter];
    const validBuyerTypes = buyerTypes.filter(t => t !== "all");
    if (validBuyerTypes.length > 0) {
      q = q.in("buyer_type", validBuyerTypes);
    }
  }

  const { data, error } = await q.order("company", { ascending: true });

  if (error) {
    console.error("Error searching contacts:", error);
    throw new Error(`Failed to search contacts: ${error.message}`);
  }

  return data || [];
}

export async function getUniqueMarkets(): Promise<string[]> {
  const { data, error } = await supabase
    .from("contacts")
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
    .from("contacts")
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
