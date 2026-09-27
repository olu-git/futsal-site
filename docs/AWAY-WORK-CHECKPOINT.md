# Away-work checkpoint

- Starting branch: `feature/new-website`
- Starting commit: `6e60eeb1d733bd100410c01868f5a80518ec6184`
- Work remains uncommitted for review.

## Completed

- Added the statically exported `/admin/teams` route behind the existing browser-side administrator guard.
- Added Supabase-backed loading for the latest published Monday and Wednesday competition seasons, teams, kit colours, structured kick-off preferences, private fixture notes and history indicators.
- Added night, division, status and name filters with deterministic team ordering and clear loading, empty, unavailable-schema and retry states.
- Added team profile editing for name, explicit status, competition-season assignment, kit colour presets/custom values, structured kick-off preferences and private fixture notes.
- Added validation for names, kit colours, preference times, duplicate/conflicting preferences and unsafe competition-season reassignment.
- Added original/proposed comparisons and confirmation for consequential status, name and assignment changes.
- Reconfirmed the authenticated administrator session and `public.is_fis_admin()` before every save. All data operations continue through the browser Supabase client and existing RLS; no secret or service-role key is used.
- Added a responsive full-screen phone editor with dialog semantics, focus trapping/restoration, Escape and browser-Back close behaviour, background scroll locking, safe-area padding and sticky actions.
- Added focused synthetic tests for filtering, Monday/Wednesday separation, sorting, validation, consequential changes, historical-team move protection, note removal, setup-unavailable handling and browser-only authenticated mutations.
- Completed local visual review using a temporary synthetic-data route. The route was removed before final verification and is not part of the source or final export.
- Reviewed 1440px, 1024px, 768px, 390px and 360px layouts. No horizontal page overflow was found. Verified the desktop editor, mobile sheet, mobile admin menu, Escape close, background lock and focus restoration.
- Added `profile_version` and one transactional `public.save_team_profile(...)` RPC. It locks the team, rejects stale edits, validates the complete intended profile, replaces preferences, creates/updates/removes the private note, records a profile-level reason in the audit log and rolls back every write on failure.
- Refactored Admin Teams to make one RPC call after reconfirming the administrator. Consequential name, status or competition changes now require an administrative reason.
- Added guarded disposable preflight, rollback-only functional verification, zero-record verification, two-session concurrency scripts, read-only production pre/postflight diagnostics and a focused migration runbook.
- The fixture-change production migration was applied separately and its production postflight returned all true: 326 fixtures unchanged, 326 published results unchanged, public fixture visibility intact and zero fixture change sets created.
- The first disposable team-profile functional run stopped at `a writable competition season is required`. The database was correctly empty; the verifier incorrectly depended on arbitrary pre-existing competition data. The verifier now creates a deterministic, reserved hierarchy inside its single rollback transaction. The committed concurrency setup now creates and explicitly cleans up its own separate hierarchy as well.
- Disposable testing then exposed PostgreSQL `42702` in `ON CONFLICT (team_id)`: the RPC's `RETURNS TABLE` output named `team_id` collided with the conflict-inference column. The migration now targets the named `team_fixture_notes_pkey` constraint, and a guarded disposable function-only patch preserves its signature, owner, grants, `SECURITY DEFINER` and safe `search_path`. Production never received this team-profile migration.
- The complete corrected package passed in `fis-fixture-test`: schema preflight all true; RPC ambiguity patch all nine checks true; functional verifier true; functional and final zero-record checks all zero/true; and concurrency preparation began at `profile_version = 1`.
- In the simultaneous concurrency test, Session A committed, Session B waited and was rejected with SQLSTATE `40001` (`Stale team profile: changed since the editor loaded it`). Verification returned `one_save_committed = true`, `session_a_won = true` and `one_profile_audit = true`; cleanup returned all true while preserving the disposable marker, Auth user and administrator membership.

## Files changed

- `src/app/admin/teams/page.tsx`
- `src/app/admin/teams/TeamsManager.tsx`
- `src/lib/admin/teams.ts`
- `src/lib/admin/teams-data.ts`
- `src/lib/admin/teams-actions.ts`
- `src/app/globals.css`
- `tests/admin-teams.test.ts`
- `tests/disposable-fixture-package.test.ts`
- `supabase/migrations/202609280001_transactional_team_profile_save.sql`
- `supabase/verification/verify_team_profile_save.sql`
- `supabase/tests/disposable_team_profile_schema_preflight.sql`
- `supabase/tests/disposable_team_profile_zero_check.sql`
- `supabase/tests/team_profile_concurrency_prepare.sql`
- `supabase/tests/team_profile_concurrency_session_a.sql`
- `supabase/tests/team_profile_concurrency_session_b.sql`
- `supabase/tests/team_profile_concurrency_verify.sql`
- `supabase/tests/team_profile_concurrency_cleanup.sql`
- `supabase/production/team_profile_save_preflight.sql`
- `supabase/production/team_profile_save_postflight.sql`
- `docs/TEAM-PROFILE-RPC-MIGRATION.md`
- `docs/AWAY-WORK-CHECKPOINT.md`

## Schema findings and limitations

- The current schema supports explicit team status, standings eligibility, kit colours, one private fixture note and structured required/preferred/avoid kick-off times.
- Existing fixtures and standing adjustments bind a team to its competition season. Moving a team with history would require coordinated historical changes, so the interface locks competition-season assignment for historical teams. History-free teams may be reassigned.
- The previous non-atomic browser-write limitation is resolved by the new RPC migration. The migration remains unapplied and Admin Teams will show its setup-unavailable state until it is reviewed, applied and verified.
- Teams cannot be deleted from this screen. Standings eligibility remains stored and displayed through existing competition data but is not editable here.
- No live authenticated mutation was submitted during implementation or review.

## Verification

- All 90 automated tests passed after the self-contained verifier and ambiguous conflict-target corrections.
- ESLint, TypeScript and the final production static build passed.
- Finals, snapshot, season source and generated-import checks passed.
- The build exported `/`, `/monday-night`, `/wednesday-night`, `/admin`, `/admin/login`, `/admin/results`, `/admin/fixtures` and `/admin/teams`.
- The temporary `/admin/teams-visual-test` route was removed and is absent from the final export.
- `git diff --check` passed with only the repository's existing LF-to-CRLF working-copy notices.
- `.env.local` remains ignored. The changed-file credential scan found no credential values.

## Exact next action

The disposable package is fully verified. Before any future production application, follow the separate read-only preflight, reviewed migration and read-only postflight sequence in `docs/TEAM-PROFILE-RPC-MIGRATION.md`. The team-profile migration is not marked as applied to production.

Supabase was not accessed or mutated during this task. The new migration was not applied. Competition, finals, grading and knockout JSON was unchanged. Nothing was committed, pushed, merged or deployed.
