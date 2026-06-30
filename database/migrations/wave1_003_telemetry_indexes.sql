-- Wave 1 / File 003
-- Scope: telemetry-specific index additions only.
-- IMPORTANT: run outside an explicit transaction block.

SET search_path TO portfolio, public;

-- Derived telemetry ranking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_clicks_clicks_desc
  ON portfolio.project_clicks (clicks DESC);

-- Optional operational support index for analytics singleton key
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_singleton_key
  ON portfolio.analytics (singleton_key);

-- Optional operational support index for resume_meta singleton key
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resume_meta_singleton_key
  ON portfolio.resume_meta (singleton_key);
