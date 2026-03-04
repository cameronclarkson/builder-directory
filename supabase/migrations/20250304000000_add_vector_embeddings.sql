-- Enable pgvector for semantic search
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query
create extension if not exists vector with schema extensions;

-- Add embedding column to deals (searchable by title, location, description, etc.)
-- 1536 dimensions = OpenAI text-embedding-3-small
alter table public.deals
  add column if not exists embedding extensions.vector(1536);

-- Add embedding column to contacts (searchable by name, company, buy_box, market, etc.)
alter table public.contacts
  add column if not exists embedding extensions.vector(1536);

-- HNSW index for fast approximate nearest neighbor search on deals
create index if not exists deals_embedding_idx on public.deals
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- HNSW index for contacts
create index if not exists contacts_embedding_idx on public.contacts
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- RPC: semantic search over deals (returns deal rows + similarity score)
create or replace function match_deals(
  query_embedding extensions.vector(1536),
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  id uuid,
  title text,
  location text,
  description text,
  value text,
  acreage text,
  zoning text,
  deal_type text,
  stage text,
  status text,
  created_at timestamptz,
  similarity float
)
language sql stable
as $$
  select
    d.id,
    d.title,
    d.location,
    d.description,
    d.value,
    d.acreage,
    d.zoning,
    d.deal_type,
    d.stage,
    d.status,
    d.created_at,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.deals d
  where d.embedding is not null
    and 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- RPC: semantic search over contacts (buyers)
create or replace function match_contacts(
  query_embedding extensions.vector(1536),
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  id uuid,
  name text,
  email text,
  company text,
  market text,
  buy_box text,
  buyer_type text,
  similarity float
)
language sql stable
as $$
  select
    c.id,
    c.name,
    c.email,
    c.company,
    c.market,
    c.buy_box,
    c.buyer_type,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.contacts c
  where c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
