-- ============================================
-- Row Level Security (RLS) for Watchlist
-- ============================================
-- This migration enables RLS on the watchlist table
-- and creates policies that restrict access based on
-- app.current_user_id setting.
--
-- Table protected:
-- - watchlist: Users can only see and manage their own items
-- ============================================

-- Enable RLS on watchlist table
ALTER TABLE "watchlist" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own watchlist items
CREATE POLICY "watchlist_select_own" ON "watchlist"
  FOR SELECT
  USING ("user_id" = current_setting('app.current_user_id', true));

-- Policy: Users can only INSERT items for themselves
CREATE POLICY "watchlist_insert_own" ON "watchlist"
  FOR INSERT
  WITH CHECK ("user_id" = current_setting('app.current_user_id', true));

-- Policy: Users can only UPDATE their own watchlist items
CREATE POLICY "watchlist_update_own" ON "watchlist"
  FOR UPDATE
  USING ("user_id" = current_setting('app.current_user_id', true));

-- Policy: Users can only DELETE their own watchlist items
CREATE POLICY "watchlist_delete_own" ON "watchlist"
  FOR DELETE
  USING ("user_id" = current_setting('app.current_user_id', true));

