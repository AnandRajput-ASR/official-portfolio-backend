# Wave 2 Backend Compatibility Assessment and Implementation Plan

- Repository: `official-portfolio-backend`
- Scope: backend read/write compatibility after Wave 1 schema changes
- Analysis mode: read-only (no source edits, no DB changes)
- Compatibility goal: existing APIs continue to work while Wave 2 adopts Wave 1 columns

## Scope coverage (requested tables)

Tables analyzed in backend data-access paths:
- `hero`
- `contact_information`
- `analytics`
- `resume_meta`
- `skills`
- `companies`
- `company_projects`
- `personal_projects`
- `experience`
- `certifications`
- `testimonials`
- `blog_posts`
- `messages`
- `admin_users`
- `stats`

---

## Affected Files

| File | Table | Query Type | Required Change |
|---|---|---|---|
| `repositories/shared.repository.js` | hero | SELECT | Replace `LIMIT 1` singleton read with `WHERE singleton_key='default'` (+ fallback during rollout). |
| `repositories/shared.repository.js` | contact_information | SELECT | Same singleton adoption as hero. |
| `repositories/shared.repository.js` | analytics | SELECT | Same singleton adoption; stop relying on first-row semantics. |
| `repositories/shared.repository.js` | skills | SELECT | Add `is_deleted = false` filter (keep `is_active = true` for backward compatibility), optionally expose `years_experience_min/max`. |
| `repositories/shared.repository.js` | companies | SELECT | Add `comp.is_deleted = false`; read typed dates with fallback (`COALESCE(start_date_d::text, start_date)`, same for end). |
| `repositories/shared.repository.js` | company_projects | SELECT (JOIN) | Add `proj.is_deleted = false`; read `status_v2` with fallback to legacy `status`. |
| `repositories/shared.repository.js` | personal_projects | SELECT | Add `is_deleted = false`; read `status_v2/type_v2` with fallback to `status/type`. |
| `repositories/shared.repository.js` | experience | SELECT | Add `is_deleted = false`; read typed dates (`start_date_d/end_date_d`) with fallback to legacy text fields/period. |
| `repositories/shared.repository.js` | stats | SELECT | Add `is_deleted = false` filter (keep `is_active = true` until cutover). |
| `repositories/shared.repository.js` | certifications | SELECT | Add `is_deleted = false` filter (keep `is_active = true`). |
| `repositories/shared.repository.js` | testimonials | SELECT | Add `is_deleted = false`; move status reads toward `status_v2` with fallback to `status`. |
| `repositories/shared.repository.js` | blog_posts | SELECT | Add `is_deleted = false` filter (keep `is_active = true`). |
| `repositories/content.repository.js` | hero | UPDATE | Add optimistic version bump (`version = version + 1`) and `updated_by`; singleton update via `singleton_key='default'` (+ fallback). |
| `repositories/content.repository.js` | contact_information | UPDATE | Same as hero update pattern. |
| `repositories/content.repository.js` | analytics | UPDATE | Increment `version`, set `updated_by`, update singleton targeting to `singleton_key='default'` (+ fallback). |
| `repositories/content.repository.js` | skills/companies/company_projects/personal_projects/experience/stats/certifications/testimonials/blog_posts | UPDATE (reorder) | For each update: increment `version`, set `updated_by`; include `is_deleted=false` guard in `WHERE`. |
| `repositories/admin.repository.js` | hero/contact_information | UPDATE | Singleton-key targeting + version increments + updated_by. |
| `repositories/admin.repository.js` | skills | INSERT/UPDATE/“DELETE”(soft) | On INSERT set `created_by/updated_by`; on UPDATE increment `version`; replace `is_active=false` delete path with `is_deleted=true, deleted_at=now()` and version bump (optionally keep `is_active=false` dual-write). |
| `repositories/admin.repository.js` | companies | INSERT/UPDATE/“DELETE”(soft) | Adopt typed dates (`start_date_d/end_date_d`) while preserving legacy fields; add version/audit; switch soft delete to `is_deleted/deleted_at` (dual-write with `is_active` during compatibility). |
| `repositories/admin.repository.js` | company_projects | INSERT/UPDATE/“DELETE”(soft) | Introduce `status_v2` writes with fallback to `status`; add version/audit; soft delete via `is_deleted/deleted_at`. |
| `repositories/admin.repository.js` | personal_projects | INSERT/UPDATE/“DELETE”(soft) | Introduce `status_v2/type_v2` writes with fallback legacy columns; add version/audit; soft delete via `is_deleted/deleted_at`. |
| `repositories/admin.repository.js` | experience | INSERT/UPDATE/“DELETE”(soft) | Add typed dates write path (`start_date_d/end_date_d`) while keeping `period/start_date/end_date`; version/audit; soft delete via `is_deleted/deleted_at`. |
| `repositories/admin.repository.js` | stats | INSERT/UPDATE/soft-delete-removed | Add version/audit for insert/update; changed removal logic to `is_deleted=true, deleted_at=now()` (plus current `is_active=false` dual-write). |
| `repositories/admin.repository.js` | certifications | INSERT/UPDATE/“DELETE”(soft) | Add version/audit; soft delete via `is_deleted/deleted_at` (dual-write with `is_active`). |
| `repositories/admin.repository.js` | testimonials | SELECT/INSERT/UPDATE/“DELETE”(soft) | Read/write `status_v2` compatibility; preserve legacy `status` until Wave 3+ cutover; add version/audit; soft delete via `is_deleted/deleted_at`; approval/rejection should set `approved_by/approved_at` and `rejected_by/rejected_at`. |
| `repositories/admin.repository.js` | blog_posts | INSERT/UPDATE/“DELETE”(soft) | Add version/audit; soft delete via `is_deleted/deleted_at` (dual-write with `is_active`). |
| `repositories/admin.repository.js` | analytics | SELECT/UPDATE | Singleton-key targeting + version/audit on resets/event updates; preserve existing counters. |
| `repositories/messages.repository.js` | messages | INSERT/SELECT/UPDATE/soft-delete | Already uses `is_deleted/deleted_at`; add version increment on all updates and set `updated_by` on admin-side actions. |
| `repositories/resume.repository.js` | resume_meta | SELECT/INSERT/UPDATE/DELETE | Replace `LIMIT 1`/`single_row_lock` assumption with `singleton_key='default'` targeting (+ fallback); avoid full-table `DELETE` and use singleton-targeted update/reset pattern; add version/audit updates. |
| `services/content.service.js` | hero/contact_information/analytics (+ others via shared reads) | Indirect SELECT/UPDATE | Replace array-first assumptions (`heroData[0]`, `contactInfo[0]`) with singleton object contract from repository. |
| `services/admin.service.js` | hero/contact_information/analytics (+ CRUD tables via repo) | Indirect SELECT/INSERT/UPDATE/DELETE | Same singleton object assumption cleanup; no contract break to controllers. |
| `services/messages.service.js` | messages | Indirect INSERT/SELECT/UPDATE/DELETE | No contract break; propagate actor id where needed for `updated_by`. |
| `services/auth.service.js` | admin_users | SELECT/UPDATE | Replace `LIMIT 1` with singleton-key targeting and add version increment + updated_by on account mutations. |
| `controllers/content.controller.js` | hero/contact_information/analytics (+ others) | Indirect read/write | No DB query change directly; keep response shapes stable while repositories/services adopt compatibility fields. |
| `controllers/admin.controller.js` | all admin-managed listed tables | Indirect CRUD | No DB query change directly; ensure request payload validation continues to accept old fields while repositories dual-write new fields. |
| `controllers/messages.controller.js` | messages | Indirect CRUD | No direct DB changes; maintain same API responses while repository introduces version/audit writes. |
| `controllers/auth.controller.js` | admin_users | Indirect SELECT/UPDATE | No response contract change required; token flow unaffected. |

