# Wave 1 Pre-Migration Baseline Report

- Generated At (UTC): 2026-06-13T22:00:10.323Z
- Schema: portfolio
- Source: Development database (DATABASE_URL)

## 1) Row counts for all portfolio tables

| Table | Row Count |
|---|---:|
| admin_users | 1 |
| analytics | 1 |
| blog_posts | 2 |
| certifications | 5 |
| companies | 2 |
| company_projects | 6 |
| contact_information | 1 |
| experience | 3 |
| hero | 1 |
| messages | 18 |
| page_visit_log | 314 |
| personal_projects | 3 |
| project_clicks | 0 |
| resume_leads | 13 |
| resume_meta | 1 |
| site_config | 1 |
| skills | 6 |
| stats | 5 |
| testimonials | 5 |

## 2) Existing indexes

| Table | Index | Definition |
|---|---|---|
| admin_users | admin_users_pkey | CREATE UNIQUE INDEX admin_users_pkey ON portfolio.admin_users USING btree (id) |
| admin_users | admin_users_username_key | CREATE UNIQUE INDEX admin_users_username_key ON portfolio.admin_users USING btree (username) |
| analytics | analytics_pkey | CREATE UNIQUE INDEX analytics_pkey ON portfolio.analytics USING btree (id) |
| analytics | analytics_single_row_lock_key | CREATE UNIQUE INDEX analytics_single_row_lock_key ON portfolio.analytics USING btree (single_row_lock) |
| blog_posts | blog_posts_pkey | CREATE UNIQUE INDEX blog_posts_pkey ON portfolio.blog_posts USING btree (id) |
| blog_posts | blog_posts_slug_key | CREATE UNIQUE INDEX blog_posts_slug_key ON portfolio.blog_posts USING btree (slug) |
| blog_posts | idx_blog_posts_published | CREATE INDEX idx_blog_posts_published ON portfolio.blog_posts USING btree (published, published_at DESC) |
| blog_posts | idx_blog_posts_slug | CREATE INDEX idx_blog_posts_slug ON portfolio.blog_posts USING btree (slug) |
| certifications | certifications_pkey | CREATE UNIQUE INDEX certifications_pkey ON portfolio.certifications USING btree (id) |
| companies | companies_pkey | CREATE UNIQUE INDEX companies_pkey ON portfolio.companies USING btree (id) |
| company_projects | company_projects_pkey | CREATE UNIQUE INDEX company_projects_pkey ON portfolio.company_projects USING btree (id) |
| company_projects | idx_company_projects_company_id | CREATE INDEX idx_company_projects_company_id ON portfolio.company_projects USING btree (company_id) |
| contact_information | contact_information_pkey | CREATE UNIQUE INDEX contact_information_pkey ON portfolio.contact_information USING btree (id) |
| contact_information | contact_information_single_row_lock_key | CREATE UNIQUE INDEX contact_information_single_row_lock_key ON portfolio.contact_information USING btree (single_row_lock) |
| experience | experience_pkey | CREATE UNIQUE INDEX experience_pkey ON portfolio.experience USING btree (id) |
| hero | hero_pkey | CREATE UNIQUE INDEX hero_pkey ON portfolio.hero USING btree (id) |
| hero | hero_single_row_lock_key | CREATE UNIQUE INDEX hero_single_row_lock_key ON portfolio.hero USING btree (single_row_lock) |
| messages | idx_messages_is_deleted | CREATE INDEX idx_messages_is_deleted ON portfolio.messages USING btree (is_deleted) |
| messages | idx_messages_received_at | CREATE INDEX idx_messages_received_at ON portfolio.messages USING btree (received_at DESC) |
| messages | messages_pkey | CREATE UNIQUE INDEX messages_pkey ON portfolio.messages USING btree (id) |
| page_visit_log | idx_page_visit_log_visited_at | CREATE INDEX idx_page_visit_log_visited_at ON portfolio.page_visit_log USING btree (visited_at DESC) |
| page_visit_log | page_visit_log_pkey | CREATE UNIQUE INDEX page_visit_log_pkey ON portfolio.page_visit_log USING btree (id) |
| personal_projects | personal_projects_pkey | CREATE UNIQUE INDEX personal_projects_pkey ON portfolio.personal_projects USING btree (id) |
| project_clicks | project_clicks_pkey | CREATE UNIQUE INDEX project_clicks_pkey ON portfolio.project_clicks USING btree (id) |
| project_clicks | project_clicks_project_name_key | CREATE UNIQUE INDEX project_clicks_project_name_key ON portfolio.project_clicks USING btree (project_name) |
| resume_leads | idx_resume_leads_downloaded_at | CREATE INDEX idx_resume_leads_downloaded_at ON portfolio.resume_leads USING btree (downloaded_at DESC) |
| resume_leads | idx_resume_leads_email | CREATE INDEX idx_resume_leads_email ON portfolio.resume_leads USING btree (email) |
| resume_leads | resume_leads_pkey | CREATE UNIQUE INDEX resume_leads_pkey ON portfolio.resume_leads USING btree (id) |
| resume_meta | resume_meta_pkey | CREATE UNIQUE INDEX resume_meta_pkey ON portfolio.resume_meta USING btree (id) |
| resume_meta | resume_meta_single_row_lock_key | CREATE UNIQUE INDEX resume_meta_single_row_lock_key ON portfolio.resume_meta USING btree (single_row_lock) |
| site_config | site_config_key_key | CREATE UNIQUE INDEX site_config_key_key ON portfolio.site_config USING btree (key) |
| site_config | site_config_pkey | CREATE UNIQUE INDEX site_config_pkey ON portfolio.site_config USING btree (id) |
| skills | skills_pkey | CREATE UNIQUE INDEX skills_pkey ON portfolio.skills USING btree (id) |
| stats | stats_pkey | CREATE UNIQUE INDEX stats_pkey ON portfolio.stats USING btree (id) |
| testimonials | testimonials_pkey | CREATE UNIQUE INDEX testimonials_pkey ON portfolio.testimonials USING btree (id) |

