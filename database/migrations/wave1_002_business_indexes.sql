-- Wave 1 / File 002
-- Scope: additive indexes only (business tables)
-- IMPORTANT: run outside an explicit transaction block.

SET search_path TO portfolio, public;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skills_is_deleted_display_order
  ON portfolio.skills (is_deleted, display_order);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_is_deleted_display_order
  ON portfolio.companies (is_deleted, display_order);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_projects_company_is_deleted_display_order
  ON portfolio.company_projects (company_id, is_deleted, display_order);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_personal_projects_is_deleted_featured_display_order
  ON portfolio.personal_projects (is_deleted, featured DESC, display_order);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_experience_is_deleted_display_order
  ON portfolio.experience (is_deleted, display_order);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stats_is_deleted
  ON portfolio.stats (is_deleted);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_certifications_is_deleted_display_order_issue_year
  ON portfolio.certifications (is_deleted, display_order, issue_year DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_testimonials_status_v2_is_deleted_display_order
  ON portfolio.testimonials (status_v2, is_deleted, display_order);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_testimonials_is_deleted_created_at
  ON portfolio.testimonials (is_deleted, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_published_is_deleted_published_at
  ON portfolio.blog_posts (published, is_deleted, published_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_is_deleted_received_at
  ON portfolio.messages (is_deleted, received_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_read_starred
  ON portfolio.messages (read, starred);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_users_is_deleted_username
  ON portfolio.admin_users (is_deleted, username);
