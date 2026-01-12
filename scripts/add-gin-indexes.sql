-- GIN Indexes for Full-Text Search Performance
-- Run this SQL script after the main migration to add GIN indexes for ILIKE queries
-- 
-- Prerequisites: Enable pg_trgm extension
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index for MP name text search (ILIKE queries)
CREATE INDEX IF NOT EXISTS mps_name_gin_idx ON mps USING gin(name gin_trgm_ops);

-- GIN index for Bill title text search (ILIKE queries)
CREATE INDEX IF NOT EXISTS bills_title_gin_idx ON bills USING gin(title gin_trgm_ops);

-- Note: These indexes significantly improve performance of ILIKE '%search%' queries
-- but require the pg_trgm extension to be enabled in PostgreSQL
