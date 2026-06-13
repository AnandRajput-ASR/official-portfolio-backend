-- Rollback for Wave 1 telemetry indexes
-- IMPORTANT: run outside explicit transaction block.

SET search_path TO portfolio, public;

DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_resume_meta_singleton_key;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_analytics_singleton_key;
DROP INDEX CONCURRENTLY IF EXISTS portfolio.idx_project_clicks_clicks_desc;
