-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║  WAVE 2 MIGRATION 002: Blog Social Interactions                           ║
-- ║  Add per-post social stats, comments, and visitor reactions               ║
-- ║  Platform: Supabase (PostgreSQL 15+)                                      ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- Per-post counters (likes + shares)
CREATE TABLE IF NOT EXISTS portfolio.blog_post_social_stats (
  post_slug    TEXT        NOT NULL,
  likes_count  INTEGER     NOT NULL DEFAULT 0,
  shares_count INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT blog_post_social_stats_pkey PRIMARY KEY (post_slug),
  CONSTRAINT blog_post_social_stats_slug_fkey
    FOREIGN KEY (post_slug) REFERENCES portfolio.blog_posts(slug) ON DELETE CASCADE,
  CONSTRAINT blog_post_social_stats_likes_check CHECK (likes_count >= 0),
  CONSTRAINT blog_post_social_stats_shares_check CHECK (shares_count >= 0)
);

-- Per-post comment feed
CREATE TABLE IF NOT EXISTS portfolio.blog_post_comments (
  id         UUID        NOT NULL,
  post_slug  TEXT        NOT NULL,
  name       VARCHAR(48) NOT NULL,
  message    VARCHAR(600) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT blog_post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT blog_post_comments_slug_fkey
    FOREIGN KEY (post_slug) REFERENCES portfolio.blog_posts(slug) ON DELETE CASCADE
);

-- Per-post visitor reaction state (dedupe by slug + visitor)
CREATE TABLE IF NOT EXISTS portfolio.blog_post_reactions (
  post_slug   TEXT        NOT NULL,
  visitor_id  TEXT        NOT NULL,
  liked       BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT blog_post_reactions_pkey PRIMARY KEY (post_slug, visitor_id),
  CONSTRAINT blog_post_reactions_slug_fkey
    FOREIGN KEY (post_slug) REFERENCES portfolio.blog_posts(slug) ON DELETE CASCADE
);

-- Query/index support
CREATE INDEX IF NOT EXISTS idx_blog_post_comments_slug_created_at
  ON portfolio.blog_post_comments (post_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_post_reactions_slug_liked
  ON portfolio.blog_post_reactions (post_slug, liked);

-- Auto-updated timestamps
CREATE OR REPLACE TRIGGER blog_post_social_stats_updated_at
  BEFORE UPDATE ON portfolio.blog_post_social_stats
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER blog_post_reactions_updated_at
  BEFORE UPDATE ON portfolio.blog_post_reactions
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

-- RLS + public access (read state + insert interactions)
ALTER TABLE portfolio.blog_post_social_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_post_reactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'portfolio' AND tablename = 'blog_post_social_stats' AND policyname = 'public_read_blog_post_social_stats'
  ) THEN
    CREATE POLICY public_read_blog_post_social_stats
      ON portfolio.blog_post_social_stats FOR SELECT TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'portfolio' AND tablename = 'blog_post_social_stats' AND policyname = 'public_insert_blog_post_social_stats'
  ) THEN
    CREATE POLICY public_insert_blog_post_social_stats
      ON portfolio.blog_post_social_stats FOR INSERT TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'portfolio' AND tablename = 'blog_post_social_stats' AND policyname = 'public_update_blog_post_social_stats'
  ) THEN
    CREATE POLICY public_update_blog_post_social_stats
      ON portfolio.blog_post_social_stats FOR UPDATE TO public
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'portfolio' AND tablename = 'blog_post_comments' AND policyname = 'public_read_blog_post_comments'
  ) THEN
    CREATE POLICY public_read_blog_post_comments
      ON portfolio.blog_post_comments FOR SELECT TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'portfolio' AND tablename = 'blog_post_comments' AND policyname = 'public_insert_blog_post_comments'
  ) THEN
    CREATE POLICY public_insert_blog_post_comments
      ON portfolio.blog_post_comments FOR INSERT TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'portfolio' AND tablename = 'blog_post_reactions' AND policyname = 'public_read_blog_post_reactions'
  ) THEN
    CREATE POLICY public_read_blog_post_reactions
      ON portfolio.blog_post_reactions FOR SELECT TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'portfolio' AND tablename = 'blog_post_reactions' AND policyname = 'public_upsert_blog_post_reactions'
  ) THEN
    CREATE POLICY public_upsert_blog_post_reactions
      ON portfolio.blog_post_reactions FOR INSERT TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'portfolio' AND tablename = 'blog_post_reactions' AND policyname = 'public_update_blog_post_reactions'
  ) THEN
    CREATE POLICY public_update_blog_post_reactions
      ON portfolio.blog_post_reactions FOR UPDATE TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

COMMIT;
