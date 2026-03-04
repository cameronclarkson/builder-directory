# Supabase migrations

## Vector embeddings (semantic search)

1. **Run the migration**  
   In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor** → New query.  
   Paste and run the contents of `migrations/20250304000000_add_vector_embeddings.sql`.

2. **Set `OPENAI_API_KEY`**  
   Your app uses OpenAI `text-embedding-3-small` for embeddings. Set `OPENAI_API_KEY` in your environment (e.g. `.env`).

3. **Backfill embeddings**  
   New rows have `embedding = null` until you generate and store embeddings. Use `server/embeddings.ts`:
   - `updateDealEmbedding(deal)` and `updateContactEmbedding(contact)` when creating/updating records, or
   - Run a one-off script that fetches all deals/contacts and calls those functions.

4. **Semantic search**  
   - Deals: `deals.semanticSearch({ query: "10 acres residential Georgia" })`
   - Contacts: `contacts.semanticSearch({ query: "builder looking for entitled land" })`
