/**
 * Run vector migration and backfill embeddings against your Supabase project.
 *
 * Required env:
 *   SUPABASE_DB_URL  - Direct Postgres connection string (Dashboard → Project Settings → Database → Connection string → URI)
 *   OPENAI_API_KEY   - For generating embeddings
 *
 * Optional (for backfill writes; use service role if RLS blocks anon updates):
 *   SUPABASE_SERVICE_ROLE_KEY - Lets the script update deals/contacts embedding columns
 *
 * Run: pnpm db:vector
 */
import "dotenv/config";
import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createClient } from "@supabase/supabase-js";
import { getAllDeals } from "../server/dealMatching";
import { getAllContacts } from "../server/supabase";
import {
  getEmbedding,
  dealToSearchableText,
  contactToSearchableText,
} from "../server/embeddings";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL?.trim();
const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://erfvtaswzlawzegwnlww.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZnZ0YXN3emxhd3plZ3dubHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzkyMjUsImV4cCI6MjA4NTM1NTIyNX0.wFwN0QzRTJMROTVMIyduzlGuhBwnRQ_JUb414aJjkSo";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();

async function runMigration(client: pg.Client): Promise<void> {
  const migrationPath = join(
    __dirname,
    "..",
    "supabase",
    "migrations",
    "20250304000000_add_vector_embeddings.sql"
  );
  const sql = readFileSync(migrationPath, "utf-8");
  try {
    await client.query(sql);
    console.log("Migration SQL executed.");
  } catch (e: unknown) {
    const err = e as { message?: string; code?: string };
    if (err.code === "42710" || err.code === "42P07") {
      console.log("Some objects already exist (migration may have run before).");
      return;
    }
    throw e;
  }
}

async function backfill(supabase: ReturnType<typeof createClient>): Promise<void> {
  if (!OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY not set; skipping backfill.");
    return;
  }
  console.log("Fetching deals and contacts...");
  const [deals, contacts] = await Promise.all([
    getAllDeals().catch(() => []),
    getAllContacts().catch(() => []),
  ]);
  console.log(`Deals: ${deals.length}, Contacts: ${contacts.length}`);

  for (let i = 0; i < deals.length; i++) {
    const deal = deals[i];
    const text = dealToSearchableText(deal);
    if (!text) continue;
    try {
      const embedding = await getEmbedding(text);
      const { error } = await supabase
        .from("deals")
        .update({ embedding })
        .eq("id", deal.id);
      if (error) throw new Error(error.message);
      console.log(`Deal ${i + 1}/${deals.length} embedded`);
    } catch (e) {
      console.warn(`Deal ${deal.id}:`, e);
    }
  }

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const text = contactToSearchableText(contact);
    if (!text) continue;
    try {
      const embedding = await getEmbedding(text);
      const { error } = await supabase
        .from("contacts")
        .update({ embedding })
        .eq("id", contact.id);
      if (error) throw new Error(error.message);
      console.log(`Contact ${i + 1}/${contacts.length} embedded`);
    } catch (e) {
      console.warn(`Contact ${contact.id}:`, e);
    }
  }
}

async function main(): Promise<void> {
  if (SUPABASE_DB_URL) {
    const client = new pg.Client({ connectionString: SUPABASE_DB_URL });
    await client.connect();
    try {
      console.log("Running vector migration...");
      await runMigration(client);
      console.log("Migration done.");
    } finally {
      await client.end();
    }
  } else {
    console.log(
      "SUPABASE_DB_URL not set. Run the migration manually in Supabase Dashboard → SQL Editor:"
    );
    console.log("  supabase/migrations/20250304000000_add_vector_embeddings.sql");
  }

  const key = SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY;
  const supabase = createClient(SUPABASE_URL, key);
  console.log("Running backfill...");
  await backfill(supabase);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
