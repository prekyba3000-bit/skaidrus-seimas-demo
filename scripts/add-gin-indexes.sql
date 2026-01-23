-- GIN Indexes for Full-Text Search Performance
-- This migration adds GIN indexes with trigram support for ILIKE queries
-- Run this after Drizzle migrations: psql -d your_database -f scripts/add-gin-indexes.sql

-- Enable pg_trgm extension for trigram-based text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes for MPs table (name, party, district)
CREATE INDEX IF NOT EXISTS idx_mps_name_gin ON mps USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_mps_party_gin ON mps USING gin(party gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_mps_district_gin ON mps USING gin(district gin_trgm_ops);

-- GIN indexes for Bills table (title, description)
CREATE INDEX IF NOT EXISTS idx_bills_title_gin ON bills USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_bills_description_gin ON bills USING gin(description gin_trgm_ops);

-- GIN indexes for Committees table (name, description)
CREATE INDEX IF NOT EXISTS idx_committees_name_gin ON committees USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_committees_description_gin ON committees USING gin(description gin_trgm_ops);

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE indexname LIKE '%_gin'
ORDER BY tablename, indexname;
