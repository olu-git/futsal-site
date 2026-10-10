# FIS new-season release package

Prepared 10 October 2026 on `prep/new-season-identities`, preserving e013330 and fd2c402. **No production write or external release is authorised yet.** This is the single execution sequence; the checklist tracks its gates. Stop at a failed precondition rather than bypassing it. Approved fixtures are unchanged. [Fixture review](NEW-SEASON-FIXTURE-REVIEW.md) is the package's schedule appendix, containing both Week 1 tables and every team's kickoff distribution.

## Evidence and unresolved gates

- Production `fis`, project `gaqevgjgolvndhcycxzt`, PostgreSQL 17.6, matches the repository's public project target. Read-only catalogue checks found expected baseline columns, constraints/indexes, admin policies and RPC signatures. All 32 baseline function bodies match repository migrations after whitespace/comment normalisation. The staging additions are absent. The migration-history relation is absent; do not replay six installed baselines or the 2026 S1 import.
- Hosted anonymous public team REST read succeeds; draft/profile reads return 401/42501; private-schema REST returns 406/PGRST106. An authenticated SQL role without a JWT reports admin false and no private rows. This does not prove a real non-admin JWT or FIS-admin JWT session. A management SQL connection is not website Auth.
- Hosted draft-table grants include TRUNCATE/REFERENCES/TRIGGER. The proposed staging migration now revokes these from client roles, retaining admin-gated DML. Its local verifier reproduces these grants and verifies their removal. Other existing public-table grants are outside this scoped migration; do not treat this as a whole-database privilege audit. The private validation helper's inherited EXECUTE grants are also revoked by the existing proposed migration.
- Disposable PostgreSQL verifies real session races, stale review/profile rejection, private staging, two-night failure rollback, retries and old-history preservation. Auth helpers are mocked. Previously completed Edge admin/public browser checks at mobile/tablet/desktop are reused because application code and approved assignments are unchanged. HTTP/Auth transport is mocked, not hosted end-to-end integration.
- Authenticated GitHub settings now confirm Pages source GitHub Actions, custom domain `www.futsalindoorsoccer.com.au`, successful DNS check, HTTPS enforced and latest deployed run 37992904367. Both Variables exist, production hostname matches, and configured publishable-key length/fingerprint matches the locally tested public key (values never displayed). Refresh 38012665030 succeeded with commit skipped. Actions default token permissions are read-only; the refresh commit job explicitly requests contents:write and Pages explicitly requests pages:write/id-token:write. All actions are allowed. Master-only refresh at 17/47 UTC minutes plus manual dispatch and snapshot-only commit/Pages hook are retained. Actual changed-snapshot -> commit -> Pages remains outstanding.
- Signed-in Supabase dashboard confirms production project and exposed schemas public/graphql_public, with private excluded. Establish an actual FIS-admin website read session before release: its separate login is still required. Management dashboard/SQL access does not prove website JWT access. Hosted write/concurrency tests require explicitly disposable infrastructure; `fis-fixture-test` is healthy but not assumed disposable.

## Release preconditions

Obtain one explicit release instruction covering the exact sequence below, including activation/publication and the production refresh dispatch. Freeze other admin writes for the release window. Confirm the intended display name of the new season in the wizard; no label has been invented here. Record current master SHA, latest successful Pages run, old season/edition IDs, public counts and a verified database backup/recovery point. Verify backup availability with the organiser; no automatic database rollback proposal is supplied.

Run the reviewed **read-only** SQL file `supabase/production/new-season-release-preflight.sql` in the verified production SQL Editor. Paste the complete file; it starts READ ONLY and ends ROLLBACK. It returns only schema/RPC/grant metadata and the narrow King ADL guard evidence. The existing `supabase/production/review-returning-availability.sql` supplies scoped availability checks if source data has changed. On error issue ROLLBACK; do not substitute missing results with empty preferences.

Expected baseline: no staged columns/RPCs, all six installed effects present, King ADL UUID `04ebec43-f537-52b4-bbae-ffe3449b7826`, legacy `mon-toss`, profile version 2, one exact accidental preference. Readable-ID update guards must also match all four target memberships. If any evidence differs, stop and review rather than amend a guard to force success.

## Exact database and application order

Each SQL file below is a complete transaction, run separately on the verified project **only after write authorisation**. Never concatenate alternatives or rerun a non-idempotent migration.

