import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://erfvtaswzlawzegwnlww.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZnZ0YXN3emxhd3plZ3dubHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzkyMjUsImV4cCI6MjA4NTM1NTIyNX0.wFwN0QzRTJMROTVMIyduzlGuhBwnRQ_JUb414aJjkSo";

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Contact {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  business: string | null;
  status: string | null;
  focus: string | null;
  target_markets: string[] | null;
  buy_box: string | null;
  next_action: string | null;
  follow_up_date: string | null;
  created_at: string;
}

export async function getAllContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contacts:", error);
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }

  return data || [];
}

export async function searchContacts(
  query: string,
  statusFilter?: string,
  focusFilter?: string
): Promise<Contact[]> {
  let q = supabase.from("contacts").select("*");

  // Search by name, company, email, or focus
  if (query) {
    q = q.or(
      `name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%,focus.ilike.%${query}%`
    );
  }

  // Filter by status
  if (statusFilter && statusFilter !== "all") {
    q = q.eq("status", statusFilter);
  }

  // Filter by focus
  if (focusFilter && focusFilter !== "all") {
    q = q.eq("focus", focusFilter);
  }

  const { data, error } = await q.order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching contacts:", error);
    throw new Error(`Failed to search contacts: ${error.message}`);
  }

  return data || [];
}

export async function getUniqueFocuses(): Promise<string[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("focus")
    .not("focus", "is", null);

  if (error) {
    console.error("Error fetching focuses:", error);
    return [];
  }

  const focuses = data
    ?.map((item: { focus: string | null }) => item.focus)
    .filter((f: string | null | undefined): f is string => f !== null && f !== "");

  return Array.from(new Set<string>(focuses || [])).sort();
}

export async function getUniqueStatuses(): Promise<string[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("status")
    .not("status", "is", null);

  if (error) {
    console.error("Error fetching statuses:", error);
    return [];
  }

  const statuses = data
    ?.map((item: { status: string | null }) => item.status)
    .filter((s: string | null | undefined): s is string => s !== null && s !== "");

  return Array.from(new Set<string>(statuses || [])).sort();
}
