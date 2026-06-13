-- Rollback for Wave 1 index files (business)
-- IMPORTANT: run outside explicit transaction block.

SET search_path TO portfolio, public;

DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_admin_users_is_deleted_username;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_messages_read_starred;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_messages_is_deleted_received_at;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_blog_posts_published_is_deleted_published_at;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_testimonials_is_deleted_created_at;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_testimonials_status_v2_is_deleted_display_order;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_certifications_is_deleted_display_order_issue_year;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_stats_is_deleted;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_experience_is_deleted_display_order;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_personal_projects_is_deleted_featured_display_order;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_company_projects_company_is_deleted_display_order;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_companies_is_deleted_display_order;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_skills_is_deleted_display_order;
