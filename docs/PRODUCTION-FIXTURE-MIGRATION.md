# Production fixture-change migration

This runbook applies `supabase/migrations/202609270001_fixture_change_sets.sql` once after review. It never imports competition data or finals JSON.

1. In Supabase Dashboard, confirm the selected project is the FIS production project using its visible project name and URL. Do not rely on an open browser tab alone.
2. Run the complete read-only `supabase/production/fixture_change_preflight.sql`. Save every result set and the total fixture and published-result counts.
3. Stop if `fixture_change_migration_ready` is not `true`, any prerequisite is false, or the migration state is partial/already installed. Investigate rather than modifying production through the diagnostic.
4. Paste and run the exact reviewed `supabase/migrations/202609270001_fixture_change_sets.sql` once. Never blindly rerun it after success; it intentionally owns non-idempotent schema creation.
5. Replace the two `NULL` count placeholders in `supabase/production/fixture_change_postflight.sql` with the saved fixture and published-result totals. Do not insert identifiers or credentials.
6. Run the complete postflight. Require every check and `fixture_change_migration_verified` to be `true`.
7. In a private administrator session, verify `/admin/results` still loads. Verify public Monday and Wednesday fixtures/results while signed out. Then review `/admin/fixtures`.
8. If execution fails, stop and retain the full error and preflight output. Do not rerun or manually drop objects. Determine whether PostgreSQL rolled back before preparing a reviewed forward repair.
9. Automatic destructive rollback is inappropriate because dropping columns, tables, history or functions could remove valid records and invalidate grants or dependencies. Prefer a reviewed forward migration.
10. Retain `fis-fixture-test` until production preflight, migration, postflight and application checks all succeed.

This procedure does not activate snapshot automation. That requires separate configuration and approval.
