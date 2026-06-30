SET search_path TO portfolio, public;

-- A) Check enum types
SELECT n.nspname AS schema_name, t.typname AS enum_type
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'portfolio'
  AND t.typname IN (
    'enum_testimonial_status_v2',
    'enum_company_project_status_v2',
    'enum_personal_project_status_v2',
    'enum_personal_project_type_v2'
  )
ORDER BY t.typname;

-- B) Check newly added columns exist (sample)
SELECT table_name, column_name, data_type, udt_schema, udt_name
FROM information_schema.columns
WHERE table_schema = 'portfolio'
  AND (
    column_name IN (
      'version','created_by','updated_by','is_deleted','deleted_at',
      'singleton_key','config_version','start_date_d','end_date_d',
      'status_v2','type_v2','years_experience_min','years_experience_max',
      'approved_by','approved_at','rejected_by','rejected_at'
    )
  )
ORDER BY table_name, column_name;

-- C) Check indexes exist
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'portfolio'
  AND indexname IN (
    'idx_skills_is_deleted_display_order',
    'idx_companies_is_deleted_display_order',
    'idx_company_projects_company_is_deleted_display_order',
    'idx_personal_projects_is_deleted_featured_display_order',
    'idx_experience_is_deleted_display_order',
    'idx_stats_is_deleted',
    'idx_certifications_is_deleted_display_order_issue_year',
    'idx_testimonials_status_v2_is_deleted_display_order',
    'idx_testimonials_is_deleted_created_at',
    'idx_blog_posts_published_is_deleted_published_at',
    'idx_messages_is_deleted_received_at',
    'idx_messages_read_starred',
    'idx_admin_users_is_deleted_username',
    'idx_project_clicks_clicks_desc',
    'idx_analytics_singleton_key',
    'idx_resume_meta_singleton_key'
  )
ORDER BY indexname;

-- D) Safety checks: no row count drift (run pre/post and compare manually)
SELECT 'hero' AS table_name, COUNT(*) AS cnt FROM portfolio.hero
UNION ALL SELECT 'contact_information', COUNT(*) FROM portfolio.contact_information
UNION ALL SELECT 'site_config', COUNT(*) FROM portfolio.site_config
UNION ALL SELECT 'skills', COUNT(*) FROM portfolio.skills
UNION ALL SELECT 'companies', COUNT(*) FROM portfolio.companies
UNION ALL SELECT 'company_projects', COUNT(*) FROM portfolio.company_projects
UNION ALL SELECT 'personal_projects', COUNT(*) FROM portfolio.personal_projects
UNION ALL SELECT 'experience', COUNT(*) FROM portfolio.experience
UNION ALL SELECT 'stats', COUNT(*) FROM portfolio.stats
UNION ALL SELECT 'certifications', COUNT(*) FROM portfolio.certifications
UNION ALL SELECT 'testimonials', COUNT(*) FROM portfolio.testimonials
UNION ALL SELECT 'blog_posts', COUNT(*) FROM portfolio.blog_posts
UNION ALL SELECT 'messages', COUNT(*) FROM portfolio.messages
UNION ALL SELECT 'admin_users', COUNT(*) FROM portfolio.admin_users
UNION ALL SELECT 'resume_meta', COUNT(*) FROM portfolio.resume_meta
UNION ALL SELECT 'analytics', COUNT(*) FROM portfolio.analytics
UNION ALL SELECT 'project_clicks', COUNT(*) FROM portfolio.project_clicks
UNION ALL SELECT 'resume_leads', COUNT(*) FROM portfolio.resume_leads
UNION ALL SELECT 'page_visit_log', COUNT(*) FROM portfolio.page_visit_log;
