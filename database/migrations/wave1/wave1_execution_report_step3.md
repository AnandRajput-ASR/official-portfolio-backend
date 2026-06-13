# Wave 1 Execution Report - Step 3 (DEV)

- Start Time (UTC): 2026-06-13T22:15:09.760Z
- End Time (UTC): 2026-06-13T22:15:10.131Z
- Total Duration: 371 ms
- Migration File Executed: database/migrations/wave1_003_telemetry_indexes.sql
- Verification File Executed: database/migrations/wave1_990_verify.sql

## Execution timing

- wave1_003_telemetry_indexes.sql: 269 ms
- wave1_990_verify.sql: 53 ms

## Errors

- None

## Warnings

- None

## Required telemetry indexes existence (pg_indexes)

| Index | Table |
|---|---|
| idx_analytics_singleton_key | analytics |
| idx_project_clicks_clicks_desc | project_clicks |
| idx_resume_meta_singleton_key | resume_meta |

## Required telemetry indexes validity (pg_index)

| Index | indisvalid | indisready | indislive |
|---|---|---|---|
| idx_analytics_singleton_key | true | true | true |
| idx_project_clicks_clicks_desc | true | true | true |
| idx_resume_meta_singleton_key | true | true | true |

## Verification output summary (wave1_990_verify.sql)

- Enum verification rows: 4
- Column verification rows: 86
- Index verification rows: 16
- Row-count verification rows: 19

### Index rows returned by wave1_990_verify.sql

| Index | Table |
|---|---|
| idx_admin_users_is_deleted_username | admin_users |
| idx_analytics_singleton_key | analytics |
| idx_blog_posts_published_is_deleted_published_at | blog_posts |
| idx_certifications_is_deleted_display_order_issue_year | certifications |
| idx_companies_is_deleted_display_order | companies |
| idx_company_projects_company_is_deleted_display_order | company_projects |
| idx_experience_is_deleted_display_order | experience |
| idx_messages_is_deleted_received_at | messages |
| idx_messages_read_starred | messages |
| idx_personal_projects_is_deleted_featured_display_order | personal_projects |
| idx_project_clicks_clicks_desc | project_clicks |
| idx_resume_meta_singleton_key | resume_meta |
| idx_skills_is_deleted_display_order | skills |
| idx_stats_is_deleted | stats |
| idx_testimonials_is_deleted_created_at | testimonials |
| idx_testimonials_status_v2_is_deleted_display_order | testimonials |

## Pass/Fail decision

- Decision: **PASS**