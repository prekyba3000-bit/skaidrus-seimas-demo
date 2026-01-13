-- ============================================
-- Row Level Security (RLS) Implementation
-- ============================================
-- This migration enables RLS on sensitive tables and creates policies
-- that restrict access based on app.current_user_id setting.
--
-- Tables protected:
-- - users: Users can only see their own data
-- - user_follows: Users can only see their own follows
-- - user_activity_reads: Users can only see their own read status
-- ============================================

-- Enable RLS on users table
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own row
CREATE POLICY "users_select_own" ON "users"
  FOR SELECT
  USING ("openId" = current_setting('app.current_user_id', true));

-- Policy: Users can UPDATE their own row
CREATE POLICY "users_update_own" ON "users"
  FOR UPDATE
  USING ("openId" = current_setting('app.current_user_id', true));

-- Policy: Allow INSERT (for user creation during OAuth)
-- Note: We allow INSERT without RLS check for user creation
-- but the application should validate this
CREATE POLICY "users_insert_allow" ON "users"
  FOR INSERT
  WITH CHECK (true);

-- Enable RLS on user_follows table
ALTER TABLE "user_follows" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own follows
CREATE POLICY "user_follows_select_own" ON "user_follows"
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only INSERT their own follows
CREATE POLICY "user_follows_insert_own" ON "user_follows"
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only UPDATE their own follows
CREATE POLICY "user_follows_update_own" ON "user_follows"
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only DELETE their own follows
CREATE POLICY "user_follows_delete_own" ON "user_follows"
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));

-- Enable RLS on user_activity_reads table
ALTER TABLE "user_activity_reads" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own read status
CREATE POLICY "user_activity_reads_select_own" ON "user_activity_reads"
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only INSERT their own read status
CREATE POLICY "user_activity_reads_insert_own" ON "user_activity_reads"
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only UPDATE their own read status
CREATE POLICY "user_activity_reads_update_own" ON "user_activity_reads"
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only DELETE their own read status
CREATE POLICY "user_activity_reads_delete_own" ON "user_activity_reads"
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));

-- ============================================
-- Notes:
-- ============================================
-- 1. The app.current_user_id setting must be set before queries
-- 2. Use SET LOCAL in transactions for connection pooling compatibility
-- 3. The setting is session-scoped and cleared when connection returns to pool
-- 4. Admin users may need bypass - add role-based policies if needed
-- ============================================
