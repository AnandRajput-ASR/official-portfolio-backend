# Wave 2 Batch 1 Change Summary

## Scope applied

- Singleton adoption only
- No soft delete behavior changes
- No enum migration behavior changes
- No versioning behavior changes
- No API contract changes

## Files changed

1. `repositories/shared.repository.js`
2. `repositories/resume.repository.js`
3. `repositories/content.repository.js`
4. `services/content.service.js`
5. `services/admin.service.js`

## What changed

### 1) Singleton lookup migration with fallback

- `getHero`, `getContactInfo`, `getAnalytics` in `shared.repository.js` now:
  1. query with `WHERE singleton_key = 'default'`
  2. fallback to legacy `LIMIT 1` query if no row is found

- `resume.repository.js` now:
  - `getMeta`: singleton-key-first read with legacy `LIMIT 1` fallback
  - `upsertMeta`: writes `singleton_key = 'default'` while keeping `ON CONFLICT (single_row_lock)` compatibility
  - `updateDownloadName`: singleton-key-first update with `single_row_lock = true` fallback
  - `deleteMeta`: singleton-key-targeted delete with `single_row_lock = true` fallback

- `content.repository.js`:
  - `trackAnalyticsEvent` now updates analytics with singleton-key-first selector and fallback to `single_row_lock = true`

### 2) Service-layer singleton object handling

- Removed array-first singleton assumptions:
  - `services/content.service.js`: removed `heroData[0]`, `contactInfo[0]`
  - `services/admin.service.js`: removed `heroData[0]`, `contactInfo[0]`

- Services now consume singleton objects directly from repositories while preserving response shape.

## Backward compatibility notes

- All singleton reads/writes still work if `singleton_key` is not yet populated.
- Existing API response structures remain unchanged.
- Legacy selectors (`LIMIT 1`, `single_row_lock = true`) are retained as fallback paths.
