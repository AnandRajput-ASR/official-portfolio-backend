-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║  OFFICIAL PORTFOLIO — COMPLETE DATABASE SCHEMA                            ║
-- ║  Platform: Supabase (PostgreSQL 15+)                                      ║
-- ║  Schema:   portfolio                                                      ║
-- ║  Generated: March 2026                                                    ║
-- ║                                                                           ║
-- ║  🚨 EMERGENCY RECOVERY: Run this file against a fresh Supabase project    ║
-- ║     to recreate the entire database from scratch.                         ║
-- ║                                                                           ║
-- ║  Usage:                                                                   ║
-- ║    npm run db:setup          (via Node.js script)                         ║
-- ║    — OR —                                                                 ║
-- ║    Paste into Supabase SQL Editor and run                                 ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────────────────────────────
-- 0. SCHEMA
-- ────────────────────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS portfolio;
SET search_path TO portfolio, public;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. TRIGGER FUNCTION (shared by all tables with updated_at)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION portfolio.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- 2. TABLES
-- ════════════════════════════════════════════════════════════════════════════

-- ─── hero (single-row) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.hero (
  id              UUID        NOT NULL DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  title           TEXT        NOT NULL,
  subtitle        TEXT,
  bio             TEXT,
  single_row_lock BOOLEAN     DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT hero_pkey PRIMARY KEY (id),
  CONSTRAINT hero_single_row_lock_key UNIQUE (single_row_lock)
);

-- ─── contact_information (single-row) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.contact_information (
  id              UUID        NOT NULL DEFAULT gen_random_uuid(),
  email           TEXT        NOT NULL,
  linkedin_url    TEXT,
  github_url      TEXT,
  location        TEXT,
  single_row_lock BOOLEAN     DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT contact_information_pkey PRIMARY KEY (id),
  CONSTRAINT contact_information_single_row_lock_key UNIQUE (single_row_lock)
);

-- ─── skills ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.skills (
  id               UUID        NOT NULL DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  icon             TEXT,
  accent_color     VARCHAR(20),
  description      TEXT,
  proficiency      SMALLINT,
  years_experience VARCHAR(10),
  tags             TEXT[]      NOT NULL DEFAULT '{}',
  display_order    INTEGER     NOT NULL DEFAULT 0,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT skills_pkey PRIMARY KEY (id),
  CONSTRAINT skills_proficiency_check CHECK (proficiency >= 1 AND proficiency <= 100)
);

-- ─── companies ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.companies (
  id                UUID        NOT NULL DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  role              TEXT        NOT NULL,
  period            VARCHAR(40),
  location          TEXT,
  logo              TEXT,
  brand_color       VARCHAR(20),
  currently_working BOOLEAN     NOT NULL DEFAULT false,
  description       TEXT,
  display_order     INTEGER     NOT NULL DEFAULT 0,
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  website           TEXT,
  team_size         VARCHAR(50),
  start_date        VARCHAR(7),             -- YYYY-MM
  end_date          VARCHAR(7),             -- YYYY-MM
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT companies_pkey PRIMARY KEY (id)
);

-- ─── company_projects ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.company_projects (
  id            UUID        NOT NULL DEFAULT gen_random_uuid(),
  company_id    UUID        NOT NULL,
  number        VARCHAR(10),
  title         TEXT        NOT NULL,
  description   TEXT,
  technologies  TEXT[]      NOT NULL DEFAULT '{}',
  link          TEXT        DEFAULT '#',
  display_order INTEGER     NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  status        VARCHAR(20) DEFAULT NULL,   -- completed | in-progress | planned | archived
  impact        TEXT        DEFAULT NULL,   -- e.g. "Reduced load time by 40%"
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT company_projects_pkey PRIMARY KEY (id),
  CONSTRAINT company_projects_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES portfolio.companies(id) ON DELETE CASCADE
);

