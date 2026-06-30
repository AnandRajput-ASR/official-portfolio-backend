-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║  WAVE 2 MIGRATION 003: Blog Comment Moderation Lifecycle                  ║
-- ║  Add hide/delete/restore soft moderation + audit trail                    ║
-- ║  Platform: Supabase (PostgreSQL 15+)                                      ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

ALTER TABLE IF EXISTS portfolio.blog_post_comments
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'visible',
  ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
  ADD COLUMN IF NOT EXISTS moderated_by TEXT,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'blog_post_comments_moderation_status_check'
      AND conrelid = 'portfolio.blog_post_comments'::regclass
  ) THEN
    ALTER TABLE portfolio.blog_post_comments
      ADD CONSTRAINT blog_post_comments_moderation_status_check
      CHECK (moderation_status IN ('visible', 'hidden', 'deleted'));
  END IF;
END
$$;

UPDATE portfolio.blog_post_comments
SET moderation_status = 'visible'
WHERE moderation_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_blog_post_comments_slug_status_created_at
  ON portfolio.blog_post_comments (post_slug, moderation_status, created_at DESC);

CREATE TABLE IF NOT EXISTS portfolio.blog_post_comment_moderation_audit (
  id               UUID        NOT NULL DEFAULT gen_random_uuid(),
  comment_id       UUID,
  post_slug        TEXT        NOT NULL,
  action           TEXT        NOT NULL,
  from_status      TEXT        NOT NULL,
  to_status        TEXT        NOT NULL,
  reason           TEXT,
  moderated_by     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT blog_post_comment_moderation_audit_pkey PRIMARY KEY (id),
  CONSTRAINT blog_post_comment_moderation_audit_comment_fkey
    FOREIGN KEY (comment_id) REFERENCES portfolio.blog_post_comments(id) ON DELETE SET NULL,
  CONSTRAINT blog_post_comment_moderation_audit_action_check
    CHECK (action IN ('hide', 'unhide', 'delete', 'restore', 'permanent_delete')),
  CONSTRAINT blog_post_comment_moderation_audit_from_status_check
    CHECK (from_status IN ('visible', 'hidden', 'deleted')),
  CONSTRAINT blog_post_comment_moderation_audit_to_status_check
    CHECK (to_status IN ('visible', 'hidden', 'deleted'))
);

CREATE INDEX IF NOT EXISTS idx_blog_comment_audit_slug_created_at
  ON portfolio.blog_post_comment_moderation_audit (post_slug, created_at DESC);

ALTER TABLE portfolio.blog_post_comment_moderation_audit ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'portfolio' AND tablename = 'blog_post_comment_moderation_audit' AND policyname = 'admin_read_blog_comment_moderation_audit'
  ) THEN
    CREATE POLICY admin_read_blog_comment_moderation_audit
      ON portfolio.blog_post_comment_moderation_audit FOR SELECT TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'portfolio' AND tablename = 'blog_post_comment_moderation_audit' AND policyname = 'admin_insert_blog_comment_moderation_audit'
  ) THEN
    CREATE POLICY admin_insert_blog_comment_moderation_audit
      ON portfolio.blog_post_comment_moderation_audit FOR INSERT TO public
      WITH CHECK (true);
  END IF;
END
$$;

COMMIT;