---

## Soft Delete Adoption Plan

Current delete semantics are mixed (`is_active=false` soft delete in many tables, `is_deleted` only in messages, hard delete in `resume_meta`).

Operations to convert to Wave 1 soft-delete pattern (`is_deleted = true`, `deleted_at = now()`):

1. `repositories/admin.repository.js`
   - `deleteSkillById` (`skills`)
   - `deleteCompanyById` (`companies`) and nested project update (`company_projects`)
   - `deleteProjectById` (`company_projects`)
   - `deletePersonalProjectById` (`personal_projects`)
   - `deleteExperienceById` (`experience`)
   - `deleteCertificationById` (`certifications`)
   - `deleteTestimonial` (`testimonials`)
   - `deletePendingTestimonial` (`testimonials`)
   - `deleteBlogPost` (`blog_posts`)
   - `syncStats` removal branch (`stats`, currently id-not-in update)
2. `repositories/messages.repository.js`
   - Already compliant (`deleteMessage` uses `is_deleted/deleted_at`) — add version/audit only.
3. `repositories/resume.repository.js`
   - `deleteMeta` is currently hard delete (`DELETE FROM portfolio.resume_meta`); move to singleton-scoped reset/update strategy (no table-wide delete).

Compatibility strategy:
- Wave 2 should dual-write `is_active=false` and `is_deleted=true` where `is_active` is currently used by reads, then move reads to `is_deleted=false AND is_active=true` in same wave.

