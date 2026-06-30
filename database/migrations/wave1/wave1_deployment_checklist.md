# Wave 1 Dry-Run Deployment Validation Checklist

- Scope reviewed (no SQL executed):
  `wave1_001_business_expand.sql`, `wave1_002_business_indexes.sql`, `wave1_003_telemetry_indexes.sql`
- Target: PostgreSQL 17 / Supabase

## 1) Exact deployment order

1. `wave1_001_business_expand.sql`
2. `wave1_002_business_indexes.sql`
3. `wave1_003_telemetry_indexes.sql`

Reason: files 002/003 index columns created in file 001 (`is_deleted`, `status_v2`, `singleton_key`).

## 2) Exact rollback order

1. `wave1_902_telemetry_indexes_rollback.sql`
2. `wave1_901_business_indexes_rollback.sql`
3. `wave1_903_business_expand_rollback.sql`

Reason: drop indexes first, then drop newly added columns/types.

## 3) Files that require transaction

- `wave1_001_business_expand.sql` (**run in transaction recommended**).

## 4) Files that must NOT be inside transaction

- `wave1_002_business_indexes.sql` (`CREATE INDEX CONCURRENTLY`)
- `wave1_003_telemetry_indexes.sql` (`CREATE INDEX CONCURRENTLY`)
- Rollbacks for indexes also non-transactional (`DROP INDEX CONCURRENTLY`): `wave1_901`, `wave1_902`

## 5) Preconditions before execution

1. Migration runner supports mixed mode (transactional + non-transactional files).
2. `portfolio` schema exists and all referenced tables exist.
3. `wave1_001` must finish successfully before 002/003 start.
4. Deployment role has privileges for `ALTER TABLE`, `CREATE TYPE`, `CREATE INDEX CONCURRENTLY`.
5. For 002/003, execute outside explicit `BEGIN/COMMIT`.
6. Set conservative runtime guardrails in runner/session (`lock_timeout`, `statement_timeout`) per environment policy.

## 6) Expected execution time estimate (DEV)

- `wave1_001_business_expand.sql`: **~10-60s** (many `ALTER TABLE`, table/lock dependent)
- `wave1_002_business_indexes.sql`: **~30-180s** (13 concurrent indexes; data-size dependent)
- `wave1_003_telemetry_indexes.sql`: **~10-60s** (3 concurrent indexes; data-size dependent)
- Total expected DEV window: **~1-5 minutes**

## 7) Expected locks per file

- `wave1_001_business_expand.sql`:
  - `ALTER TABLE ... ADD COLUMN` takes brief `ACCESS EXCLUSIVE` lock per table.
  - With current additive pattern, lock duration should be short, but lock acquisition can wait under active writes.
- `wave1_002_business_indexes.sql`:
  - `CREATE INDEX CONCURRENTLY` avoids long blocking writes; uses lower-impact locks with multi-phase scans.
  - May wait for concurrent transactions and increase I/O/CPU while building.
- `wave1_003_business_indexes.sql`:
  - Same lock profile as file 002.

## 8) Expected objects created per file

- `wave1_001_business_expand.sql`:
  - **4 enum types**
  - **84 new columns** across singleton/business tables
- `wave1_002_business_indexes.sql`:
  - **13 indexes**
- `wave1_003_telemetry_indexes.sql`:
  - **3 indexes**

## 9) Verification queries immediately after each file

### After `wave1_001_business_expand.sql`

1. Enum presence:
   - Check `portfolio.enum_testimonial_status_v2`
   - Check `portfolio.enum_company_project_status_v2`
   - Check `portfolio.enum_personal_project_status_v2`
   - Check `portfolio.enum_personal_project_type_v2`
2. Added-column presence:
   - Query `information_schema.columns` for Wave 1 columns (`version`, `created_by`, `updated_by`, `is_deleted`, `deleted_at`, `singleton_key`, `config_version`, `start_date_d`, `end_date_d`, `status_v2`, `type_v2`, `years_experience_min`, `years_experience_max`, `approved_by`, `approved_at`, `rejected_by`, `rejected_at`) in `portfolio`.
3. Row count sanity:
   - Capture row counts for all portfolio tables (no drift expected).

### After `wave1_002_business_indexes.sql`

1. Index presence:
   - Validate 13 business indexes by name in `pg_indexes` (`schemaname='portfolio'`).
2. Invalid indexes:
   - Confirm none are marked invalid in catalog (`indisvalid=true` via `pg_index` join check).

### After `wave1_003_telemetry_indexes.sql`

1. Index presence:
   - Validate telemetry indexes:
     - `idx_project_clicks_clicks_desc`
     - `idx_analytics_singleton_key`
     - `idx_resume_meta_singleton_key`
2. Invalid indexes:
   - Confirm `indisvalid=true` for these 3 indexes.

## 10) Deployment checklist (runbook)

1. Confirm preconditions and mixed transaction capability.
2. Run `wave1_001_business_expand.sql` in transaction.
3. Run post-001 verification queries.
4. Run `wave1_002_business_indexes.sql` outside transaction.
5. Run post-002 verification queries.
6. Run `wave1_003_telemetry_indexes.sql` outside transaction.
7. Run post-003 verification queries.
8. Run consolidated checks from `wave1_990_verify.sql` (read-only).
9. Record timings, lock waits, and any warnings/errors.

## Rollback checklist

1. Decision gate: use rollback only if Wave 1 must be reverted.
2. Run `wave1_902_telemetry_indexes_rollback.sql` outside transaction.
3. Run `wave1_901_business_indexes_rollback.sql` outside transaction.
4. Verify index removal via `pg_indexes`.
5. Run `wave1_903_business_expand_rollback.sql` in transaction.
6. Verify enum removal and column removal via catalog queries.
7. Re-run baseline row-count sanity checks.

## Go / No-Go decision (DEV)

**GO (conditional).**

Go is recommended for DEV **only if** deployment tooling supports non-transactional execution for concurrent index files and strict file ordering is enforced.

## Remaining blockers

1. Migration runner configuration for `CONCURRENTLY` files (must not auto-wrap in transaction).
2. Explicit operational runbook confirmation for lock/statement timeouts.
3. Rollback policy acknowledgement: `wave1_903` drops added columns/types and should be used before any meaningful writes to new columns.
