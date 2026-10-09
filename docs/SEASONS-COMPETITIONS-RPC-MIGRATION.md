# Seasons and competitions transactional migration

**Status:** Applied to FIS production and postflight verified without creating a draft or changing existing business-data counts. Do not rerun this migration. The diagnostic sequence below is retained for a fresh environment or reviewed investigation.


**Local extension, not deployed (10 October 2026):** `20261009224309_season_fixture_staging.sql` adds null-source new teams, confirmed profiles/venue gates, private staging, complete fixture-plan review and atomic publication at activation. The applied baseline migration and its historical verification below remain unchanged. The old activation verifier is for the six-migration baseline, not the new staging flow. See [NEW-SEASON-PREPARATION.md](NEW-SEASON-PREPARATION.md) for the new practical sequence and URL-free PGlite verification; hosted release/preflight/PostgREST and genuine concurrency verification are still required under separate authorisation.

## Model

Draft metadata, competition structure and returning-team choices live in administrator-only `season_drafts`, `season_draft_competitions` and `season_draft_teams`. Draft teams retain `source_team_id` only for traceability. Activation creates new season-specific team IDs and rewrites copied preference/note foreign keys to those IDs.

The active invariant remains one active competition season per reusable competition definition. This permits independent categories, venues, nights and divisions. Drafts are invisible to anonymous users and do not affect public loaders.

## Lifecycle

1. `create_season_draft` copies active competition structure and active team profiles.
2. `save_season_draft` replaces the complete editable structure with version checking.
3. `validate_season_draft` checks metadata, retained competitions, team names, 24-hour kick-off times, allowed strengths and duplicate/conflicting times.
4. `abandon_season_draft` safely closes an unactivated draft.
5. `activate_season_draft` locks and revalidates the draft, archives matching active editions, creates the new published editions and new teams, copies opted-in preferences/notes, and marks the draft activated in one transaction.

Fixtures, results, standing adjustments and season-specific audit history are never copied. Any activation failure rolls back the entire function call. Existing audit triggers record all materialized changes.

Each draft team stores immutable source snapshots (`source_preferences` and `source_fixture_note`) beside its editable values. This lets an administrator add, edit, remove, clear, opt out, or reset private scheduling information without touching the historical team. Activation writes only the final opted-in values and links them to the newly created team ID.

## Disposable sequence

1. Apply `202609300001_season_draft_management.sql` only to `fis-fixture-test`.
2. Run `disposable_season_draft_schema_preflight.sql`; require every field true.
3. Run `verify_season_drafts.sql`; require `season_draft_verification_passed = true`.
4. Run `disposable_season_draft_zero_check.sql`; require every count zero and cleanup true.
5. Run `season_draft_concurrency_prepare.sql`; record draft version `2`.
6. Run `season_draft_concurrency_session_a.sql` in Session A. While its 15-second sleep is active, run `season_draft_concurrency_session_b.sql` in Session B.
7. Require Session B to wait and then fail with SQLSTATE `40001` after Session A commits.
8. Run `season_draft_concurrency_verify.sql`; require every Boolean to be true.
9. Run `season_draft_concurrency_cleanup.sql`; require all six cleanup and protection Booleans to be true.
10. Rerun `disposable_season_draft_zero_check.sql`; require all counts zero and the marker/admin checks true.

The rollback verifier creates its complete hierarchy in reserved `e9xx` IDs. It proves anonymous/non-admin mutation rejection, stale-version rejection, a forced failure after season creation begins, successful activation, historical preservation, and exclusion of fixtures, results and standing adjustments. The outer `ROLLBACK` removes its trigger helper and all verification data.

Concurrency activation deliberately archives the reserved source competition season. The disposable cleanup cannot reverse that lifecycle through ordinary writes because the production archive guard correctly makes it immutable. After asserting the `fis-fixture-test` marker, cleanup transactionally disables only the archived competition-season and archived child-data triggers, deletes the reserved concurrency hierarchy child-to-parent, re-enables every guard, verifies their enabled state and original functions, then commits. Any failure rolls back both data changes and trigger-state changes. The script never changes the marker, Auth user or administrator membership and is safe to rerun.

## Production diagnostics

`season_draft_preflight.sql` is read-only and returns one baseline row covering business tables, audit rows and administrator membership. Save that row. After applying only the reviewed migration, replace every `BASELINE_*` placeholder in `season_draft_postflight.sql` with the corresponding saved integer and run it read-only. `all_postflight_checks_passed` must be true. Neither script creates a draft or changes business data.

## Completed verification

Disposable verification completed successfully: migration and schema preflight passed; functional verification passed; rollback cleanup returned zero records while preserving the administrator and marker; Session A won the genuine two-session activation race while Session B waited and was rejected with SQLSTATE `40001`; concurrency verification, corrected cleanup and the final zero-record check all passed. The administrator-lookup and archived-record cleanup defects were confined to disposable harness scripts.

Production preflight recorded 1 season, 2 competitions, 2 competition seasons, 2 active/public editions, 34 teams, 0 preferences, 0 notes, 326 fixtures, 326 result versions, 38 standing adjustments, 738 audit rows and 1 administrator. The migration applied successfully. Every postflight field, including `all_postflight_checks_passed`, returned true; no season draft was created and all existing business-data counts, public visibility and administrator membership remained unchanged.

The production-applied migration file was not edited during the subsequent disposable-harness and UI corrections. Its checkpoint SHA-256 is `CEDFCD560319F4C15479C21B7B502E903F4B754905C549480F163FEC55BB0623`.