1. Execute `supabase/production/correct-king-adl-kickoff-preference.sql`. Expected: only the exact accidental row deleted, King ADL profile version becomes 3, audited deletion/version update, zero current preference rows. UUID, name, kit, fixtures and history unchanged. Safe repeat does not increment again; a later legitimate preference causes refusal, not deletion. Do this before any new draft copy.
2. Apply `supabase/migrations/20261009224309_season_fixture_staging.sql` through the normal reviewed migration process (or the complete SQL Editor transaction if that is the agreed deployment mechanism). Do not replay installed baselines because history is unregistered. Expected: nullable new-team source, readable ID/availability fields, staging/review-version fields, guards and new Stage/import RPCs; client table-wide privileges removed. Keep the SQL artefact hash and execution receipt. Confirm grants/RLS and PostgREST schema cache after commit; refresh schema cache only under release authorisation if necessary, not by adding broader grants.
3. Execute `supabase/production/team-readable-id-update.sql` while old editions remain active/published. Expected exact four updates: mon-toss -> mon-king-adl; wed-toss -> wed-king-adl; mon-declans-team -> mon-declans-delinquents; wed-xaywan -> wed-kuq-e-zi. UUIDs, kits and all historical relationships unchanged. Safe repeat is supported. No old Xaywan identity becomes the new Monday entry.
4. Release the matching application checkpoint through the repository's normal reviewed PR/master process. The old UI must not be used for setup during this transition: the new UI selects new columns and requires the new migration; the old workflow cannot perform the new Stage/import sequence. Keep admin writes frozen until schema and Pages smoke checks pass.

Future release commands, **not executed in preparation**:

```powershell
git fetch origin master --tags
git switch prep/new-season-identities
git status --short
git merge origin/master
npm.cmd test
npm.cmd run lint
npx.cmd tsc --noEmit --incremental false
npm.cmd run build
npm.cmd run finals:check
npm.cmd run snapshot:validate
npm.cmd run season:import:validate
npm.cmd run season:import:check
git diff --check
git push -u origin prep/new-season-identities
```

Resolve any new remote changes carefully, rerun affected checks and review the final PR diff before merging to master without force-pushing. Confirm successful Pages build/deploy, custom domain/HTTPS and admin/public smoke checks. Scheduled snapshot commits may advance master during setup; fetch/reconcile them rather than overwrite them. No workflow configuration change is required by this package.

**Excluded execution files:** `supabase/production/new-season-team-memberships.sql` is an alternative manual membership path and must NOT run with Stage. Do not execute `supabase/imports/2026-s1/current-season-import.sql`, generators that overwrite approved drafts, historical import verification that assumes unchanged IDs, or finals SQL. Finals remain JSON-owned.

## Private staging and review

1. Open `/admin/seasons/` as the verified FIS admin. Create a private draft copying 2026 Season 1 (`08dce649-66b8-5d32-9c9e-d07a180cf591`). Use the confirmed season label, season start 12 October 2026 and overall end 26 May 2027; the Monday edition's actual last fixture remains 3 May. Retain Monday/Wednesday Division A at Endeavour Hills Leisure Centre.
2. Select exactly the confirmed 14 Monday and 16 Wednesday teams. Copy the 26 returning source memberships with their UUID/history/kit links. Add fresh Monday Xaywan/Nassaji FC and Wednesday Etihad FC/Buckle City with their exact readable IDs. The wizard creates fresh UUIDs, stable after Save/Stage; local UUID reservations are not an additional SQL provisioning step. Import resolves approved fixture readable IDs against these staged memberships. Record actual new UUIDs after staging. Never reuse Ibiza, former Xaywan or another team's history.
3. Review all availability using the reconciled organiser/repository rules; empty DB profiles do not erase established restrictions. Monday King ADL has no current preference. The four new entrants currently permit all four slots. Buckle City counts normally in standings. Check confirmations, including the standing venue booking; no 56 separate date confirmations. Calendar and time rules are in the approved JSON constraints. Monday 2 November remains provisional.
4. **Save -> Validate -> Stage**. Validate persisted data only; Save invalidates earlier validation. Stage creates private planned/draft editions and memberships, preserving the old active season. Structure/profiles freeze after Stage; there is no supported staged discard/restructure path. A new constraint before activation is a stop/recovery decision, not permission to edit DB rows manually.
5. Import complete `docs/drafts/monday-rounds.json` and `docs/drafts/wednesday-rounds.json` in the Seasons workflow, selecting the matching planned competition. Do not use a generic fixture-upload format or regenerate assignments. Expected private reviewed totals: 182 Monday + 240 Wednesday. In Fixtures inspect both plans, validate, save edits before review submission, acknowledge warnings and submit. Planned ordinary Publish remains disabled and rejected.
6. Return to Seasons and Validate again. This binds exact fixture review versions and current source profiles. Any later source/fixture edit requires renewed review/validation. Confirm both plans remain complete, private and conflict-free. Public pages still show the previous published season.

## Activation and publication

Only within explicit release authority, enter **ACTIVATE** once. The transaction publishes both new fixture plans/editions, archives corresponding old editions, and preserves old teams/results/adjustments/UUID relationships and JSON finals. Activation is the first public exposure; do not separately Publish planned fixtures.

