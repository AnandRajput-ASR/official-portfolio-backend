# Wave 2 Batch 4 Change Summary (Soft Delete Convergence)

## Scope

- Repository-only changes
- Soft-delete convergence only
- No API contract changes
- No schema changes

## Pre-edit analysis

### Affected delete functions

1. `repositories/admin.repository.js`
   - `deleteSkill`
   - `deleteCompany`
   - `deleteCompanyProject`
   - `deletePersonalProject`
   - `deleteExperience`
   - `deleteCertification`
   - `deleteTestimonial`
   - `deleteBlogPost`
   - `deleteResume`
   - `deleteStats`
   - `deleteGalleryImage`
2. `repositories/messages.repository.js`
   - `softDeleteMessage` (already soft-delete based)
3. `repositories/resume.repository.js`
   - `deleteMeta` (used physical `DELETE` before this batch)

### Implementation plan followed

1. Add Wave 1 soft-delete tuple to admin delete updates:
   - `is_active = false`
   - `is_deleted = true`
   - `deleted_at = now()`
2. Verify messages repository delete behavior remains soft-delete-compatible and keep/add version increment only if needed.
3. Replace destructive resume metadata deletes with singleton-targeted reset updates (default key first, legacy fallback).
4. Keep all response shapes unchanged and keep Batch 2 read-path compatibility intact.

## Applied changes

### `repositories/admin.repository.js`

- Updated Wave 1 entity delete paths to set:
  - `is_active = false`
  - `is_deleted = true`
  - `deleted_at = now()`
- Preserved existing function signatures and returned payload shapes.

### `repositories/messages.repository.js`

- No additional code change required for Batch 4.
- Verified delete behavior is already soft-delete style and includes version bump.

### `repositories/resume.repository.js`

- `deleteMeta(updatedBy = null)` now performs singleton-targeted reset update instead of physical delete:
  - Clears filename fields and size
  - Updates `uploaded_at`
  - Sets `updated_by`
  - Increments `version`
  - Applies `singleton_key = 'default'` first with fallback to legacy `single_row_lock = true`
- `getMeta()` now treats reset rows (`storedName` empty) as absent to preserve API behavior where deleted resume appears as not uploaded.

## Compatibility and safety notes

- No physical `DELETE FROM` statements remain for Wave 1 entities in Batch 4 scoped repositories.
- API response contracts remain unchanged.
- Batch 2 read filters remain compatible (no read-path changes made in this batch).
