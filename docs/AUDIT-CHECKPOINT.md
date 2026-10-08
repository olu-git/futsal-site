# Website audit — 9 October 2026

Branch: `audit/site-reliability-2026-10-09`, based on current master `84ec5f0`. The initial tree was clean. No production writes, real enquiries, workflow dispatches, pushes or deployments are authorised for this audit.

## Confirmed findings and fixes

- **High — snapshot refresh validation skipped:** `.github/workflows/refresh-public-snapshot.yml` referenced `steps.snapshot.outputs.changed` before the detection step ran. A changed snapshot would skip its freshness comparison and tests. Moved detection ahead of those conditions; added an ordering regression test. The ordering regression rejects the original workflow and passes with the fix; final checks are recorded below.
- **Medium — wrong registration success after switching tabs:** submit Team with a delayed mocked response, switch to Player, then wait. The Player form was replaced by “Registration submitted” although only Team was sent. `EnquiryForm.tsx` now ignores responses after that form unmounts. The original browser failure was reproduced; final-export checks pass for Team-to-Player switching and mobile dialog close/reopen.

## Verified service state

- Pages run `37789589508` succeeded for `84ec5f0`; deployment `6937723343` references the same commit.
- Scheduled refresh `37765142056` succeeded on 8 October. Job details confirm generation/validation and production-configuration checks passed; artifact transfer and commit were skipped (no change). Its following Pages run was skipped. A changed snapshot → commit → Pages path remains unverified.
- GitHub Actions Variables API returns **401 Requires authentication**. Workflow configuration checks production targeting without printing credentials; direct variable inspection remains blocked.
- Supabase production `fis` is `ACTIVE_HEALTHY`; `fis-fixture-test` is `INACTIVE`. Use local mocks for writes; do not resume or mutate either service.

## Initial audit scope (completed coverage below)

Public route/asset crawl and responsive browser review; all forms with mocked submissions; competition/source checks; unavailable/empty/loading fallback scenarios; admin access and mocked write behaviour; FIS TV controls; final release checks and rechecks of fixes.

Workflow batch: all six targeted refresh tests and production build passed. All ten live public routes returned HTTP 200, FIS TV redirects to its trailing slash, and an unknown URL returned 404. Mobile 390px route checks found no page overflow, missing loaded images or unlabelled form fields.

The annotated rollback tag object remains `fb38fa8b38f941a99b0eba8c05e57394efd4e5f2`; its resolved commit is `3780f29743c4e3b0ce238d63c9cce875fea09f3a`. The rollback runbook correctly records the resolved commit. Historical claims in the project handoff are superseded only by verified findings here.

## Completed audit and additional fixes

- **Medium - unbounded administrator access checks:** an indefinitely pending mocked `is_fis_admin` response left the original guard on Checking access. Session/access checks now time out, report Admin unavailable and offer retry. Login checks and sign-out are also bounded; access-service errors produce connection guidance. Denied accounts retain the Access denied explanation after automatic sign-out. Mocked unauthenticated, denied, RPC error, timeout and authorised routes were verified; no real login was performed.
- **Medium - missing divisions and inconsistent season selection:** Results and Fixtures selected only one edition per weekday, omitting Division B. Teams could prefer a later-dated archived edition over an active one. The shared selector retains each Monday/Wednesday division and prefers active editions, matching public selection. Fixtures and Standing Adjustments expose division selection; changing nights cannot show the other night's edition. Standing Adjustments previously exposed only its first division. Mocked A/B fixtures, results, teams and adjustments now select the correct current records; archived later-date records do not replace active Results/Fixtures/Teams. Unit tests cover both divisions, active priority, joined relations and empty input.
- **Medium - fixture draft fields lost:** Update -> Cancel -> Update removed the proposal and made its fields inaccessible. The editor now retains the edited proposal locally while omitting it from a cancellation payload; an existing cancellation can recover its original schedule. Browser reproduction and recheck confirmed an edited court survives the transition. A mocked rejected save preserved the draft and re-enabled Save Draft.
- **Low - empty data and inaccurate refresh copy:** Home and both night pages now explain empty standings. Standing Adjustments explains empty data rather than displaying only table headings. Fixtures and adjustments no longer say snapshot automation is inactive; they accurately describe the separate twice-hourly refresh without claiming a queued/completed refresh.

Public coverage retained from the interrupted session: all ten public routes returned 200, FIS TV's slash redirect worked, and an unknown route returned 404. All ten routes were reviewed at actual 390, 768 and 1440px viewports with no page overflow. Titles, descriptions, one H1 per public route, linked assets/fonts, navigation and labelled controls were checked. The original exported public content matched live Pages content. These completed route checks were not repeated unnecessarily.

