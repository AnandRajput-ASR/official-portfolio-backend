# Wave 1 Migration Production Readiness Review

- Reviewed files:
  - `wave1_001_business_expand.sql`
  - `wave1_002_business_indexes.sql`
  - `wave1_003_telemetry_indexes.sql`
  - `wave1_901_business_indexes_rollback.sql`
  - `wave1_902_telemetry_indexes_rollback.sql`
  - `wave1_903_business_expand_rollback.sql`
  - `wave1_990_verify.sql`
- Scope: static review only (no SQL execution, no schema mutation).
- Target runtime: PostgreSQL 17 / Supabase Postgres.

## PASS / FAIL per file

| File | Result | Notes |
|---|---|---|
| `wave1_001_business_expand.sql` | **PASS** | PostgreSQL 17 compatible; Supabase compatible; idempotent additive DDL and guarded enum creation. |
| `wave1_002_business_indexes.sql` | **FAIL** | Uses `CREATE INDEX CONCURRENTLY`; fails if run in transactional migration runner; depends on columns added in file 001. |
| `wave1_003_telemetry_indexes.sql` | **FAIL** | Uses `CREATE INDEX CONCURRENTLY`; fails if run in transactional migration runner; depends on `singleton_key` from file 001. |
| `wave1_901_business_indexes_rollback.sql` | **FAIL** | Uses `DROP INDEX CONCURRENTLY`; fails if run in transactional migration runner. |
| `wave1_902_telemetry_indexes_rollback.sql` | **FAIL** | Uses `DROP INDEX CONCURRENTLY`; fails if run in transactional migration runner. |
| `wave1_903_business_expand_rollback.sql` | **PASS** | Dependency order is correct (drop dependent columns before enum types), and guards are present (`IF EXISTS`). |
| `wave1_990_verify.sql` | **PASS** | Read-only verification queries, PostgreSQL 17/Supabase compatible. |

## Critical issues

None identified.

## High issues

1. **Transactional incompatibility for concurrent index operations**
   - Affected files: `wave1_002`, `wave1_003`, `wave1_901`, `wave1_902`.
   - `CREATE INDEX CONCURRENTLY` / `DROP INDEX CONCURRENTLY` cannot run inside a transaction block.
   - Risk: immediate migration failure in frameworks that auto-wrap scripts in transactions.

2. **Strict dependency ordering requirement**
   - Affected files: `wave1_002`, `wave1_003`.
   - Index scripts reference columns introduced in `wave1_001` (`is_deleted`, `status_v2`, `singleton_key`).
   - Risk: first execution failure if file order is not enforced exactly.

## Medium issues

1. **Locking profile of `ALTER TABLE ... ADD COLUMN`**
   - Affected file: `wave1_001`.
   - Each `ALTER TABLE` takes `ACCESS EXCLUSIVE` lock on the table (typically brief for nullable/default-constant columns, but still blocking during lock acquisition).
   - Risk: write blocking under high concurrency.

2. **Rollback data loss risk post-write**
   - Affected file: `wave1_903`.
   - Rollback drops newly added columns; any data written to those columns after deploy is lost.
   - Risk: operational rollback is only safe pre-cutover or before application writes to new fields.

3. **Enum rollback future dependency risk**
   - Affected file: `wave1_903`.
   - Enum drops are guarded, but can still fail if later migrations add new dependencies to these enum types.

## Low issues

1. **`search_path` reliance**
   - Affected files: all.
   - Uses `SET search_path TO portfolio, public;` (works, but fully-qualified object names are safer in mixed-session tooling).

2. **Verification script is presence-oriented**
   - Affected file: `wave1_990`.
   - Confirms object existence and row counts but does not enforce expected counts or return explicit pass/fail assertions.

3. **RLS behavior unchanged for soft-delete columns**
   - Affected wave: primarily `wave1_001`.
   - New `is_deleted` columns are introduced, but policies remain unchanged in this wave.
   - Risk: none immediate in Wave 1; operationally relevant during cutover if reads are expected to hide soft-deleted rows.

## PostgreSQL 17 and Supabase compatibility assessment

- **PostgreSQL 17:** Syntax and patterns used are valid (`DO $$`, enum DDL, `ADD COLUMN IF NOT EXISTS`, concurrent index DDL, guarded drops).
- **Supabase:** Compatible with core Postgres behavior. Main caveat remains execution mode for concurrent index statements (must be non-transactional).

## Invalid DDL pattern check

- No invalid SQL constructs found.
- No missing guard clauses on destructive/idempotent operations where safety was expected (`IF EXISTS` / `IF NOT EXISTS` are consistently used).

## RLS / trigger side effects

- **RLS:** No direct RLS DDL changes in these scripts; no immediate policy breakage introduced.
- **Triggers:** No trigger create/drop/alter; existing `updated_at` triggers remain unaffected by Wave 1 scripts.

## Enum deployment risks

- Enum creation is safely guarded by existence checks in schema `portfolio`.
- Rollback order is correct (drop enum-typed columns before enum type drop).
- Main residual risk is future external dependencies on these enums prior to rollback.

## Recommended fixes

1. **Enforce non-transactional execution** for files containing concurrent index DDL (`wave1_002`, `wave1_003`, `wave1_901`, `wave1_902`) at migration-runner level.
2. **Enforce strict deployment order**: `wave1_001` -> `wave1_002` -> `wave1_003`; rollback in reverse (`901/902` before `903`).
3. **Add deployment-time lock controls** (for operations runner/session), e.g., explicit `lock_timeout` / `statement_timeout` configuration in runbook.
4. **Gate rollback usage** of `wave1_903` to pre-cutover windows (or when confirmed no writes occurred to new columns).
5. **Enhance verification runbook** to include expected object counts and explicit success criteria (outside SQL file, in deployment checklist).
