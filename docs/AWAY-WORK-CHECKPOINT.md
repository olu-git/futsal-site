# Away-work checkpoint

## Seasons and competitions audit

- Work started clean on `feature/new-website` at `7e91e4cb6cd1611a139bea7cd044a98027e361c5` after the approved Standing Adjustments follow-up was pushed and local/remote hashes matched.
- The active invariant is one active `competition_seasons` row per reusable competition definition, enforced by `competition_seasons_one_active_per_competition`. Different nights, locations, categories and divisions may therefore be active concurrently.
- `seasons` currently has dates but no lifecycle/version. `competition_seasons` owns lifecycle/publication, while public loaders select published editions and prefer active editions before the latest ending season. Draft rows are already excluded from anonymous competition output.
- Competition identity is unique by category, location, weekday and division. Team names are case-insensitively unique within a competition season. Archived competition seasons and their dependent teams, fixtures, results and adjustments are protected by existing triggers.
- Rollover must create new team IDs. A nullable `source_team_id` on draft rollover records is appropriate for traceability, but activated teams must reference the new competition season and copied preferences/notes must reference the new team ID.
- Existing team preference and note tables are unsafe as editable draft storage because they require a real team. Dedicated administrator-only draft tables keep unactivated teams private and make abandonment safe.
- The migration package will use season-level draft/version records plus draft competition/team/preference/note rows, then one atomic activation RPC to archive relevant active editions and materialise the new published editions and teams. Fixtures, result versions and standing adjustments are excluded.
- No Supabase project was accessed and no competition/finals/grading/knockout/fallback JSON was changed during this audit.
- Phase 2 added the uncommitted `202609300001_season_draft_management.sql` package with private RLS-protected draft tables, stale-version protection and administrator-only create/save/validate/abandon/activate RPCs. Activation is a single transaction and excludes fixtures, results and adjustments.
- Phase 3 retains the existing public selection boundary: anonymous pages read published competition seasons only, so drafts remain invisible and the checked-in fallback remains unchanged.
- Phase 4 replaced the Seasons placeholder with an authenticated five-stage browser-only workflow for season details, editable competition structure, returning-team selection, private preference/note review and activation confirmation.
- Phase 6 added disposable preflight, rollback verification, zero-record, concurrency and cleanup scripts plus read-only production pre/postflight diagnostics. These files have not been executed remotely.
- Local validation passed with 110 automated tests, ESLint, TypeScript, the static production build, finals validation, snapshot validation, season import validation/static checks and `git diff --check`. `/admin/seasons` remains statically exported.
- Handover risk: the disposable functional and concurrency SQL still needs a line-by-line review before execution. In particular, the concurrency scripts are scaffolding and do not yet create and race a complete deterministic draft activation. Preference rows are displayed and can be opted out or cleared in the UI, but per-row add/edit controls and reset-to-source controls remain unfinished. Synthetic screenshot QA has not yet been performed.
- The Seasons package is therefore uncommitted and not yet ready for disposable execution. Exact next work: complete preference editing/reset controls, replace concurrency scaffolding with a self-contained two-session activation race, expand rollback verification through activation/failure/non-admin assertions, then rerun the full local suite before asking the user to execute the disposable schema preflight.

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
# Seasons and Competitions completion checkpoint