## 3) Existing enum types

_No enum types found in portfolio schema._

## 4-14) Existing columns (requested tables)

### hero

| Column | Data Type | UDT | Nullable | Default |
|---|---|---|---|---|
| id | uuid | uuid | NO | gen_random_uuid() |
| name | text | text | NO |  |
| title | text | text | NO |  |
| subtitle | text | text | YES |  |
| bio | text | text | YES |  |
| single_row_lock | boolean | bool | YES | true |
| created_at | timestamp with time zone | timestamptz | NO | now() |
| updated_at | timestamp with time zone | timestamptz | NO | now() |

### skills

| Column | Data Type | UDT | Nullable | Default |
|---|---|---|---|---|
| id | uuid | uuid | NO | gen_random_uuid() |
| name | text | text | NO |  |
| icon | text | text | YES |  |
| accent_color | character varying | varchar | YES |  |
| description | text | text | YES |  |
| proficiency | smallint | int2 | YES |  |
| years_experience | character varying | varchar | YES |  |
| tags | ARRAY | _text | NO | '{}'::text[] |
| display_order | integer | int4 | NO | 0 |
| is_active | boolean | bool | NO | true |
| created_at | timestamp with time zone | timestamptz | NO | now() |
| updated_at | timestamp with time zone | timestamptz | NO | now() |

### companies

| Column | Data Type | UDT | Nullable | Default |
|---|---|---|---|---|
| id | uuid | uuid | NO | gen_random_uuid() |
| name | text | text | NO |  |
| role | text | text | NO |  |
| period | character varying | varchar | YES |  |
| location | text | text | YES |  |
| logo | text | text | YES |  |
| brand_color | character varying | varchar | YES |  |
| currently_working | boolean | bool | NO | false |
| description | text | text | YES |  |
| display_order | integer | int4 | NO | 0 |
| is_active | boolean | bool | NO | true |
| created_at | timestamp with time zone | timestamptz | NO | now() |
| updated_at | timestamp with time zone | timestamptz | NO | now() |
| website | text | text | YES |  |
| team_size | character varying | varchar | YES |  |
| start_date | character varying | varchar | YES |  |
| end_date | character varying | varchar | YES |  |

### company_projects

| Column | Data Type | UDT | Nullable | Default |
|---|---|---|---|---|
| id | uuid | uuid | NO | gen_random_uuid() |
| company_id | uuid | uuid | NO |  |
| number | character varying | varchar | YES |  |
| title | text | text | NO |  |
| description | text | text | YES |  |
| technologies | ARRAY | _text | NO | '{}'::text[] |
| link | text | text | YES | '#'::text |
| display_order | integer | int4 | NO | 0 |
| is_active | boolean | bool | NO | true |
| created_at | timestamp with time zone | timestamptz | NO | now() |
| updated_at | timestamp with time zone | timestamptz | NO | now() |
| status | character varying | varchar | YES | NULL::character varying |
| impact | text | text | YES |  |

### personal_projects

