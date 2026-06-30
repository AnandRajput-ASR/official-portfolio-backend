# Wave 2 Batch 3 Change Summary

## Scope applied

- Write-path compatibility only
- No API contract changes
- No legacy column removals
- No soft-delete behavior changes
- No cleanup of old write paths

## Files changed

1. `repositories/admin.repository.js`
2. `repositories/content.repository.js`
3. `repositories/messages.repository.js`
4. `repositories/resume.repository.js`
5. `services/auth.service.js`

## Implemented changes

### 1) Versioning on updates

Added `version = COALESCE(version, 1) + 1` on update paths for Wave 1 tables across:
- `admin.repository.js` (hero/contact, skills, companies/company_projects, personal_projects, experience, stats, certifications, testimonials, blog_posts, analytics)
- `content.repository.js` (hero, contact_information, analytics, reorder updates)
- `messages.repository.js` (admin-side updates: notified/read/star/delete/markAllRead)
- `resume.repository.js` (singleton update paths)
- `auth.service.js` (`admin_users` updates: login/change/reset flows)

No client-supplied version required.

### 2) Enum dual-write

Implemented legacy + v2 dual-write in `admin.repository.js`:
- `company_projects`: continue writing `status`, also write `status_v2`
- `personal_projects`: continue writing `status`/`type`, also write `status_v2`/`type_v2`
- `testimonials`: continue writing `status`, also write `status_v2` (create/submit/approve/reject)

### 3) Typed date dual-write

Implemented in `admin.repository.js`:
- `companies`: continue writing `start_date`/`end_date`, also write `start_date_d`/`end_date_d`
- `experience`: continue writing `start_date`/`end_date`, also write `start_date_d`/`end_date_d`

Typed-date writes are guarded with ISO-date pattern checks before casting to `date`.

### 4) Audit columns for writes

Added write support for:
- `created_by`, `updated_by` on inserts
- `updated_by` on updates

Pattern:
- Functions accept optional actor fields (`createdBy`/`updatedBy`) without changing existing request payload requirements.
- If actor id is unavailable, writes remain backward compatible with `NULL`.
- `auth.service.js` uses known `admin.id` for `updated_by` in admin account updates.

### 5) Resume meta singleton write enhancements

In `resume.repository.js`:
- Upsert now supports audit fields and version increment on conflict update.
- Download-name updates now set `updated_by` and increment `version` (singleton-key path with legacy fallback preserved).

### 6) Messages admin-side write enhancements

In `messages.repository.js`:
- Admin-side update methods now set `updated_by` and increment `version`.
- Existing message API contracts/responses remain unchanged.

## Compatibility outcomes

- Existing API requests continue to work unchanged.
- Existing API responses remain unchanged.
- Legacy columns remain written as before.
- New Wave 1 columns are now populated during writes in dual-write mode.