---

## Singleton Adoption Plan

### Locations using `LIMIT 1` / first-row assumptions

1. `repositories/shared.repository.js`
   - `getHero` (`hero`, `LIMIT 1`)
   - `getContactInfo` (`contact_information`, `LIMIT 1`)
   - `getAnalytics` (`analytics`, `LIMIT 1`)
2. `repositories/admin.repository.js`
   - `getAnalytics` (`analytics`, `WHERE single_row_lock=true LIMIT 1`)
3. `repositories/resume.repository.js`
   - `getMeta` (`resume_meta`, `LIMIT 1`)
4. `services/content.service.js`
   - `getPageContent`: `heroData[0]`, `contactInfo[0]`
   - `getHero`: `heroData[0]`
   - `getContactInfo`: `contactInfo[0]`
5. `services/admin.service.js`
   - `getPageContent`: `heroData[0]`, `contactInfo[0]`
6. `services/auth.service.js`
   - `getAdmin` (`admin_users`, `LIMIT 1`)

### Recommended migration

Use `singleton_key = 'default'` as primary selector for:
- `hero`, `contact_information`, `analytics`, `resume_meta`, `admin_users` (if adopting singleton semantics for admin account row)

Backward-compatible rollout pattern:
1. Read with fallback:
   - first try `WHERE singleton_key='default'`
   - fallback to existing `single_row_lock=true` / `LIMIT 1` if not present
2. Write/update by `singleton_key='default'` with fallback selector for transition period.
3. Backfill/set `singleton_key='default'` in one-time maintenance step before removing fallback.

---

## Enum Adoption Plan

Wave 1 added:
- `testimonials.status_v2`
- `personal_projects.status_v2`
- `personal_projects.type_v2`
- `company_projects.status_v2`

### Testimonial status code paths
- Reads:
  - `repositories/shared.repository.js`: `getTestimonials`, `getPendingTestimonials`
  - `repositories/admin.repository.js`: `getAllTestimonials`
- Writes:
  - `repositories/admin.repository.js`: `createTestimonial`, `submitTestimonial`, `approveTestimonial`, `rejectTestimonial`, `updateTestimonials`

Plan:
- Dual-write status updates to both `status` and `status_v2`.
- Reads use `COALESCE(status_v2::text, lower(status))` mapping layer.
- Preserve existing API response values until explicit v2 response contract.

### Personal project status/type code paths
- Reads:
  - `repositories/shared.repository.js`: `getPersonalProjects`
- Writes:
  - `repositories/admin.repository.js`: `putPersonalProjects`, `postPersonalProject`

Plan:
- Dual-write `status` + `status_v2`, `type` + `type_v2`.
- Read with fallback priority to v2 fields.

### Company project status code paths
- Reads:
  - `repositories/shared.repository.js`: `getCompanies` project JSON includes `status`
- Writes:
  - `repositories/admin.repository.js`: `putCompanies` (project update sets `status`)
  - `repositories/admin.repository.js`: `postCompanyProject` (currently no status)

Plan:
- Write to `status_v2` (and `status` for backward compatibility).
- Read status from `COALESCE(status_v2::text, status)`.

---

## Versioning Adoption Plan (`version = version + 1`)

Apply optimistic-version increments on all UPDATE operations for Wave 1-enabled tables:

1. `repositories/content.repository.js`
   - `putHero`, `putContactInfo`, `trackAnalyticsEvent` (analytics update), `reorderSection` updates.
2. `repositories/admin.repository.js`
   - `putHeroSection`
   - `putSkills`, `deleteSkillById`
   - `putCompanies`, `deleteCompanyById`
   - `putPersonalProjects`, `deletePersonalProjectById`
   - `putExperience`, `deleteExperienceById`
   - `syncStats`
   - `putCertification`, `deleteCertificationById`
   - `updateTestimonials`, `enableTestimonialById`, `approveTestimonial`, `rejectTestimonial`, `deleteTestimonial`, `deletePendingTestimonial`
   - `updateBlogPostById`, `updateBlogPosts`, `deleteBlogPost`
   - `resetAnalytics`, `trackAnalyticsEvent`
3. `repositories/messages.repository.js`
   - `markNotified`, `markRead`, `toggleStar`, `deleteMessage`, `markAllRead`
