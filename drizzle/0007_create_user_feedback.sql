-- ============================================
-- User Feedback Table with RLS
-- ============================================
-- Captures user-submitted data discrepancy reports.
-- Enforces RLS so users can only see their own submissions.
-- ============================================

CREATE TABLE IF NOT EXISTS "user_feedback" (
  "id" serial PRIMARY KEY,
  "user_id" varchar(64) NOT NULL,
  "category" varchar(50) NOT NULL DEFAULT 'data_discrepancy',
  "message" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "user_feedback_user_id_idx" ON "user_feedback" ("user_id");
CREATE INDEX IF NOT EXISTS "user_feedback_category_idx" ON "user_feedback" ("category");

-- Enable Row Level Security
ALTER TABLE "user_feedback" ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "user_feedback_select_own" ON "user_feedback"
  FOR SELECT
  USING ("user_id" = current_setting('app.current_user_id', true));

CREATE POLICY "user_feedback_insert_own" ON "user_feedback"
  FOR INSERT
  WITH CHECK ("user_id" = current_setting('app.current_user_id', true));

CREATE POLICY "user_feedback_update_own" ON "user_feedback"
  FOR UPDATE
  USING ("user_id" = current_setting('app.current_user_id', true));

CREATE POLICY "user_feedback_delete_own" ON "user_feedback"
  FOR DELETE
  USING ("user_id" = current_setting('app.current_user_id', true));