Read back 30 new memberships, 422 regular-season fixtures, both active/published editions, old archived/published editions, no new results and unchanged historical scores/kits. Public Home/Monday/Wednesday must select the new season, show 14/16-team tables and five unknown form badges, and retain labelled 2026 S1 finals. Existing public archived regular-season selection is unsupported; archive preservation is verified through admin/read-only records rather than claiming a new public history selector.

If the request times out, reload/read status before retrying. A committed activation must not be performed again; a rolled-back failure leaves the old season active and no partial published new night. Stale errors require reload and review, never forced version numbers.

## Snapshot and Pages verification

Follow the exact nine-step procedure in [release checklist](NEW-SEASON-RELEASE-CHECKLIST.md#exact-future-snapshot-to-pages-and-forced-fallback-verification). After naturally changed published data, authorised master refresh or the 17/47 schedule must validate and create a snapshot-only commit. Record resulting commit SHA, then successful downstream Pages run/checkout SHA containing it. A no-change run verifies reconciliation only; a skipped Pages run is not this chain test. Failures preserve the previous committed fallback.

Fetch static Home/Monday/Wednesday before hydration and inspect expected new-season markers. In a clean browser block the production Supabase hostname and hard reload, require the fallback notice, verify rosters/fixtures/tables/form/old finals, then unblock and compare live data. Record run IDs/SHAs and CDN cache evidence. The snapshot is bundled, not necessarily served as a standalone JSON endpoint. Do not manufacture production results to exercise this test.

## Recovery and rollback limits

- Before activation: halt on any error. Failed SQL transactions roll back automatically; issue ROLLBACK after an SQL Editor error. Do not assume already committed correction/ID updates are reversed by Git. Safe-repeat proposals remain guarded. Do not rerun the staging migration once installed.
- If application release fails before activation, leave the old season active and restore a reviewed compatible application commit through the normal PR/master process. An installed additive migration may remain; do not drop it or restore the old accidental preference automatically.
- After activation: halt new admin writes on a critical failure. Preserve error/run evidence. Website rollback does **not** reactivate the old season, retract published DB fixtures or undo archived protection. Any DB recovery needs separately reviewed/write-authorised forward recovery or verified backup restoration, considering later results; no blanket inverse SQL is prepared.
- Preserve permanent tag object `fb38fa8b38f941a99b0eba8c05e57394efd4e5f2`, resolved commit `3780f29743c4e3b0ce238d63c9cce875fea09f3a`. Follow [NEW-WEBSITE-ROLLBACK.md](NEW-WEBSITE-ROLLBACK.md) exactly: create a rollback branch from then-current master, restore tag tree, review/commit/PR/merge without force-push, verify Pages/domain/routes/assets. Check current DB compatibility first. Never move the tag or change DNS.

## Schedule appendix and cancellation decision

[Complete Week 1 tables and all 30 kickoff distributions](NEW-SEASON-FIXTURE-REVIEW.md) form part of this package. Monday: 12 October 2026 -> 3 May 2027, 26 rounds/182 games, 26/team, 13/13; Wednesday: 14 October -> 26 May 2027, 30 rounds/240 games, 30/team, 15/15. Maximum streak three on each night; minimum repeat gaps five/15 rounds. All approved hard rules pass. Wednesday Ghazni's rounds 9/24 at 21:00 against Umoja are the two unavoidable soft exceptions; Ibiza stays at preferred late times. No finals dates.

### Monday Week 1 - 12 October 2026

| Time | Court | Home | Away |
|---|---:|---|---|
| 19:00 | 1 | Nassaji FC | Wildcats |
| 19:00 | 2 | Xaywan | Hope |
| 19:40 | 1 | Blue Dragons | AFG |
| 19:40 | 2 | Bunyip | Declan's Delinquents |
| 20:20 | 1 | Hunger FC | Salvos |
| 20:20 | 2 | Ghazni United | King ADL |
| 21:00 | 1 | Goldlink Up | Misfits |

### Wednesday Week 1 - 14 October 2026

| Time | Court | Home | Away |
|---|---:|---|---|
| 19:00 | 1 | Misfits | Kuq E Zi |
| 19:00 | 2 | AFG | Buckle City |
| 19:40 | 1 | Etihad FC | Goldlink Up |
| 19:40 | 2 | MTS FC | Ghazni United |
| 20:20 | 1 | Ibiza | Rinnai |
| 20:20 | 2 | Unathletico | King ADL |
| 21:00 | 1 | Pops | Umoja Stars |
| 21:00 | 2 | Hazara United | Wildcats |

If 2 November is cancelled, re-date subsequent Monday rounds to available Mondays, preserving approved opponents/times/courts/orientations and exclusions, and revalidate/review before activation. Monday ends 10 May; Wednesday unchanged. Do not apply that scenario unless cancellation is confirmed.

**Next external step:** resolve authenticated read-session/configuration gates, obtain one explicit release authorisation for this package, then execute the exact guarded King ADL correction first. That first write removes one accidental private preference and advances one profile version; it does not create or activate a season.
