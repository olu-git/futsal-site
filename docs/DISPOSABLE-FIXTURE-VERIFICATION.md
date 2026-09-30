# Disposable Admin Fixtures verification

**DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION.** Use only the empty Supabase Dashboard project named `fis-fixture-test`. Never paste a local path, shell command or `psql` `\i` directive into the SQL Editor. Open each named `.sql` file locally, copy its **entire contents**, and run that text as one SQL Editor query. Do not use a production connection, production identifiers, API keys, passwords, imports or season data.

## One-time preparation

1. In the Supabase Dashboard, verify the selected project is **fis-fixture-test** and its database is empty. Stop if the project name differs. In its SQL Editor, paste and run `supabase/tests/disposable_fixture_marker.sql`. Expected: one row with `project_name = fis-fixture-test` and no error. The marker lives in the non-exposed `fis_fixture_test` schema. It is an explicit guard for every later test script, not an automatic way to identify a Supabase project; do not create it anywhere else.
2. Paste and run these **schema-only** migrations, one full file at a time and in exactly this order:
   1. `supabase/migrations/202609250001_initial_fis_admin_schema.sql`
   2. `supabase/migrations/202609260001_expose_fis_admin_check.sql`
   3. `supabase/migrations/202609270001_fixture_change_sets.sql`

   Each must complete without an SQL error before the next starts. These are the only migration files currently in this repository. The second depends on `private.is_admin()` from the first; the third depends on the initial teams, fixtures, preferences, competition, audit and archive functions. None requires production data or inserts an administrator. The current-season import and knockout JSON are **not** part of this test. These production migrations are not marker-gated, so the Dashboard project check in step 1 is essential.
3. Under **Authentication > Users** in the disposable project, create one disposable email/password Auth user with the exact email `contact@futsalindoorsoccer.com.au` and confirm its email. The current `private.is_admin()` function requires that address, confirmed email and membership together. This is a separate test-project identity; do not copy a production Auth UUID. Copy the new user's UUID from the Dashboard. Do not put the password in a SQL file or this repository.
4. In `supabase/tests/disposable_fixture_admin_enrolment.sql`, replace the single `REPLACE_WITH_DISPOSABLE_ADMIN_USER_UUID` value in the declaration with that UUID. Leave the placeholder comparison unchanged. Paste and run the entire revised script. Expected: `disposable_admin_verified = true`, with no error. An unchanged placeholder, wrong email, unconfirmed user or existing membership raises an error and rolls the enrolment back. The script records only this disposable UUID in the private test marker for precise cleanup; it does **not** insert into `auth.users`.

## Rollback-only verification

### Schema preflight

The permanent fixture columns and workflow objects belong only to `202609270001_fixture_change_sets.sql`. The verification script does not recreate, alter or remove them. Before rerunning verification on an already migrated disposable project:

1. Paste and run the complete read-only `supabase/tests/disposable_fixture_schema_preflight.sql`.
2. Confirm every returned check, including `all_fixture_change_schema_checks_passed`, is `true`. A false value means the installed disposable schema differs from the migration; stop rather than repairing it through the verifier.
3. Paste and run the complete `supabase/verification/verify_fixture_change_sets.sql` from its first line.
4. Confirm `fixture_change_verification_passed = true` immediately before its final rollback.
5. Paste and run the complete `supabase/tests/disposable_fixture_verification_zero_check.sql`; all counts must be zero and `all_verification_counts_zero` must be true.
6. Proceed to concurrency testing only after both verification scripts pass.

The `column schedule_status already exists` error can only be raised by the fixture-change migration's permanent `ALTER TABLE`, not by the current verifier. The initial schema intentionally lacks that column and the fixture-change migration adds it once. Do not rerun the migration after it has been installed. A failed verifier remains safe because its one explicit transaction ends in rollback or is aborted by PostgreSQL; it cannot persist its test data.

### Recovery after the ambiguous `team_id` failure

If `202609270001_fixture_change_sets.sql` is already installed in `fis-fixture-test` and the rollback verifier failed with PostgreSQL `42702` for `n.team_id = team_id`, do **not** recreate the project and do not rerun any migration. The verifier began a transaction; PostgreSQL aborted it on the SQL error, and its disposable seasons, competitions, teams, fixtures and plans were rolled back. The schema migration remains installed.

