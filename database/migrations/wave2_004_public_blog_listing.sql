-- Wave 2 / File 004
-- Scope: public blog listing compatibility + performance
-- Adds unpublished_at for live-window filtering and index support for public listing queries.

SET search_path TO portfolio, public;

ALTER TABLE portfolio.blog_posts
  ADD COLUMN IF NOT EXISTS unpublished_at TIMESTAMPTZ;

-- Existing slug index is retained for slug lookups.
-- This partial index optimizes the public listing + detail live filters.
CREATE INDEX IF NOT EXISTS idx_blog_posts_live_public_window
  ON portfolio.blog_posts (published_at DESC, display_order ASC, unpublished_at)
  WHERE published = true
    AND COALESCE(is_deleted, false) = false;
