# Wave 2 Batch 2 Change Summary

## Scope applied

- Read-path hardening only
- File changed: `repositories/shared.repository.js`
- No write-path, soft-delete write, enum write, versioning, or audit-field updates
- No response field renames/removals

## Affected functions

1. `getSkills`
2. `getCompanies`
3. `getPersonalProjects`
4. `getExperience`
5. `getStats`
6. `getCertifications`
7. `getTestimonials`
8. `getBlogPosts`
9. `getPendingTestimonials`

## Implemented changes

### 1) Read filtering hardening

Added `COALESCE(is_deleted, false) = false` alongside existing active filters:

- `skills`
- `companies`
- `company_projects` (join predicate)
- `personal_projects`
- `experience`
- `certifications`
- `testimonials` (approved + pending reads)
- `blog_posts`
- `stats`

### 2) Enum fallback reads

- Company projects (inside companies aggregate):
  - `COALESCE(proj.status_v2::text, proj.status)` as project `status`
- Personal projects:
  - `COALESCE(status_v2::text, status) AS status`
  - `COALESCE(type_v2::text, type) AS type`
- Testimonials:
  - selected `status` now uses `COALESCE(status_v2::text, status)`
  - approval/pending filters now evaluate against fallback status expression

### 3) Typed date fallback reads

- Companies:
  - `COALESCE(comp.start_date_d::text, comp.start_date) AS "startDate"`
  - `COALESCE(comp.end_date_d::text, comp.end_date) AS "endDate"`
- Experience:
  - To preserve existing API shape, `period` now falls back to typed-date text values when `period` is null:
    - `COALESCE(period, CONCAT_WS(' - ', COALESCE(start_date_d::text, start_date), COALESCE(end_date_d::text, end_date))) AS period`

## API compatibility note

- Existing response keys remain unchanged.
- No write behavior or contracts were changed.
