# Wave 1 Execution Report - Step 2 (DEV)

- Start Time (UTC): 2026-06-13T22:13:39.840Z
- End Time (UTC): 2026-06-13T22:13:40.557Z
- Total Duration: 717 ms
- Migration File Executed: database/migrations/wave1_002_business_indexes.sql
- Verification File Executed: database/migrations/wave1_990_verify.sql

## Execution timing

- wave1_002_business_indexes.sql: 543 ms
- wave1_990_verify.sql: 117 ms

## Errors

- None

## Warnings

- None

## Wave 1 business indexes found in pg_indexes

| Index | Table |
|---|---|
| idx_admin_users_is_deleted_username | admin_users |
| idx_blog_posts_published_is_deleted_published_at | blog_posts |
| idx_certifications_is_deleted_display_order_issue_year | certifications |
| idx_companies_is_deleted_display_order | companies |
| idx_company_projects_company_is_deleted_display_order | company_projects |
| idx_experience_is_deleted_display_order | experience |
| idx_messages_is_deleted_received_at | messages |
| idx_messages_read_starred | messages |
| idx_personal_projects_is_deleted_featured_display_order | personal_projects |
| idx_skills_is_deleted_display_order | skills |
| idx_stats_is_deleted | stats |
| idx_testimonials_is_deleted_created_at | testimonials |
| idx_testimonials_status_v2_is_deleted_display_order | testimonials |

## Index validity (pg_index)

| Index | indisvalid | indisready | indislive |
|---|---|---|---|
| idx_admin_users_is_deleted_username | true | true | true |
| idx_blog_posts_published_is_deleted_published_at | true | true | true |
| idx_certifications_is_deleted_display_order_issue_year | true | true | true |
| idx_companies_is_deleted_display_order | true | true | true |
| idx_company_projects_company_is_deleted_display_order | true | true | true |
| idx_experience_is_deleted_display_order | true | true | true |
| idx_messages_is_deleted_received_at | true | true | true |
| idx_messages_read_starred | true | true | true |
| idx_personal_projects_is_deleted_featured_display_order | true | true | true |
| idx_skills_is_deleted_display_order | true | true | true |
| idx_stats_is_deleted | true | true | true |
| idx_testimonials_is_deleted_created_at | true | true | true |
| idx_testimonials_status_v2_is_deleted_display_order | true | true | true |

## Verification output summary (wave1_990_verify.sql)

- Enum verification rows: 4
- Column verification rows: 86
- Index verification rows: 13
- Row-count verification rows: 19

### Index rows returned by wave1_990_verify.sql

| Index | Table |
|---|---|
| idx_admin_users_is_deleted_username | admin_users |
| idx_blog_posts_published_is_deleted_published_at | blog_posts |
| idx_certifications_is_deleted_display_order_issue_year | certifications |
| idx_companies_is_deleted_display_order | companies |
| idx_company_projects_company_is_deleted_display_order | company_projects |
| idx_experience_is_deleted_display_order | experience |
| idx_messages_is_deleted_received_at | messages |
| idx_messages_read_starred | messages |
| idx_personal_projects_is_deleted_featured_display_order | personal_projects |
| idx_skills_is_deleted_display_order | skills |
| idx_stats_is_deleted | stats |
| idx_testimonials_is_deleted_created_at | testimonials |
| idx_testimonials_status_v2_is_deleted_display_order | testimonials |

## Pass/Fail decision

- Decision: **PASS**