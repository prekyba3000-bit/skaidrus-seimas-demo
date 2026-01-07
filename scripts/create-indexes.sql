-- ============================================
-- Performance Optimization: Database Indexes
-- ============================================
-- Run with: psql -d seimas -f scripts/create-indexes.sql
-- ============================================
-- MPs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mps_party ON mps(party);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mps_faction ON mps(faction);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mps_is_active ON mps(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mps_seimas_id ON mps(seimas_id);
-- MP Stats - frequently joined
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mp_stats_mp_id ON mp_stats(mp_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mp_stats_accountability ON mp_stats(accountability_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mp_stats_attendance ON mp_stats(voting_attendance DESC);
-- Bills table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bills_category ON bills(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bills_submitted_at ON bills(submitted_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bills_seimas_id ON bills(seimas_id);
-- Session Votes - high volume, critical for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_votes_sitting_id ON session_votes(sitting_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_votes_session_id ON session_votes(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_votes_vote_date ON session_votes(vote_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_votes_seimas_vote_id ON session_votes(seimas_vote_id);
-- Session MP Votes - most frequently queried table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_mp_votes_session_vote_id ON session_mp_votes(session_vote_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_mp_votes_mp_id ON session_mp_votes(mp_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_mp_votes_seimas_mp_id ON session_mp_votes(seimas_mp_id);
-- Composite index for comparison queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_mp_votes_comparison ON session_mp_votes(session_vote_id, mp_id, vote_value);
-- Committees
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_committee_members_committee_id ON committee_members(committee_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_committee_members_mp_id ON committee_members(mp_id);
-- User activity indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_follows_user_id ON user_follows(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_follows_mp_id ON user_follows(mp_id);
-- Accountability Flags
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accountability_flags_mp_id ON accountability_flags(mp_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accountability_flags_resolved ON accountability_flags(resolved);
-- Bill Sponsors
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bill_sponsors_bill_id ON bill_sponsors(bill_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bill_sponsors_mp_id ON bill_sponsors(mp_id);
-- ============================================
-- Analyze tables after index creation
-- ============================================
ANALYZE mps;
ANALYZE mp_stats;
ANALYZE bills;
ANALYZE session_votes;
ANALYZE session_mp_votes;
ANALYZE committee_members;
ANALYZE accountability_flags;
ANALYZE bill_sponsors;
-- ============================================
-- Query Performance Views
-- ============================================
-- View for MP comparison (pre-computed for speed)
CREATE OR REPLACE VIEW v_mp_vote_summary AS
SELECT mp_id,
    COUNT(*) as total_votes,
    SUM(
        CASE
            WHEN vote_value = 'už' THEN 1
            ELSE 0
        END
    ) as votes_for,
    SUM(
        CASE
            WHEN vote_value = 'prieš' THEN 1
            ELSE 0
        END
    ) as votes_against,
    SUM(
        CASE
            WHEN vote_value = 'susilaikė' THEN 1
            ELSE 0
        END
    ) as abstained
FROM session_mp_votes
GROUP BY mp_id;
-- View for dashboard pulse (activity summary)
CREATE OR REPLACE VIEW v_recent_activity AS
SELECT DATE(vote_date) as activity_date,
    COUNT(DISTINCT id) as votes_count,
    SUM(voted_for + voted_against + abstained) as total_participants
FROM session_votes
WHERE vote_date >= NOW() - INTERVAL '30 days'
GROUP BY DATE(vote_date)
ORDER BY activity_date DESC;