# Wave 1 Final DEV Post-Migration Audit

- Start Time (UTC): 2026-06-13T22:17:00.469Z
- End Time (UTC): 2026-06-13T22:17:01.135Z
- Baseline Source: database/migrations/wave1/pre_migration_report.md
- Manifest Source: database/migrations/wave1/wave1_manifest.md

## Comparison against baseline and manifest

- Baseline row-count table entries parsed: 19
- Manifest contains required Wave 1 execution files: Yes

## Required verification checks

- 4 Wave 1 enums exist: PASS (4/4)
- 86 Wave 1 columns exist: PASS (86/86)
- 16 Wave 1 indexes exist: PASS (16/16)
- All Wave 1 indexes are valid/ready/live: PASS
- Row counts match pre-migration baseline: PASS
- No invalid indexes in portfolio schema: PASS
- No failed concurrent index builds detected: PASS

## Wave 1 enums found

- enum_company_project_status_v2
- enum_personal_project_status_v2
- enum_personal_project_type_v2
- enum_testimonial_status_v2

## Wave 1 indexes found (16 expected)

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

## Wave 1 index validity flags

| Index | indisvalid | indisready | indislive |
|---|---|---|---|
| idx_admin_users_is_deleted_username | true | true | true |
| idx_analytics_singleton_key | true | true | true |
| idx_blog_posts_published_is_deleted_published_at | true | true | true |
| idx_certifications_is_deleted_display_order_issue_year | true | true | true |
| idx_companies_is_deleted_display_order | true | true | true |
| idx_company_projects_company_is_deleted_display_order | true | true | true |
| idx_experience_is_deleted_display_order | true | true | true |
| idx_messages_is_deleted_received_at | true | true | true |
| idx_messages_read_starred | true | true | true |
| idx_personal_projects_is_deleted_featured_display_order | true | true | true |
| idx_project_clicks_clicks_desc | true | true | true |
| idx_resume_meta_singleton_key | true | true | true |
| idx_skills_is_deleted_display_order | true | true | true |
| idx_stats_is_deleted | true | true | true |
| idx_testimonials_is_deleted_created_at | true | true | true |
| idx_testimonials_status_v2_is_deleted_display_order | true | true | true |

## Row-count comparison (baseline vs current)

| Table | Baseline | Current | Match |
|---|---:|---:|---|
| admin_users | 1 | 1 | Yes |
| analytics | 1 | 1 | Yes |
| blog_posts | 2 | 2 | Yes |
| certifications | 5 | 5 | Yes |
| companies | 2 | 2 | Yes |
| company_projects | 6 | 6 | Yes |
| contact_information | 1 | 1 | Yes |
| experience | 3 | 3 | Yes |
| hero | 1 | 1 | Yes |
| messages | 18 | 18 | Yes |
| page_visit_log | 314 | 314 | Yes |
| personal_projects | 3 | 3 | Yes |
| project_clicks | 0 | 0 | Yes |
| resume_leads | 13 | 13 | Yes |
| resume_meta | 1 | 1 | Yes |
| site_config | 1 | 1 | Yes |
| skills | 6 | 6 | Yes |
| stats | 5 | 5 | Yes |
| testimonials | 5 | 5 | Yes |

## Errors

- None

## Warnings

- None

## Final recommendation for promotion beyond DEV

- Decision: **GO**
- Recommendation: Promote to next environment with the same ordered runbook and mixed transaction handling.