Resumed browser coverage used the current production export through a temporary local mock server:

- Empty Home/Monday/Wednesday states, empty Results/Fixtures/Teams/Standings/Seasons workspaces, and an unavailable Results workspace. A never-resolving public read retains the JSON fallback after eight seconds with a source notice; isolated public-data tests also cover failed/timed-out reads and malformed/invalid data. No competition JSON changed.
- Registration: the original delayed Team response incorrectly confirmed Player; the fixed export keeps Player open. At 390px, close/reopen while Team is pending leaves the reopened Team form intact. Escape restores Register focus and clears scroll lock. Successful mocked Player/Future submissions focus the confirmation heading; Future requires a preferred night before any request. Contact validation, rejected service response, malformed response, timeout and success handling were checked. Failure preserves entered details and allows retry. Requests were intercepted locally; no enquiry was sent.
- Administration: empty screens remain navigable; fixture creation/upload is disabled without an edition. The missing-division scenarios were checked on desktop and at 390px. Rejected fixture-draft and standing-adjustment writes show a recoverable error and preserve the edited values. Invalid login was mocked. New-season required-field validation was checked; no activation or production mutation was attempted.
- FIS TV: zero embedded players before a click; both correct privacy-enhanced YouTube embeds load with `autoplay=0`. Both replay videos were observed playing after manual Play, with readyState 4 and more than 16 seconds elapsed. Five gallery links point to genuine JPEG files. Lightbox next/previous, End, keyboard wraparound, Tab/Shift+Tab focus containment, Escape, return focus and scroll-lock cleanup passed. The open mobile viewer fits 390x844 without overflow. Photos, replay content and approved branding were unchanged.

## Regression and final validation

- The workflow ordering assertion rejects the original audit-base workflow (`84ec5f0`) and passes the reviewed version. Conditional freshness comparison/tests now run only after change detection; unchanged runs still skip expensive checks and artifact/commit jobs.
- An isolated execution of the original form submission handler called its success callback after unmount; the fixed handler suppressed it. Maintained asynchronous response tests cover delayed success, pending response bodies, stale failures, timeout/setup errors, malformed JSON, unsuccessful responses and the replacement form's own successful request. A component wiring check verifies the unmount guard is connected to that tested handler.
- The actual snapshot-generation script was run against mocked failed reads and invalid published data in isolated temporary directories. Both executions failed with the expected diagnostic and preserved the previous snapshot byte-for-byte, without leaving temporary snapshot files. They made no network request or production change.
- Final checks passed: **153 tests**, ESLint, TypeScript (`--noEmit --incremental false`), production static build, finals validation, snapshot validation, anonymous `snapshot:check`, season-import validation/check and `git diff --check`. Local public configuration targets production and has a publishable key; only boolean verification was displayed. The checked-in fallback matches anonymous Supabase data.

## Reviewed file inventory

At resumption there were **16 repository files**, plus the temporary browser harness outside the repository, rather than 17 repository changes. Follow-up regression coverage and confirmed fixes bring the final repository inventory to **21 files**: 14 operational/application files, six test files and this checkpoint. At audit completion nothing was staged.

| Category | Files | Purpose |
| --- | --- | --- |
| Workflow fix | `.github/workflows/refresh-public-snapshot.yml` | Detect changes before conditional freshness/tests. |
| Registration fix | `src/components/EnquiryForm.tsx`, `src/lib/enquiry-response.ts` | Ignore closed/replaced form responses; preserve active success/error handling. |
| Public empty states | `src/components/HomeContent.tsx`, `src/components/CompetitionContent.tsx` | Explain empty standings. |
| Admin access | `src/components/admin/AdminAuthGuard.tsx`, `src/app/admin/login/LoginForm.tsx`, `src/lib/admin/auth.ts` | Bounded checks, errors and denied-state handling. |
| Admin edition loading | `src/lib/admin/competition-editions.ts`, `src/lib/admin/fixtures-data.ts`, `src/lib/admin/results-data.ts`, `src/lib/admin/teams-data.ts` | All divisions and active-season priority. |
| Admin managers | `src/app/admin/fixtures/FixturesManager.tsx`, `src/app/admin/standings/StandingsManager.tsx` | Division access, draft recovery, empty state and accurate scheduled-refresh copy. |
| Regression tests | `tests/snapshot-refresh.test.ts`, `tests/enquiry-response.test.ts`, `tests/registration-success.test.ts`, `tests/admin-auth.test.ts`, `tests/admin-editions.test.ts`, `tests/admin-standings.test.ts` | Workflow/failure preservation, form lifetime, auth, editions and actual standings rendering. |
| Intentional audit documentation | `docs/AUDIT-CHECKPOINT.md` | Findings, validation, inventory and limitations. |
| Temporary; excluded from release | `%TEMP%/fis-audit-preview.mjs` and its logs | Local-only mocked browser responses and write rejection. Not in Git status; no application route, dependency or harness file was added to the release. |

