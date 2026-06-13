-- Rollback for Wave 1 additive columns + enum types.
-- Execute only if application has not started writing to new columns.

SET search_path TO portfolio, public;

-- ------------------------------------------------------------
-- 1) Drop added columns (reverse dependency order)
-- ------------------------------------------------------------
ALTER TABLE portfolio.admin_users
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS is_deleted,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.messages
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.blog_posts
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS is_deleted,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.testimonials
  DROP COLUMN IF EXISTS status_v2,
  DROP COLUMN IF EXISTS rejected_at,
  DROP COLUMN IF EXISTS rejected_by,
  DROP COLUMN IF EXISTS approved_at,
  DROP COLUMN IF EXISTS approved_by,
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS is_deleted,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.certifications
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS is_deleted,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.stats
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS is_deleted,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.experience
  DROP COLUMN IF EXISTS end_date_d,
  DROP COLUMN IF EXISTS start_date_d,
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS is_deleted,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.personal_projects
  DROP COLUMN IF EXISTS type_v2,
  DROP COLUMN IF EXISTS status_v2,
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS is_deleted,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.company_projects
  DROP COLUMN IF EXISTS status_v2,
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS is_deleted,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.companies
  DROP COLUMN IF EXISTS end_date_d,
  DROP COLUMN IF EXISTS start_date_d,
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS is_deleted,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.skills
  DROP COLUMN IF EXISTS years_experience_max,
  DROP COLUMN IF EXISTS years_experience_min,
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS is_deleted,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.analytics
  DROP COLUMN IF EXISTS singleton_key,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.resume_meta
  DROP COLUMN IF EXISTS singleton_key,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.site_config
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS config_version,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.contact_information
  DROP COLUMN IF EXISTS singleton_key,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS version;

ALTER TABLE portfolio.hero
  DROP COLUMN IF EXISTS singleton_key,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS version;

-- ------------------------------------------------------------
-- 2) Drop enum types (only after dependent columns removed)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'enum_personal_project_type_v2' AND n.nspname = 'portfolio'
  ) THEN
    DROP TYPE portfolio.enum_personal_project_type_v2;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'enum_personal_project_status_v2' AND n.nspname = 'portfolio'
  ) THEN
    DROP TYPE portfolio.enum_personal_project_status_v2;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'enum_company_project_status_v2' AND n.nspname = 'portfolio'
  ) THEN
    DROP TYPE portfolio.enum_company_project_status_v2;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'enum_testimonial_status_v2' AND n.nspname = 'portfolio'
  ) THEN
    DROP TYPE portfolio.enum_testimonial_status_v2;
  END IF;
END $$;
