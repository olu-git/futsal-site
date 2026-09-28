# Away-work checkpoint

## Autonomous follow-up

- Phase 1 was committed and pushed as `a45b57d83ff23e798c0105c03435a18eb75a494c`; local and remote hashes matched and the tree was clean before Phase 2 began.
- The kit picker now presents seven presets plus an eighth `+` custom-colour control, with the hex input retained. Mobile team sheets reserve 150px plus the safe-area inset below content so the sticky actions cannot cover final review rows.
- Phase 2 adds an uncommitted `/admin/standings` implementation, browser/RLS-backed loaders and mutations, signed-delta validation, projected standings, draft/immediate-publish actions, history data and published-only snapshot/public behavior tests.
- Schema audit finding: the existing table supports played, wins, draws, losses, goals for, goals against and points deltas with required reasons and draft/published visibility. The uncommitted `202609290001_transactional_standing_adjustments.sql` package now adds pending review, immutable published history, linked correction/reversal drafts, one-follow-up enforcement, versioned stale-edit rejection and atomic lifecycle RPCs.
- Added guarded disposable schema, rollback-only functional, zero-record and genuine two-session concurrency scripts; read-only production pre/postflight diagnostics; static SQL safety tests; and `docs/STANDING-ADJUSTMENTS-RPC-MIGRATION.md`. No script has been run remotely.
- Standing-adjustment disposable verification passed in full: schema preflight, functional verification, zero-record check and genuine two-session concurrency. Session A committed; Session B waited and was rejected with SQLSTATE `40001`; concurrency verification, cleanup and the final zero-record check passed.
- Production preflight recorded `teams_before = 34`, `adjustments_before = 38`, `published_adjustments_before = 38` and migration readiness true. The migration applied successfully, every postflight field returned true and no artificial production adjustment was created. This local UI follow-up did not access Supabase or mutate any adjustment.
- Rebuilt `/admin/standings` presentation with a semantic, full-width desktop table, fixed column widths, aligned shirt/team cells, row separation, selected state and a complete unclipped Adjust column. At phone widths the list reduces to POS/TEAM/action and selection opens a scroll-locked, independently scrolling full-screen sheet with focus trap/restoration and Back/Escape close.
- Removed the mobile standing editor's floating action block. Draft, review and publish actions now follow the adjustment fields, required reason and validation messages in document flow, with disabled styling and safe-area clearance before history and correction controls.
- Phase 3 low-risk navigation work links dashboard cards, adds Standings consistently and adds a non-mutating Seasons placeholder so navigation no longer points to a missing route. The Seasons/Competitions implementation plan is in `docs/SEASONS-COMPETITIONS-IMPLEMENTATION-PLAN.md`.
- No Supabase project was accessed, no SQL was run remotely, snapshot automation remains inactive, and no competition/finals/grading/knockout JSON changed during this follow-up. Phase 2 and Phase 3 remain uncommitted.
- Estimated admin-system completion: 86%. Recommended next action: review the migration and UI, then execute the exact guarded disposable sequence in `docs/STANDING-ADJUSTMENTS-RPC-MIGRATION.md`.

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
- Production preflight subsequently passed at the 34-team baseline with zero preferences and zero fixture notes. The team-profile migration was applied and every production postflight check returned true.
- A controlled Wednesday AFG save-and-restore test passed: the temporary note survived reload and was removed, all original business values were restored, the other competition's AFG record was untouched, and exactly two expected profile audit records remain. Snapshot automation stayed inactive.

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

The disposable and production team-profile verification is complete. Continue with the next reviewed admin module; do not activate snapshot automation or alter competition JSON.

Production Supabase was not accessed during this local follow-up. The previously completed migration and controlled save-and-restore are recorded above. Competition, finals, grading and knockout JSON was unchanged, and snapshot automation remains inactive.