- Disposable status update (29 September 2026): `202609300001_season_draft_management.sql` was applied successfully to `fis-fixture-test`, and `disposable_season_draft_schema_preflight.sql` returned every field as true. The functional rollback verifier, zero-record check and two-session concurrency package still await manual execution. Production remains unchanged.
- Completed synthetic `/admin/seasons` UI review at 1440, 1254, 1024, 768, 390 and 360 pixels. Every viewport stayed within the document width; no body-level horizontal overflow was found.
- UI-only corrections: added explicit Previous/Next navigation, immediate date and workflow validation, active-competition details, lifecycle badges, clearer empty states, responsive competition/team/private-profile presentation, a mobile full-screen draft dialog, body scroll locking, Escape and browser-Back dismissal, focus trapping/restoration, visible focus styling and non-overlaying action sections.
- Reviewed the main season list, multiple drafts, archived/current seasons, season details, competition structure, returning teams, preferences/private notes and activation review. Long competition/team names, long notes, empty preferences, opt-out state, copied preference strengths and activation warnings wrap without clipping.
- Remaining manual review: run the functional/zero/concurrency SQL sequence in `fis-fixture-test`, then exercise successful Supabase-backed save/validate/activate failure messages with a real disposable administrator session. No SQL or RPC file was changed during this visual-QA phase.
- Added immutable source snapshots plus complete preference/private-note add, edit, remove, clear, reset and opt-out controls.
- Added client and SQL validation for malformed times, unsupported strengths and duplicate/conflicting kick-off times.
- Replaced placeholder concurrency scripts with a deterministic same-version activation race; Session A holds the draft lock for 15 seconds and Session B must fail with SQLSTATE `40001`.
- Corrected a disposable-only concurrency harness defect found before the race: the scripts referenced nonexistent `project_marker.singleton`. All Seasons verification and concurrency administrator lookups now use the marker's real primary key, `project_name = 'fis-fixture-test'`. The failed prepare stopped inside its explicit transaction before `commit`, so it could not persist partial test data. Preparation now removes only its reserved deterministic draft/source records before recreating them and is safely rerunnable without changing the marker, Auth user or administrator membership.
- Corrected disposable rerun sequence: run `supabase/tests/season_draft_concurrency_prepare.sql`, then Session A and Session B as documented, followed by verify, cleanup and the zero-record check.
- Corrected the disposable concurrency cleanup after the installed archive guard properly rejected its attempt to change the archived source edition back to `planned`. The cleanup now follows the established disposable fixture-cleanup pattern: after asserting the marker, one transaction disables only the four relevant archived-data trigger instances, deletes the reserved hierarchy child-to-parent, restores and verifies every trigger and protection function, and then commits. The failed cleanup transaction aborted before commit, so all earlier deletions were rolled back and the concurrency records should still be present. Rerun `supabase/tests/season_draft_concurrency_cleanup.sql`, require all six returned Booleans to be true, then run `supabase/tests/disposable_season_draft_zero_check.sql`.
- Expanded the rollback-only verifier with its own fixtures, results and adjustment history, anonymous/non-admin rejection, stale validation, forced mid-activation failure, successful activation and exclusion assertions.
- Expanded schema preflight, zero-record checks, and read-only production baseline/postflight diagnostics.
- Final local checks pass: 114 automated tests, ESLint, TypeScript, static production build, finals validation, snapshot validation, current-season import validation/static check and `git diff --check`. `/admin/seasons` is present in the static export. No Supabase write occurred and the migration remains unapplied.
- Synthetic desktop rendering showed no body-level horizontal overflow. The in-app browser did not apply requested viewport overrides or dispatch the synthetic wizard step controls reliably, so 1254/1024/768/390/360 interactive screenshots remain a manual-review item. The temporary visual route and hook were removed before final checks.

## Future UI task

Perform a full-site Unbounded typography audit and establish a consistent responsive type scale for body copy, form help text, validation messages, navigation, cards, tables, modal/sheet copy, headings and subheadings. Press Start 2P should remain reserved for compact labels, headings and actions. Unbounded should use smaller, consistent sizes for supporting text and validation.

## Seasons release verification complete

- Disposable migration and schema preflight passed with every field true. Functional verification passed, its rollback zero-check returned all counts zero, and the administrator and disposable marker remained intact.
- In the genuine two-session activation race, Session A committed and Session B waited before being rejected with SQLSTATE `40001`. Every concurrency verification field passed.
- The disposable administrator lookup and archived-record cleanup harness defects were corrected without changing the production migration or application RPCs. Corrected cleanup and the final zero-check passed with every count zero, `all_verification_rows_removed`, `administrator_preserved` and `marker_preserved` all true.
- Production preflight recorded: 1 season; 2 competitions; 2 competition seasons; 2 active and public editions; 34 teams; 0 preferences; 0 notes; 326 fixtures; 326 result versions; 38 standing adjustments; 738 audit rows; and 1 administrator.
- The production migration applied successfully. Every postflight field and `all_postflight_checks_passed` returned true. No production draft was created, and business-data counts, public visibility and administrator membership remained unchanged.
- The production-applied migration remained unchanged through the later disposable and UI corrections. Checkpoint SHA-256: `CEDFCD560319F4C15479C21B7B502E903F4B754905C549480F163FEC55BB0623`.
- Desktop and mobile Seasons landing pages were reviewed. The create button remains enabled until a valid request starts; invalid submissions show field-associated inline errors and one compact alert, focus the first invalid field, and never call Supabase. The request-only loading state prevents duplicates and recovers after failure.
- Snapshot automation remains inactive. Competition, finals, grading, knockout and fallback JSON remain unchanged.

### Non-blocking future enhancements

- Return a team from any historical season rather than only the immediate source season.
- Add a brand-new team during season setup.
- Support mid-season team joining or withdrawal.
- Support mid-season replacement while preserving historical results.
- Regenerate only affected future fixtures.
- Add more flexible scheduling and round generation.

Exceptional changes will be planned and reviewed manually with Codex until those workflows are implemented.
