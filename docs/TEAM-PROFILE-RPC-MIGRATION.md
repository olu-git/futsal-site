# Transactional team-profile migration

This runbook applies `supabase/migrations/202609280001_transactional_team_profile_save.sql`. It does not import or alter competition, finals, grading or knockout JSON.

## Disposable verification

1. Confirm the selected project is the guarded disposable `fis-fixture-test` project.
2. Apply the reviewed migration once.
3. Run `supabase/tests/disposable_team_profile_schema_preflight.sql`; require every value and `all_team_profile_schema_checks_passed` to be true.
4. Run `supabase/verification/verify_team_profile_save.sql`; require `team_profile_verification_passed = true`. The verifier creates its own deterministic season, category, location, source/destination competitions, competition seasons, teams, preference and note. It does not require imported or fixture-verification data, and its final rollback removes the complete hierarchy.
5. Run `supabase/tests/disposable_team_profile_zero_check.sql`; require all counts to be zero.
6. Follow `supabase/tests/team_profile_concurrency_prepare.sql`, Session A, Session B, verify and cleanup in order. Preparation creates a separate deterministic committed hierarchy because two sessions must share it. Session B must wait and then fail stale after Session A commits; cleanup removes that hierarchy while preserving the marker, Auth user and administrator membership.

### Recovery after the ambiguous `team_id` failure

If the migration is already installed only in `fis-fixture-test` and the functional verifier failed at `ON CONFLICT (team_id)`, do not rerun the migration. `RETURNS TABLE` introduced an output variable named `team_id`, making that conflict-inference identifier ambiguous inside PL/pgSQL. The failed verifier transaction did not retain its deterministic test hierarchy.

1. Run the complete guarded `supabase/tests/disposable_team_profile_rpc_patch.sql` once. It replaces only the installed function body, uses the named `team_fixture_notes_pkey` constraint, and verifies that signature, owner, grants, `SECURITY DEFINER` and safe `search_path` remain intact.
2. Require every returned Boolean to be `true`, including `known_ambiguous_expression_removed` and `named_constraint_installed`.
3. Rerun the complete `supabase/verification/verify_team_profile_save.sql` from its first line; require `team_profile_verification_passed = true`.
4. Run `supabase/tests/disposable_team_profile_zero_check.sql`; require all counts to be zero and the final Boolean to be true.
5. Only then proceed to the two-session concurrency sequence.

When the ambiguity was found, production had not received the team-profile migration or the defect. The corrected named-constraint version was subsequently applied and verified in production, as recorded below. Do not rerun it.

### Completed disposable results

The complete package was verified successfully in `fis-fixture-test`:

- The schema preflight returned all checks true.
- The guarded RPC ambiguity patch returned all nine checks true.
- The functional verifier returned `team_profile_verification_passed = true`.
- The functional zero-record check returned all counts zero and all checks true.
- Concurrency preparation created the reserved test profile at `profile_version = 1`.
- Session A committed successfully. Session B waited for Session A, revalidated the locked row and was rejected with SQLSTATE `40001`: `Stale team profile: changed since the editor loaded it`.
- Concurrency verification returned `one_save_committed = true`, `session_a_won = true` and `one_profile_audit = true`.
- Concurrency cleanup returned all checks true, and the final zero-record check returned all counts zero and all checks true.
- The disposable marker, disposable Auth user and administrator membership remained intact.

These results verified the disposable installation before production application.

## Completed production verification

- The read-only production preflight passed with the expected baseline of 34 teams, zero kick-off preferences and zero fixture notes.
- The reviewed migration was applied successfully and every production postflight check returned true.
- A controlled save-and-restore test used the Wednesday AFG profile. A temporary private note survived reload and was then removed, restoring the original business state: name `AFG`, active status, kit colour `#2F80ED`, zero preferences and no fixture note.
- The tested profile advanced from `profile_version = 1` to `3`, leaving exactly two expected `team_profile` audit records. The separate AFG profile in the other competition remained at version 1 and was untouched.
- Snapshot automation remained inactive throughout this verification.

## Production application

1. Confirm the selected project is production by visible project name and URL.
2. Run the complete read-only `supabase/production/team_profile_save_preflight.sql` and save all three counts. Stop unless `team_profile_migration_ready` is true.
3. Apply the exact reviewed migration once. Do not rerun it blindly after an error.
4. Put the saved counts into the three `NULL` placeholders in `supabase/production/team_profile_save_postflight.sql`.
5. Run the complete read-only postflight and require every value and `team_profile_migration_verified` to be true.
6. Test `/admin/teams` with a reviewed non-consequential profile edit, then confirm its audit rows. Do not test against archived data.

If any execution fails, retain the full error and stop. Determine whether PostgreSQL rolled back before preparing a reviewed forward repair; do not drop production objects. The RPC locks the team row and checks `profile_version`, so a later editor receives a stale-edit error rather than overwriting a committed profile.