4. `repositories/resume.repository.js`
   - `upsertMeta`, `updateDownloadName` (and singleton-scoped delete/reset path)
5. `services/auth.service.js` (direct SQL)
   - admin user updates: `login` (last_login_at), `changePassword`, `generateResetToken`, `resetPassword`

Recommended compatibility pattern:
- Increment `version` server-side automatically in updates.
- Keep API request payload unchanged in Wave 2 (no required version from client yet).
- Prepare Wave 3 for optional optimistic-lock request enforcement.

---

## Adoption of remaining Wave 1 columns

### `created_by`, `updated_by`
- Add actor propagation for authenticated admin paths (controller -> service -> repository).
- Apply in all INSERT/UPDATE paths on mutable business tables.
- For public endpoints (e.g., public testimonial submit, contact message), set `updated_by/created_by` null or system actor.

### `start_date_d`, `end_date_d`
- Primary write paths in `companies` and `experience` updates/inserts should set typed date columns (plus existing legacy text fields for compatibility).
- Read paths should prefer typed date columns and fallback to legacy text.

### `is_deleted`, `deleted_at`
- Add to all SELECT filters in targeted tables where currently only `is_active` is used.
- For transition safety use combined predicate: `is_active = true AND COALESCE(is_deleted, false) = false`.

---

## Risk Assessment

| Change Area | Risk | Reason |
|---|---|---|
| Add `is_deleted` filters to SELECT queries | Medium | Can hide previously visible rows if historical data has unexpected flags. |
| Convert delete flows from `is_active` to `is_deleted/deleted_at` (dual-write) | Medium | Behavior change across many endpoints; requires careful consistency in all reads. |
| Introduce singleton-key selectors with fallback | Low | Backward compatible if fallback retained; high confidence migration path. |
| Remove singleton fallbacks too early | High | Could break hero/contact/analytics/resume/admin reads if singleton keys not populated in all envs. |
| Dual-write enum legacy + v2 columns | Medium | Mapping mistakes can desync values; requires explicit normalization. |
| Switch reads to v2 enums first | Medium | Requires strict fallback handling for pre-existing legacy rows. |
| Add version increments to all updates | Low | Minimal API impact if server-managed only; improves future concurrency support. |
| Require client-provided version in Wave 2 | High | Breaking change for existing clients; should be deferred. |
| Add `updated_by/created_by` across write paths | Medium | Requires actor plumbing through services/repositories and safe null behavior on public endpoints. |
| Typed date column adoption with fallback reads | Medium | Parsing/format assumptions can cause display inconsistencies if fallback not robust. |
| `resume_meta` hard-delete replacement | Medium | Endpoint behavior shift needs explicit expected semantics for “delete meta”. |

---

## Recommended execution order for Wave 2

1. **Foundational compatibility utilities (Low risk)**
   - Add shared mapping helpers for enum/date fallback logic.
   - Add common predicates (`is_active` + `is_deleted`) helper snippets.
2. **Singleton-safe reads/writes with fallback (Low risk)**
   - `hero`, `contact_information`, `analytics`, `resume_meta`, `admin_users`.
3. **Read-path hardening (Medium risk)**
   - Add `is_deleted=false` filters to all targeted SELECTs.
   - Add enum/date read fallback to v2/typed columns.
4. **Write-path dual-write adoption (Medium risk)**
   - Add v2 enum writes + legacy writes.
   - Add typed-date writes + legacy writes.
   - Add version increments and `updated_by/created_by`.
5. **Delete-path convergence (Medium risk)**
   - Convert all soft-delete endpoints to `is_deleted/deleted_at` dual-write strategy.
6. **Service/controller contract stabilization (Low-Medium risk)**
   - Remove array-first singleton assumptions in services.
   - Keep response payloads backward compatible.
7. **Validation and rollout gating**
   - Regression tests on all affected admin/public endpoints.
   - Verify row visibility parity and no API contract drift.

---

## Estimated impact and recommendation

1. **Estimated number of files impacted:** **13**
   - Repositories: `shared`, `content`, `admin`, `messages`, `resume` (5)
   - Services: `content`, `admin`, `messages`, `auth` (4)
   - Controllers: `content`, `admin`, `messages`, `auth` (4)

2. **Recommended execution order for Wave 2:** use the 7-step order above (singleton -> reads -> writes -> deletes -> service/controller stabilization -> validation).

3. **GO / NO-GO recommendation:** **GO (conditional)**
   Proceed with Wave 2 implementation **only** with dual-write/dual-read compatibility and fallback logic preserved until Wave 3 cutover criteria are met.