-- ─── personal_projects ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.personal_projects (
  id            UUID        NOT NULL DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  description   TEXT,
  technologies  TEXT[]      NOT NULL DEFAULT '{}',
  github_link   TEXT        DEFAULT '#',
  live_link     TEXT        DEFAULT '#',
  status        VARCHAR(20) DEFAULT 'Completed',
  type          VARCHAR(30) DEFAULT 'Personal',
  featured      BOOLEAN     NOT NULL DEFAULT false,
  year          INTEGER,
  display_order INTEGER     NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT personal_projects_pkey PRIMARY KEY (id)
);

-- ─── experience ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.experience (
  id            UUID        NOT NULL DEFAULT gen_random_uuid(),
  period        VARCHAR(40),
  location      TEXT,
  role          TEXT        NOT NULL,
  organisation  TEXT        NOT NULL,
  description   TEXT,
  display_order INTEGER     NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT experience_pkey PRIMARY KEY (id)
);

-- ─── stats ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.stats (
  id         UUID        NOT NULL DEFAULT gen_random_uuid(),
  value      INTEGER     NOT NULL,
  suffix     TEXT,
  label      TEXT        NOT NULL,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT stats_pkey PRIMARY KEY (id)
);

-- ─── certifications ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.certifications (
  id              UUID        NOT NULL DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  code            TEXT,
  issuer          TEXT        NOT NULL,
  level           VARCHAR(20),
  issue_year      INTEGER,
  expiration_year INTEGER,
  credly_link     TEXT,
  accent_color    VARCHAR(20),
  badge_link      TEXT,
  badge_type      VARCHAR(20) DEFAULT 'auto',
  display_order   INTEGER     NOT NULL DEFAULT 0,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT certifications_pkey PRIMARY KEY (id),
  CONSTRAINT chk_expiration_year CHECK (expiration_year IS NULL OR expiration_year >= issue_year)
);

