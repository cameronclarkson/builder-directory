/**
 * Embeddings and semantic search for deals and contacts (buyers).
 * Uses OpenAI text-embedding-3-small (1536 dimensions). Set OPENAI_API_KEY in env.
 */
import { supabase } from "./supabase";
import type { Deal } from "./dealMatching";
import type { Contact } from "./supabase";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMS = 1536;

function getOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) {
    throw new Error("OPENAI_API_KEY is required for embeddings");
  }
  return key;
}

/** Build a single searchable text blob from a deal for embedding. */
export function dealToSearchableText(deal: Deal): string {
  const parts = [
    deal.title,
    deal.location,
    deal.description,
    deal.value,
    deal.acreage,
    deal.zoning,
    deal.deal_type,
    deal.stage,
    deal.status,
  ].filter(Boolean);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** Build a single searchable text blob from a contact for embedding. */
export function contactToSearchableText(contact: Contact): string {
  const parts = [
    contact.name,
    contact.company,
    contact.buy_box,
    contact.market,
    contact.buyer_type,
    contact.focus,
    contact.notes,
    contact.business,
  ].filter(Boolean);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** Call OpenAI Embeddings API and return the embedding vector. */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!text?.trim()) {
    throw new Error("Text is required to generate embedding");
  }
  const key = getOpenAIKey();
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8191), // model limit
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embeddings failed: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { data: [{ embedding: number[] }] };
  const embedding = data.data?.[0]?.embedding;
  if (!embedding || embedding.length !== EMBEDDING_DIMS) {
    throw new Error(`Unexpected embedding length: ${embedding?.length ?? 0}`);
  }
  return embedding;
}

/** Store embedding for a deal. Call after create/update. */
export async function updateDealEmbedding(deal: Deal): Promise<void> {
  const text = dealToSearchableText(deal);
  const embedding = await getEmbedding(text);
  const { error } = await supabase
    .from("deals")
    .update({ embedding })
    .eq("id", deal.id);
  if (error) {
    throw new Error(`Failed to update deal embedding: ${error.message}`);
  }
}

/** Store embedding for a contact. Call after create/update. */
export async function updateContactEmbedding(contact: Contact): Promise<void> {
  const text = contactToSearchableText(contact);
  const embedding = await getEmbedding(text);
  const { error } = await supabase
    .from("contacts")
    .update({ embedding })
    .eq("id", contact.id);
  if (error) {
    throw new Error(`Failed to update contact embedding: ${error.message}`);
  }
}

export interface SemanticDealMatch {
  id: string;
  title: string | null;
  location: string | null;
  description: string | null;
  value: string | null;
  acreage: string | null;
  zoning: string | null;
  deal_type: string | null;
  stage: string | null;
  status: string | null;
  created_at: string | null;
  similarity: number;
}

export interface SemanticContactMatch {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  market: string | null;
  buy_box: string | null;
  buyer_type: string | null;
  similarity: number;
}

/** Semantic search over deals. */
export async function semanticSearchDeals(
  query: string,
  options: { limit?: number; threshold?: number } = {}
): Promise<SemanticDealMatch[]> {
  const limit = options.limit ?? 10;
  const threshold = options.threshold ?? 0.5;
  const embedding = await getEmbedding(query);
  const { data, error } = await supabase.rpc("match_deals", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });
  if (error) {
    throw new Error(`Semantic search deals failed: ${error.message}`);
  }
  return (data ?? []) as SemanticDealMatch[];
}

/** Semantic search over contacts (buyers). */
export async function semanticSearchContacts(
  query: string,
  options: { limit?: number; threshold?: number } = {}
): Promise<SemanticContactMatch[]> {
  const limit = options.limit ?? 10;
  const threshold = options.threshold ?? 0.5;
  const embedding = await getEmbedding(query);
  const { data, error } = await supabase.rpc("match_contacts", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });
  if (error) {
    throw new Error(`Semantic search contacts failed: ${error.message}`);
  }
  return (data ?? []) as SemanticContactMatch[];
}
