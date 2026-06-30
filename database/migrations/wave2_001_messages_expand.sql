-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║  WAVE 2 MIGRATION 001: Messages Table Expansion                           ║
-- ║  Add support for message labeling, archiving, and replied tracking        ║
-- ║  Platform: Supabase (PostgreSQL 15+)                                      ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- Add archived field to messages table
ALTER TABLE IF EXISTS portfolio.messages
ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;

-- Add labels field to messages table
ALTER TABLE IF EXISTS portfolio.messages
ADD COLUMN IF NOT EXISTS labels TEXT[] NOT NULL DEFAULT '{}';

-- Add audit columns for tracking updates
ALTER TABLE IF EXISTS portfolio.messages
ADD COLUMN IF NOT EXISTS updated_by UUID,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_messages_archived
  ON portfolio.messages(archived)
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_messages_replied_at
  ON portfolio.messages(replied_at)
  WHERE is_deleted = false;

-- ✓ Migration applied successfully
COMMIT;
