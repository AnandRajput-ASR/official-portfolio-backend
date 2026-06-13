# Wave 1 Migration Manifest

## Scope

This manifest prepares Wave 1 migration execution artifacts only. It does not execute SQL.

## Deployment order

1. `database/migrations/wave1_001_business_expand.sql`
2. `database/migrations/wave1_002_business_indexes.sql`
3. `database/migrations/wave1_003_telemetry_indexes.sql`
4. `database/migrations/wave1_990_verify.sql` (read-only verification)

## Rollback order

1. `database/migrations/wave1_902_telemetry_indexes_rollback.sql`
2. `database/migrations/wave1_901_business_indexes_rollback.sql`
3. `database/migrations/wave1_903_business_expand_rollback.sql`

## File descriptions

| File | Purpose |
|---|---|
| `wave1_001_business_expand.sql` | Additive schema expansion: compatibility enums, audit/version columns, typed date columns, soft-delete compatibility columns. |
| `wave1_002_business_indexes.sql` | Additive business indexes using `CREATE INDEX CONCURRENTLY`. |
| `wave1_003_telemetry_indexes.sql` | Additive telemetry indexes using `CREATE INDEX CONCURRENTLY`. |
| `wave1_901_business_indexes_rollback.sql` | Rollback for business indexes (`DROP INDEX CONCURRENTLY`). |
| `wave1_902_telemetry_indexes_rollback.sql` | Rollback for telemetry indexes (`DROP INDEX CONCURRENTLY`). |
| `wave1_903_business_expand_rollback.sql` | Rollback for additive columns and Wave 1 enum types. |
| `wave1_990_verify.sql` | Post-deployment verification queries (enum, columns, indexes, row-count sanity). |
| `wave1/pre_migration_report.md` | Baseline inventory report captured before migration execution. |
| `wave1/wave1_readiness_review.md` | Production-readiness static review findings for Wave 1 files. |
| `wave1/wave1_deployment_checklist.md` | Dry-run deployment validation checklist and go/no-go conditions. |

## Execution requirements

1. Enforce exact file order listed above.
2. Run `wave1_001_business_expand.sql` in a transaction-capable step.
3. Run `wave1_002_business_indexes.sql` and `wave1_003_telemetry_indexes.sql` outside explicit transactions (required by `CONCURRENTLY`).
4. Ensure migration runner supports mixed transactional and non-transactional files in the same wave.
5. Confirm role permissions: `ALTER TABLE`, `CREATE TYPE`, `CREATE INDEX CONCURRENTLY`, `DROP INDEX CONCURRENTLY`.
6. Ensure `portfolio` schema and referenced tables exist before execution.
7. Apply operational guardrails (`lock_timeout`, `statement_timeout`) per environment policy.
8. Do not run rollback file `wave1_903_business_expand_rollback.sql` after meaningful writes to new Wave 1 columns unless data-loss impact is accepted.

## Verification requirements

1. Run `wave1_990_verify.sql` immediately after forward deployment sequence.
2. Validate:
   - Enum types exist in `portfolio` schema.
   - Added Wave 1 columns exist on target tables.
   - Expected Wave 1 business/telemetry indexes exist.
   - Row-count sanity has no unexpected drift.
3. For index files, additionally confirm indexes are valid (`indisvalid = true`) in catalog checks.
4. Record execution timestamps, lock wait observations, and any warnings/errors in deployment notes.