Removed unnecessary manual memoization from the affected fixture/standings filtering after selection changes. Existing application work was retained; no dependency, generated competition asset, migration, credential or build output is part of this diff.

## Limitations and release readiness

- Direct GitHub Actions Variables verification remains blocked by **401 Requires authentication**. Previous successful production-target checks in Actions are indirect evidence; they do not expose or independently verify current variable values.
- No natural changed-snapshot -> snapshot-only commit -> Pages deployment has been observed. The earlier successful no-change refresh verifies reconciliation only. This audit did not dispatch a workflow, push, deploy or manufacture production changes. Verify this chain after a genuine published-data change and an authorised release.
- Real administrative writes, activation/rollback/concurrency and email delivery were deliberately not exercised. Admin database/RPC unit tests and local mocked failures are not proof of a production write. The browser's synthetic fill/keyboard controls did not commit the controlled season date fields to React state, so a valid new-season browser submission was not exercised; required-field validation and existing season tests passed. This is a browser-test limitation, not a confirmed date-control bug.
- Responsive checks use Chromium viewport emulation. Physical-device touch/swipe and independent Safari/Firefox verification remain outstanding.
- Read-only Supabase security review found leaked-password protection disabled (a project configuration decision). Ordinary reviewed mutation RPCs were authenticated-only with private admin checks. The advisor's `rls_auto_enable` warning refers to an event trigger, not a confirmed anonymously callable application RPC. No grants, policies or Auth settings were changed.

At audit completion, before release review, local release checks passed and HEAD was `84ec5f0` on `audit/site-reliability-2026-10-09`; all audit changes were uncommitted and unpushed. Protected prior commits and the permanent rollback tag remain intact. The detached hotfix worktree was not altered. No merge or deployment was performed.

## Local release review - 9 October 2026

- Fetched origin: `origin/master` remains `84ec5f00f9b7bcae990646e016a6a0ae99fb97fa`, the audit base. No upstream integration was necessary. All 21 files were reviewed against that base; the unrelated worktree and protected commits were preserved.
- Authentication timeouts bound the UI wait, not the underlying network operation. Late promise resolution cannot complete an already timed-out check; access remains protected by the existing server grants/RLS/RPC checks. The denied state stays blocked even if automatic sign-out fails. Removed its claim that sign-out had already succeeded, because the async request may still be pending or fail.
- Edition selection preserves every supported weekday/division, gives active editions priority, and uses the newest available non-active edition only when no active edition exists for that pair. Published-only filtering remains in each loader. Fixture/standing division changes close the previous editor. No database ownership or mutation rules changed.
- Cancellation still excludes the proposed schedule from its payload; restoring Update recovers the locally edited proposal or the original fixture schedule. Closed registration instances suppress success and error callbacks, while the active form retains normal validation, submission timeout, success and retry behaviour.
- Snapshot detection now precedes freshness/tests without changing schedule, manual dispatch, master restriction, job permissions, snapshot-only commit guards or source-SHA protection. Isolated script tests verify failed reads/invalid data leave the previous fallback intact.
- Rollback verification: `git cat-file -t pre-new-website-2026-09-30` returns `tag`; `git rev-parse pre-new-website-2026-09-30` returns tag object `fb38fa8b38f941a99b0eba8c05e57394efd4e5f2`; peeling with `^{}` resolves commit `3780f29743c4e3b0ce238d63c9cce875fea09f3a`. This exactly matches [NEW-WEBSITE-ROLLBACK.md](NEW-WEBSITE-ROLLBACK.md). Neither reference was changed.
- Temporary browser harness/logs, credentials, ignored environment files, `out/`, `.next/`, competition JSON, public media, dependencies and Supabase SQL are excluded. The small response/edition helpers and maintained regression tests are intentional release files; this checkpoint is intentional documentation.
- Release-review validation passed: all 153 tests, lint, TypeScript (`--noEmit --incremental false`), production build and `git diff --check`. The completed finals, import, snapshot and browser checks above are retained for unchanged files. Service observations above are dated audit evidence, not newly inspected remote service state during release review.
- **GO for local release review.** There is no newly identified code blocker after the correction. Production operational verification is incomplete: direct GitHub Variables authentication and the natural changed-snapshot-to-Pages chain remain outstanding. No real writes, workflow dispatch, merge, push or deployment is authorised by this checkpoint. The reviewed changes are intended for one local audit-branch commit; consult Git for its resulting hash.