| Column | Data Type | UDT | Nullable | Default |
|---|---|---|---|---|
| id | uuid | uuid | NO | gen_random_uuid() |
| title | text | text | NO |  |
| description | text | text | YES |  |
| technologies | ARRAY | _text | NO | '{}'::text[] |
| github_link | text | text | YES | '#'::text |
| live_link | text | text | YES | '#'::text |
| status | character varying | varchar | YES | 'Completed'::character varying |
| type | character varying | varchar | YES | 'Personal'::character varying |
| featured | boolean | bool | NO | false |
| year | integer | int4 | YES |  |
| display_order | integer | int4 | NO | 0 |
| is_active | boolean | bool | NO | true |
| created_at | timestamp with time zone | timestamptz | NO | now() |
| updated_at | timestamp with time zone | timestamptz | NO | now() |

### experience

| Column | Data Type | UDT | Nullable | Default |
|---|---|---|---|---|
| id | uuid | uuid | NO | gen_random_uuid() |
| period | character varying | varchar | YES |  |
| location | text | text | YES |  |
| role | text | text | NO |  |
| organisation | text | text | NO |  |
| description | text | text | YES |  |
| display_order | integer | int4 | NO | 0 |
| is_active | boolean | bool | NO | true |
| created_at | timestamp with time zone | timestamptz | NO | now() |
| updated_at | timestamp with time zone | timestamptz | NO | now() |
| experience_type | character varying | varchar | YES |  |
| employment_type | character varying | varchar | YES |  |
| start_date | character varying | varchar | YES |  |
| end_date | character varying | varchar | YES |  |
| is_current | boolean | bool | NO | false |
| achievements | ARRAY | _text | NO | '{}'::text[] |
| technologies | ARRAY | _text | NO | '{}'::text[] |
| company_url | text | text | YES |  |
| certificate_url | text | text | YES |  |
| degree | text | text | YES |  |
| institution | text | text | YES |  |

### certifications

| Column | Data Type | UDT | Nullable | Default |
|---|---|---|---|---|
| id | uuid | uuid | NO | gen_random_uuid() |
| name | text | text | NO |  |
| code | text | text | YES |  |
| issuer | text | text | NO |  |
| level | character varying | varchar | YES |  |
| issue_year | integer | int4 | YES |  |
| expiration_year | integer | int4 | YES |  |
| credly_link | text | text | YES |  |
| accent_color | character varying | varchar | YES |  |
| badge_link | text | text | YES |  |
| badge_type | character varying | varchar | YES | 'auto'::character varying |
| display_order | integer | int4 | NO | 0 |
| is_active | boolean | bool | NO | true |
| created_at | timestamp with time zone | timestamptz | NO | now() |
| updated_at | timestamp with time zone | timestamptz | NO | now() |

### testimonials

| Column | Data Type | UDT | Nullable | Default |
|---|---|---|---|---|
| id | uuid | uuid | NO | gen_random_uuid() |
| name | text | text | NO |  |
| role | text | text | NO |  |
| company | text | text | NO |  |
| avatar | text | text | YES |  |
| quote | text | text | NO |  |
| rating | smallint | int2 | YES | 5 |
| status | character varying | varchar | NO | 'Pending'::character varying |
| display_order | integer | int4 | NO | 0 |
| is_active | boolean | bool | NO | true |
| created_at | timestamp with time zone | timestamptz | NO | now() |
| updated_at | timestamp with time zone | timestamptz | NO | now() |
| visible | boolean | bool | NO | false |
| submitter_email | text | text | YES |  |

### blog_posts

| Column | Data Type | UDT | Nullable | Default |
|---|---|---|---|---|
| id | uuid | uuid | NO | gen_random_uuid() |
| title | text | text | NO |  |
| slug | text | text | NO |  |
| excerpt | text | text | YES |  |
| content | text | text | NO | ''::text |
| tags | ARRAY | _text | NO | '{}'::text[] |
| cover_image | text | text | YES |  |
| published | boolean | bool | NO | false |
| published_at | timestamp with time zone | timestamptz | YES |  |
| reading_time | integer | int4 | YES |  |
| author | text | text | NO | 'Anand Rajput'::text |
| is_active | boolean | bool | NO | true |
| created_at | timestamp with time zone | timestamptz | NO | now() |
| updated_at | timestamp with time zone | timestamptz | NO | now() |
| display_order | integer | int4 | NO | 0 |

### messages