-- ─── testimonials ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.testimonials (
  id               UUID        NOT NULL DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  role             TEXT        NOT NULL,
  company          TEXT        NOT NULL,
  avatar           TEXT,
  quote            TEXT        NOT NULL,
  rating           SMALLINT    DEFAULT 5,
  status           VARCHAR(20) NOT NULL DEFAULT 'Pending',
  display_order    INTEGER     NOT NULL DEFAULT 0,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  visible          BOOLEAN     NOT NULL DEFAULT false,
  submitter_email  TEXT        NOT NULL,

  CONSTRAINT testimonials_pkey PRIMARY KEY (id),
  CONSTRAINT chk_testimonial_status CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  CONSTRAINT testimonials_rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- ─── blog_posts ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.blog_posts (
  id            UUID        NOT NULL DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  slug          TEXT        NOT NULL,
  excerpt       TEXT,
  content       TEXT        NOT NULL DEFAULT '',
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  cover_image   TEXT,
  published     BOOLEAN     NOT NULL DEFAULT false,
  published_at  TIMESTAMPTZ,
  unpublished_at TIMESTAMPTZ,
  reading_time  INTEGER,
  author        TEXT        NOT NULL DEFAULT 'Anand Rajput',
  display_order INTEGER     NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT blog_posts_pkey PRIMARY KEY (id),
  CONSTRAINT blog_posts_slug_key UNIQUE (slug)
);

-- ─── blog_post_social_stats ───────────────────────────────────────────────
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

-- ─── blog_post_comments ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.blog_post_comments (
  id                UUID         NOT NULL,
  post_slug         TEXT         NOT NULL,
  name              VARCHAR(48)  NOT NULL,
  message           VARCHAR(600) NOT NULL,
  moderation_status TEXT         NOT NULL DEFAULT 'visible',
  moderation_reason TEXT,
  moderated_by      TEXT,
  moderated_at      TIMESTAMPTZ,
  hidden_at         TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT blog_post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT blog_post_comments_slug_fkey
    FOREIGN KEY (post_slug) REFERENCES portfolio.blog_posts(slug) ON DELETE CASCADE,
  CONSTRAINT blog_post_comments_moderation_status_check
    CHECK (moderation_status IN ('visible', 'hidden', 'deleted'))
);

-- ─── blog_post_comment_moderation_audit ───────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.blog_post_comment_moderation_audit (
  id           UUID        NOT NULL DEFAULT gen_random_uuid(),
  comment_id   UUID,
  post_slug    TEXT        NOT NULL,
  action       TEXT        NOT NULL,
  from_status  TEXT        NOT NULL,
  to_status    TEXT        NOT NULL,
  reason       TEXT,
  moderated_by TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

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

-- ─── blog_post_reactions ──────────────────────────────────────────────────
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

-- ─── analytics (single-row) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.analytics (
  id                        UUID        NOT NULL DEFAULT gen_random_uuid(),
  page_views                INTEGER     NOT NULL DEFAULT 0,
  resume_downloads          INTEGER     NOT NULL DEFAULT 0,
  contact_form_submissions  INTEGER     NOT NULL DEFAULT 0,
  contact_form_views        INTEGER     NOT NULL DEFAULT 0,
  blog_post_views           INTEGER     NOT NULL DEFAULT 0,
  project_link_clicks       INTEGER     NOT NULL DEFAULT 0,
  social_link_clicks        INTEGER     NOT NULL DEFAULT 0,
  last_reset                TIMESTAMPTZ,
  single_row_lock           BOOLEAN     DEFAULT true,

  CONSTRAINT analytics_pkey PRIMARY KEY (id),
  CONSTRAINT analytics_single_row_lock_key UNIQUE (single_row_lock)
);

-- ─── project_clicks ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.project_clicks (
  id              UUID        NOT NULL DEFAULT gen_random_uuid(),
  project_name    TEXT        NOT NULL,
  clicks          INTEGER     NOT NULL DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,

  CONSTRAINT project_clicks_pkey PRIMARY KEY (id),
  CONSTRAINT project_clicks_project_name_key UNIQUE (project_name)
);

-- ─── site_config ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.site_config (
  id         UUID        NOT NULL DEFAULT gen_random_uuid(),
  key        TEXT        NOT NULL,
  config     JSONB       NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT site_config_pkey PRIMARY KEY (id),
  CONSTRAINT site_config_key_key UNIQUE (key)
);

-- ─── messages ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.messages (
  id          UUID        NOT NULL DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  read        BOOLEAN     NOT NULL DEFAULT false,
  starred     BOOLEAN     NOT NULL DEFAULT false,
  archived    BOOLEAN     NOT NULL DEFAULT false,
  labels      TEXT[]      NOT NULL DEFAULT '{}',
  replied_at  TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted  BOOLEAN     NOT NULL DEFAULT false,
  deleted_at  TIMESTAMPTZ,
  updated_by  UUID,
  version     INTEGER     DEFAULT 1,
  updated_at  TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

-- ─── admin_users ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.admin_users (
  id                 UUID        NOT NULL DEFAULT gen_random_uuid(),
  username           TEXT        NOT NULL,
  password_hash      TEXT        NOT NULL,
  email              TEXT,
  reset_token        TEXT,
  reset_token_expiry TIMESTAMPTZ,
  last_login_at      TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT admin_users_pkey PRIMARY KEY (id),
  CONSTRAINT admin_users_username_key UNIQUE (username)
);

-- ─── resume_meta (single-row) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.resume_meta (
  id              UUID        NOT NULL DEFAULT gen_random_uuid(),
  original_name   TEXT        NOT NULL,
  stored_name     TEXT        NOT NULL,
  download_name   TEXT,
  size            INTEGER     NOT NULL DEFAULT 0,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  single_row_lock BOOLEAN     DEFAULT true,

  CONSTRAINT resume_meta_pkey PRIMARY KEY (id),
  CONSTRAINT resume_meta_single_row_lock_key UNIQUE (single_row_lock)
);

-- ─── resume_leads (one row per resume download) ──────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio.resume_leads (
  id           UUID        NOT NULL DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL,
  ip_address   TEXT,
  user_agent   TEXT,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT resume_leads_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_resume_leads_email
  ON portfolio.resume_leads (email);

CREATE INDEX IF NOT EXISTS idx_resume_leads_downloaded_at
  ON portfolio.resume_leads (downloaded_at DESC);

-- ─── page_visit_log (time-series log for charts & public visitor counter) ────
CREATE TABLE IF NOT EXISTS portfolio.page_visit_log (
  id            UUID        DEFAULT gen_random_uuid() NOT NULL,
  visited_at    TIMESTAMPTZ DEFAULT now()             NOT NULL,
  ip_hash       TEXT,
  CONSTRAINT page_visit_log_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_page_visit_log_visited_at
  ON portfolio.page_visit_log (visited_at DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- 3. INDEXES (beyond PKs and unique constraints)
-- ════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_blog_posts_published
  ON portfolio.blog_posts (published, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_live_public_window
  ON portfolio.blog_posts (published_at DESC, display_order ASC, unpublished_at)
  WHERE published = true
    AND COALESCE(is_deleted, false) = false;

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
  ON portfolio.blog_posts (slug);

CREATE INDEX IF NOT EXISTS idx_blog_post_comments_slug_created_at
  ON portfolio.blog_post_comments (post_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_post_comments_slug_status_created_at
  ON portfolio.blog_post_comments (post_slug, moderation_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_comment_audit_slug_created_at
  ON portfolio.blog_post_comment_moderation_audit (post_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_post_reactions_slug_liked
  ON portfolio.blog_post_reactions (post_slug, liked);

CREATE INDEX IF NOT EXISTS idx_company_projects_company_id
  ON portfolio.company_projects (company_id);

CREATE INDEX IF NOT EXISTS idx_messages_is_deleted
  ON portfolio.messages (is_deleted);

CREATE INDEX IF NOT EXISTS idx_messages_received_at
  ON portfolio.messages (received_at DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- 4. TRIGGERS (auto-update updated_at on every UPDATE)
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE TRIGGER hero_updated_at
  BEFORE UPDATE ON portfolio.hero
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER contact_information_updated_at
  BEFORE UPDATE ON portfolio.contact_information
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER skills_updated_at
  BEFORE UPDATE ON portfolio.skills
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER companies_updated_at
  BEFORE UPDATE ON portfolio.companies
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER company_projects_updated_at
  BEFORE UPDATE ON portfolio.company_projects
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER personal_projects_updated_at
  BEFORE UPDATE ON portfolio.personal_projects
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER experience_updated_at
  BEFORE UPDATE ON portfolio.experience
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER stats_updated_at
  BEFORE UPDATE ON portfolio.stats
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER certifications_updated_at
  BEFORE UPDATE ON portfolio.certifications
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON portfolio.testimonials
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON portfolio.blog_posts
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER blog_post_social_stats_updated_at
  BEFORE UPDATE ON portfolio.blog_post_social_stats
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

CREATE OR REPLACE TRIGGER blog_post_reactions_updated_at
  BEFORE UPDATE ON portfolio.blog_post_reactions
  FOR EACH ROW EXECUTE FUNCTION portfolio.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE portfolio.hero                ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.contact_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.skills              ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.companies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.company_projects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.personal_projects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.experience          ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.stats               ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.certifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.testimonials        ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_post_social_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_post_comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_post_comment_moderation_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.analytics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.project_clicks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.page_visit_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.site_config         ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.admin_users         ENABLE ROW LEVEL SECURITY;

-- RLS Policies — public SELECT access with appropriate filters
CREATE POLICY public_read_hero
  ON portfolio.hero FOR SELECT TO public USING (true);

CREATE POLICY public_read_contact
  ON portfolio.contact_information FOR SELECT TO public USING (true);

CREATE POLICY public_read_skills
  ON portfolio.skills FOR SELECT TO public USING (is_active = true);

CREATE POLICY public_read_companies
  ON portfolio.companies FOR SELECT TO public USING (is_active = true);

CREATE POLICY public_read_company_projects
  ON portfolio.company_projects FOR SELECT TO public USING (is_active = true);

CREATE POLICY public_read_personal_projects
  ON portfolio.personal_projects FOR SELECT TO public USING (is_active = true);

CREATE POLICY public_read_experience
  ON portfolio.experience FOR SELECT TO public USING (is_active = true);

CREATE POLICY public_read_stats
  ON portfolio.stats FOR SELECT TO public USING (is_active = true);

CREATE POLICY public_read_certifications
  ON portfolio.certifications FOR SELECT TO public USING (is_active = true);

CREATE POLICY public_read_testimonials
  ON portfolio.testimonials FOR SELECT TO public
  USING (status::text = 'Approved' AND is_active = true);

CREATE POLICY public_read_blog_posts
  ON portfolio.blog_posts FOR SELECT TO public
  USING (published = true AND is_active = true);

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

CREATE POLICY public_read_analytics
  ON portfolio.analytics FOR SELECT TO public USING (true);

-- page_visit_log: backend inserts (service_role), no public read
CREATE POLICY "service_role_insert_page_visit_log"
  ON portfolio.page_visit_log FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow backend to read admins"
  ON portfolio.admin_users FOR SELECT TO public USING (true);

-- ════════════════════════════════════════════════════════════════════════════
-- 6. SEED DATA — Required singleton rows
--    These tables use single_row_lock to ensure only one row exists.
--    Without these rows the app will fail on first load.
-- ════════════════════════════════════════════════════════════════════════════

-- Hero (required — public site reads this)
INSERT INTO portfolio.hero (name, title, subtitle, bio) VALUES
  ('Your Name', 'Your Title', 'Your Subtitle', 'Your bio goes here.')
ON CONFLICT DO NOTHING;

-- Contact Information (required)
INSERT INTO portfolio.contact_information (email, linkedin_url, github_url, location) VALUES
  ('you@example.com', 'https://linkedin.com/in/yourprofile', 'https://github.com/yourprofile', 'Your City, Country')
ON CONFLICT DO NOTHING;

-- Analytics (required — single-row counter)
INSERT INTO portfolio.analytics (page_views, resume_downloads, contact_form_submissions, contact_form_views, blog_post_views, project_link_clicks, social_link_clicks) VALUES
  (0, 0, 0, 0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- Site Config (required — JSONB settings blob)
INSERT INTO portfolio.site_config (key, config) VALUES
  ('site_settings', '{
    "openToWork": true,
    "openToWorkText": "Open to opportunities",
    "sections": {
      "hero": true, "about": true, "ticker": true, "skills": true,
      "companies": true, "personalProjects": true, "experience": true,
      "certifications": true, "testimonials": true, "blog": true,
      "stats": true, "contact": true, "analytics": true,
      "resumeBanner": true, "footer": true
    },
    "freelance": {
      "enabled": false, "ctaTitle": "", "ctaSubtitle": "",
      "services": [], "showInHero": false, "showInAbout": false,
      "showCtaSection": false, "showInContact": false
    },
    "hero": {
      "badgeText": "Available for Work",
      "ctaPrimary": "View My Work",
      "ctaSecondary": "Contact Me",
      "pills": [],
      "cardTitle": "",
      "cardStatusText": "",
      "cardStats": [],
      "cardSkills": []
    },
    "about": {
      "heading": "About Me",
      "paragraphs": ["Tell your story here."],
      "companyBadge": { "company": "", "role": "", "period": "", "award": "" }
    },
    "ticker": { "items": [] },
    "contact": { "heading": "Get In Touch", "successMessage": "Message sent!" },
    "footer": { "text": "", "copy": "" },
    "nav": { "logoText": "AR.", "showResume": true }
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- ✅ DONE — Schema fully recreated.
--
-- Next steps after running this:
--   1. Insert your admin user via:
--      INSERT INTO portfolio.admin_users (username, password_hash, email)
--      VALUES ('admin', '<bcrypt_hash>', 'you@email.com');
--
--   2. Configure your .env file with DATABASE_URL pointing to this DB.
--
--   3. Start the backend: npm run dev
-- ════════════════════════════════════════════════════════════════════════════