1. Paste and run the complete `supabase/tests/disposable_fixture_change_patch.sql` in the marked `fis-fixture-test` project. It replaces only `private.fixture_change_report(uuid)` and makes no data changes.
2. Expected final row: `disposable_marker_recognised`, `corrected_function_exists`, and `known_ambiguous_expression_removed` are all `true`. Stop and capture the error if any value is false.
3. Run `supabase/tests/disposable_fixture_schema_preflight.sql`, then rerun the complete `supabase/verification/verify_fixture_change_sets.sql` from its first line. Do not resume from the failed statement.
4. The verifier now creates its harmless temporary bootstrap table without `ON COMMIT DROP`. The table exists only to initialise the real temporary schema used by `pg_temp.assert_true()` and remains available across Dashboard statement handling until the outer transaction reaches its final `ROLLBACK`.
5. Expected final result before rollback: `fixture_change_verification_passed = true`.
6. Run the complete `supabase/tests/disposable_fixture_verification_zero_check.sql`. Every count and `all_verification_counts_zero` must respectively be `0` and `true`. Only then continue to the two-session concurrency test.

For a fresh disposable project, or after completing the recovery steps above, paste and run all of `supabase/verification/verify_fixture_change_sets.sql`. Expected: no `Fixture verification failed` or other SQL error; it returns `fixture_change_verification_passed = true` immediately before its final `ROLLBACK`. The script creates its own 2098/2099 competition, venue, division, team, fixture and result records, then removes all of them by rollback. It tests RLS, administrator and visitor access, draft visibility, multiple items and reasons, venue-wide collisions, other venues/courts/dates, proposed-item collisions, a court swap, cancellation and slot reuse, completed/cross-night/knockout/archive/stale protections, all-or-nothing publication, audit history and published-plan immutability. It uses no production IDs.

If the verifier fails, stop. Record the complete error and statement location; do not work around it by changing the applied schema or running this script in production. The previous bootstrap failure occurred inside the verifier's explicit transaction, so it did not publish test data. After success, run the complete guarded read-only `supabase/tests/disposable_fixture_verification_zero_check.sql`; all verification-table counts must be zero and `all_verification_counts_zero` must be true. It deliberately excludes the disposable marker and enrolled disposable administrator.

## Two SQL Editor tabs

1. Paste and run `supabase/tests/fixture_concurrency_prepare.sql` once. Expected: two rows, both `pending_review`, version `3`, with warnings acknowledged; no fixture is published. This setup persists only the fixed `0000000f...` disposable IDs used by the next scripts. Do not run it twice without cleanup.
2. Open **two separate SQL Editor tabs** for the same disposable project. Load the full contents of `supabase/tests/fixture_concurrency_session_a.sql` in Tab A and `supabase/tests/fixture_concurrency_session_b.sql` in Tab B. Keep both ready. Run **Tab A first**; one or two seconds later run **Tab B**, without waiting for A's output. A publishes inside an open transaction, holds the venue-row lock for 15 seconds, then commits. B should remain running while it waits for that lock. Both plans claim Court 1, 7:00 PM, 1 June 2099 at the same physical venue, but in different divisions.
3. Expected Tab A result: `SESSION A COMMITTED`. Expected Tab B result **after A commits**: notice `EXPECTED: Session B waited, then was rejected by location-wide validation` and `SESSION B REJECTED AS EXPECTED`. B must not publish. An immediate B result, timeout, unexpected SQL error or A failure is **not** a passed concurrency test. Capture the timing and output from both tabs. The 15-second pause is only an observation window; no permanent sleep or application delay is introduced.
4. Run `supabase/tests/fixture_concurrency_verify.sql` after both tabs finish. Its final row must show `true` for **all five** booleans: A published, B still pending review, exactly one occupied slot, A has complete history, B has no partial history. Record both plan rows and the one fixture row. These are read-only queries. If any value is false, stop and report it as a failed test.

## Evidence and teardown

Verification status recorded 27 September 2026: rollback verification passed, the zero-record check passed, and the genuine simultaneous Session A/Session B test passed. Session B waited for Session A's venue lock, revalidated after Session A committed, and was rejected as expected. All five final concurrency checks returned true. Production Supabase remained unchanged.

11. Capture: project name, three migration success results, confirmed disposable Auth UUID **only in your private test notes** (not in the repo), enrolment `true`, rollback-verification success, Tab A/B output and wait observation, and the five final `true` values. Share errors without passwords or tokens.
12. After evidence is captured, run `supabase/tests/fixture_concurrency_cleanup.sql`. Expected: `DISPOSABLE CONCURRENCY RECORDS REMOVED`. It requires the marker, deletes only the fixed concurrency run's rows and their audit records, temporarily disables the immutable-history guard triggers inside its transaction, then restores them before committing. It is safely rerunnable and preserves `private.admin_users`, the disposable Auth user, `fis_fixture_test.project_marker`, and its `disposable_admin_user_id`. **Never run this cleanup in production.**
13. Keep the disposable administrator available for later regression testing. Delete or pause the entire `fis-fixture-test` project only when it is no longer needed; ordinary concurrency cleanup does not perform project teardown.

No step here connects to production Supabase or imports the current FIS season. If any query reports an error, stop at that step and preserve its output for review.