| Column | Data Type | UDT | Nullable | Default |
|---|---|---|---|---|
| id | uuid | uuid | NO | gen_random_uuid() |
| name | text | text | NO |  |
| email | text | text | NO |  |
| message | text | text | NO |  |
| read | boolean | bool | NO | false |
| starred | boolean | bool | NO | false |
| replied_at | timestamp with time zone | timestamptz | YES |  |
| received_at | timestamp with time zone | timestamptz | NO | now() |
| is_deleted | boolean | bool | NO | false |
| deleted_at | timestamp with time zone | timestamptz | YES |  |
| notified_at | timestamp with time zone | timestamptz | YES |  |

### admin_users

| Column | Data Type | UDT | Nullable | Default |
|---|---|---|---|---|
| id | uuid | uuid | NO | gen_random_uuid() |
| username | text | text | NO |  |
| password_hash | text | text | NO |  |
| email | text | text | YES |  |
| reset_token | text | text | YES |  |
| reset_token_expiry | timestamp with time zone | timestamptz | YES |  |
| last_login_at | timestamp with time zone | timestamptz | YES |  |
| created_at | timestamp with time zone | timestamptz | NO | now() |

## 15) Existing RLS policies

| Table | Policy | Permissive | Roles | Command | Using | With Check |
|---|---|---|---|---|---|---|
| admin_users | Allow backend to read admins | PERMISSIVE | {public} | SELECT | true |  |
| analytics | public_read_analytics | PERMISSIVE | {public} | SELECT | true |  |
| blog_posts | public_read_blog_posts | PERMISSIVE | {public} | SELECT | ((published = true) AND (is_active = true)) |  |
| certifications | public_read_certifications | PERMISSIVE | {public} | SELECT | (is_active = true) |  |
| companies | public_read_companies | PERMISSIVE | {public} | SELECT | (is_active = true) |  |
| company_projects | public_read_company_projects | PERMISSIVE | {public} | SELECT | (is_active = true) |  |
| contact_information | public_read_contact | PERMISSIVE | {public} | SELECT | true |  |
| experience | public_read_experience | PERMISSIVE | {public} | SELECT | (is_active = true) |  |
| hero | public_read_hero | PERMISSIVE | {public} | SELECT | true |  |
| personal_projects | public_read_personal_projects | PERMISSIVE | {public} | SELECT | (is_active = true) |  |
| skills | public_read_skills | PERMISSIVE | {public} | SELECT | (is_active = true) |  |
| stats | public_read_stats | PERMISSIVE | {public} | SELECT | (is_active = true) |  |
| testimonials | public_read_testimonials | PERMISSIVE | {public} | SELECT | (((status)::text = 'Approved'::text) AND (is_active = true)) |  |

## 16) Existing triggers

| Table | Trigger | Event | Timing | Orientation | Action |
|---|---|---|---|---|---|
| blog_posts | blog_posts_updated_at | UPDATE | BEFORE | ROW | EXECUTE FUNCTION portfolio.set_updated_at() |
| certifications | certifications_updated_at | UPDATE | BEFORE | ROW | EXECUTE FUNCTION portfolio.set_updated_at() |
| companies | companies_updated_at | UPDATE | BEFORE | ROW | EXECUTE FUNCTION portfolio.set_updated_at() |
| company_projects | company_projects_updated_at | UPDATE | BEFORE | ROW | EXECUTE FUNCTION portfolio.set_updated_at() |
| contact_information | contact_information_updated_at | UPDATE | BEFORE | ROW | EXECUTE FUNCTION portfolio.set_updated_at() |
| experience | experience_updated_at | UPDATE | BEFORE | ROW | EXECUTE FUNCTION portfolio.set_updated_at() |
| hero | hero_updated_at | UPDATE | BEFORE | ROW | EXECUTE FUNCTION portfolio.set_updated_at() |
| personal_projects | personal_projects_updated_at | UPDATE | BEFORE | ROW | EXECUTE FUNCTION portfolio.set_updated_at() |
| skills | skills_updated_at | UPDATE | BEFORE | ROW | EXECUTE FUNCTION portfolio.set_updated_at() |
| stats | stats_updated_at | UPDATE | BEFORE | ROW | EXECUTE FUNCTION portfolio.set_updated_at() |
| testimonials | testimonials_updated_at | UPDATE | BEFORE | ROW | EXECUTE FUNCTION portfolio.set_updated_at() |

## 17) Existing functions related to updated_at

### portfolio.set_updated_at

```sql
CREATE OR REPLACE FUNCTION portfolio.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
```

## 18) Database version information

- PostgreSQL Version: PostgreSQL 17.6 on aarch64-unknown-linux-gnu, compiled by gcc (GCC) 15.2.0, 64-bit
- Server Version: 17.6
- Database: postgres
- Current User: postgres
- Server Encoding: UTF8
- Time Zone: UTC
