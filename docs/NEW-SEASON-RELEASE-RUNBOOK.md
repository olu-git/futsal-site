# FIS new-season release package

Prepared 10 October 2026 on `prep/new-season-identities`, preserving e013330 and fd2c402. **No production write or external release is authorised yet.** This is the single execution sequence; the checklist tracks its gates. Stop at a failed precondition rather than bypassing it. Approved fixtures are unchanged. [Fixture review](NEW-SEASON-FIXTURE-REVIEW.md) is the package's schedule appendix, containing both Week 1 tables and every team's kickoff distribution.

## Evidence and unresolved gates

- Production `fis`, project `gaqevgjgolvndhcycxzt`, PostgreSQL 17.6, matches the repository's public project target. Read-only catalogue checks found expected baseline columns, constraints/indexes, admin policies and RPC signatures. All 32 baseline function bodies match repository migrations after whitespace/comment normalisation. The staging additions are absent. The migration-history relation is absent; do not replay six installed baselines or the 2026 S1 import.
- Hosted anonymous public team REST read succeeds; draft/profile reads return 401/42501; private-schema REST returns 406/PGRST106. An authenticated SQL role without a JWT reports admin false and no private rows. On 10 October the actual signed-in website session passed the `is_fis_admin()` route guard and loaded both nights' private team profiles, Seasons and Fixtures workspaces. Monday King ADL's 19:00 preferred field remains present and untouched. Seasons and fixture change sets are empty, consistent with the read-only SQL evidence. This verifies installed baseline private reads, not uninstalled Stage/import resources or a real non-admin JWT.
- Hosted draft-table grants include TRUNCATE/REFERENCES/TRIGGER. The proposed staging migration now revokes these from client roles, retaining admin-gated DML. Its local verifier reproduces these grants and verifies their removal. Other existing public-table grants are outside this scoped migration; do not treat this as a whole-database privilege audit. The private validation helper's inherited EXECUTE grants are also revoked by the existing proposed migration.
- Disposable PostgreSQL verifies real session races, stale review/profile rejection, private staging, two-night failure rollback, retries and old-history preservation. Auth helpers are mocked. Previously completed Edge admin/public browser checks at mobile/tablet/desktop are reused because application code and approved assignments are unchanged. HTTP/Auth transport is mocked, not hosted end-to-end integration.
- Authenticated GitHub settings now confirm Pages source GitHub Actions, custom domain `www.futsalindoorsoccer.com.au`, successful DNS check, HTTPS enforced and latest deployed run 37992904367. Both Variables exist, production hostname matches, and configured publishable-key length/fingerprint matches the locally tested public key (values never displayed). Refresh 38012665030 succeeded with commit skipped. Actions default token permissions are read-only; the refresh commit job explicitly requests contents:write and Pages explicitly requests pages:write/id-token:write. All actions are allowed. Master-only refresh at 17/47 UTC minutes plus manual dispatch and snapshot-only commit/Pages hook are retained. Actual changed-snapshot -> commit -> Pages remains outstanding.
- Signed-in Supabase dashboard confirms production project and exposed schemas public/graphql_public, with private excluded. Actual FIS-admin website reads are now verified separately. An independent unsigned browser is denied the Seasons workspace. A READ ONLY/ROLLBACK aggregate finds one admin account and zero confirmed non-admin accounts; no suitable existing non-admin test account is available. Real non-admin/expired JWT checks remain unverified. Hosted write/concurrency tests require explicitly disposable infrastructure; `fis-fixture-test` is healthy but not assumed disposable. Completed local races/RLS/rollback tests support a controlled release; after migration, verify new-resource reads and grants before setup, and stop at any failed gate.

## Release preconditions

Release authority must distinguish application deployment/private staging from public activation and refresh dispatch. Approval for deployment/staging alone does not authorise activation. Freeze other admin writes for the release window. Use the organiser-approved season name below. Record current master SHA, latest successful Pages run, old season/edition IDs, public counts and the verified logical backup described below. No automatic database rollback proposal is supplied.

### Approved season display name and creation inputs

The read-only production query on 10 October returns one season: **2026 Season 1**, 23 March to 7 October 2026. This is the observed year-plus-season-number convention, not evidence of a historical cross-year naming rule. The wizard accepts a supplied non-empty name; validation rejects duplicate names without deriving the year from the dates.

The organiser approved exactly **Season 2 2026** on 10 October 2026 for both Monday and Wednesday. This supersedes the previous cross-year-name proposal. Keep the approved dates across 2026/2027 despite the chosen display label. Both editions share the season name; retain competition names Monday Night and Wednesday Night, Division A. No production season has been created or renamed.

Prepared wizard inputs (documentation only; not an executed RPC):

| Field | Exact value |
|---|---|
| Name | `Season 2 2026` |
| Source season | `08dce649-66b8-5d32-9c9e-d07a180cf591` (2026 Season 1) |
| Overall start / end | `2026-10-12` / `2027-05-26` |
| Monday first / last regular-season fixture | `2026-10-12` / `2027-05-03` |
| Wednesday first / last regular-season fixture | `2026-10-14` / `2027-05-26` |
| Fixture import inputs | Unchanged `docs/drafts/monday-rounds.json` (182) and `docs/drafts/wednesday-rounds.json` (240) |

Do not regenerate assignments, add finals dates, or change fixture dates to match the display year. The provisional 2 November cancellation scenario remains unapplied.

### Database backup gate and concrete procedure

On 10 October, the signed-in production dashboard shows **Free Plan does not include project backups** under Scheduled backups and a Pro-plan upgrade requirement under Point in time. No scheduled backup or PITR recovery point is available through that dashboard. No external logical recovery copy has been supplied/verified. The permanent Git tag restores website files only and is not a database backup. **Do not begin production corrections/migration until a recovery copy is created and verified.** No upgrade, backup export, restore or configuration change was performed in preparation.

An authorised operator should perform this read-only export immediately before the first release write:

1. Use PostgreSQL 17 client tools and the production direct connection or **session** pooler from the Connect panel, with TLS and the existing database account. Configure a private libpq service named `fis_production_backup` and a protected password file locally; enter credentials privately, never in commands, chat, Git or logs. Do not reset a password or create a new role. Connector/dashboard read access does not establish that these database connection credentials are available.
2. Pause application/admin mutations for the export window. Create a dated folder in an encrypted, access-restricted backup location **outside every repository**. Set `$fisBackupDirectory` to that folder, then run the commands below one at a time. Check each exit code; any denied schema/role or other dump error fails the gate, not permission to omit that object. `pg_dump` obtains a consistent read snapshot; it does not modify production data.

```powershell
pg_dump --version
pg_dump --dbname=service=fis_production_backup --format=custom --file "$fisBackupDirectory/fis-before-release.dump"
if ($LASTEXITCODE -ne 0) { throw 'Database export failed; stop release.' }
pg_dumpall --dbname=service=fis_production_backup --roles-only --no-role-passwords --file "$fisBackupDirectory/roles-without-passwords.sql"
if ($LASTEXITCODE -ne 0) { throw 'Role metadata export failed; stop release.' }
pg_restore --list "$fisBackupDirectory/fis-before-release.dump" | Set-Content -LiteralPath "$fisBackupDirectory/archive-contents.txt"
if ($LASTEXITCODE -ne 0) { throw 'Archive inspection failed; stop release.' }
Get-FileHash -Algorithm SHA256 -LiteralPath "$fisBackupDirectory/fis-before-release.dump","$fisBackupDirectory/roles-without-passwords.sql"
```

The full database archive deliberately has no schema/data exclusions, no `--no-acl` and no `--no-owner`. Preserve the manifest/checksums, UTC capture start/end, project ref, PostgreSQL/tool versions and baseline application SHA in the protected folder. Keep a second encrypted copy separately. Dumps include private profiles and potentially Auth/Vault data; never attach them here or commit them. Role passwords are excluded and must remain in the operator's existing secret store. Archive listing/checksum alone is not a restore test.

Required release coverage, checked against the current catalogue:

| Area | Items to retain and verify in the archive/restore |
|---|---|
| Season structure and identities | `public.categories`, `locations`, `competitions`, `seasons`, `competition_seasons`, `teams`; UUIDs, readable IDs, profile versions, kits, eligibility and all historical links |
| Private scheduling and drafts | `team_fixture_notes`, `team_kickoff_preferences`, `season_drafts`, `season_draft_competitions`, `season_draft_teams`; existing and newly added columns, sequence state and source snapshots |
| Fixtures, results and review | `fixtures`, `result_versions`, `standing_adjustments`, `fixture_change_sets`, `fixture_change_items`, `fixture_change_history`, `admin_audit_log`; all statuses, versions, scores and review evidence |
| Schema and access control | Public/private schemas, enums, views, functions/RPC bodies and security-definer/search-path settings, triggers, indexes/uniqueness/FKs, RLS flags/policies, owners, grants/default privileges and role memberships; `private.admin_users` |
| Auth and extension dependencies | `auth.users` UUIDs are referenced by admin enrolment, fixture reviews/history, results and drafts. Retain the Auth schema/data and extension definitions; existing extensions include pgcrypto, uuid-ossp, pg_stat_statements and supabase_vault. Do not disclose Auth records or Vault keys. A portable whole-project Vault restore needs separately secured encryption-root-key handling; the scoped release does not alter Vault/Auth. |
| Migration tracking and non-DB assets | `supabase_migrations.schema_migrations` is currently absent: record that, and include any history installed before a later capture. Retain release SQL hashes and execution receipts. Finals JSON, approved draft JSON, kits/photos and the fallback are in the preserved Git commits. Database dumps do not contain Storage object files; this release does not change them. |

3. Restore and compare **only on explicitly disposable infrastructure**, isolated from production and with outbound jobs/webhooks/email disabled. Use a compatible PostgreSQL 17/Supabase environment and a reviewed archive selection: restore custom application schemas/access controls and data, retaining or restoring the required Auth UUID dependencies. Do not blindly replay managed role/schema objects into a provisioned Supabase database. Any owner/extension/managed-schema conflict needs a reviewed restore mapping, not ignored errors or weakened RLS. If full Auth/Vault recovery is required, follow the separate platform recovery procedure and protected encryption-key requirements. Do not assume `fis-fixture-test` is disposable.
4. Verify zero FK violations, identical row counts and deterministic row/schema comparisons for every application table, sequences, UUID references, published history, private-profile contents and RLS/grants/RPC definitions. Baseline observed today: 34 teams, 326 fixtures, 326 result versions, zero season drafts and one enrolled admin. Re-read at capture; these counts alone are insufficient. Run read/access checks on the restored copy and rehearse the proposed migration/correction/ID changes there. Record the restore outcome, time taken, operator and archive hash. A dump that cannot be restored leaves the gate open.
5. Take another verified checkpoint after schema/application release and before activation if private staging has occurred or other authorised edits resumed. Keep both copies. Production recovery requires its own explicit instruction and reviewed restore scope; it must account for all changes since capture. Never run `pg_restore --clean` against production as an automatic rollback.

Official references: [Supabase backups](https://supabase.com/docs/guides/platform/backups), [Supabase logical recovery](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore), [PostgreSQL 17 pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html) and [role metadata export](https://www.postgresql.org/docs/17/app-pg-dumpall.html). The export/restore procedure is prepared, **not executed or restore-verified**.

#### Authorised backup attempt: access/tooling blockers

The organiser authorised read-only backup creation and disposable local restoration on 10 October. Local inspection found no configured `PGSERVICE`, `PGSERVICEFILE`, `PGPASSFILE`, database host/user/password/URL environment settings, standard Windows `pg_service.conf` or `pgpass.conf`. Repository environment files contain only the public Supabase URL/publishable key. Those keys cannot authenticate `pg_dump` or restore a database. No credential values were displayed.

No `pg_dump`, `pg_dumpall`, `pg_restore`, `psql`, Supabase CLI or Docker is on PATH. The retained temporary embedded PostgreSQL 17 installation contains `postgres.exe`/`initdb.exe` and the Node client, but not dump/restore client tools. Local fresh-cluster verification remains available once a backup exists; no database was overwritten. The SQL connector returns query results into tool output and has no direct archive-to-file stream, so it is not used to export private/Auth rows or substitute an incomplete backup.

**Smallest organiser action:** privately configure an existing production database connection as libpq service `fis_production_backup` in `%APPDATA%\postgresql\pg_service.conf`, and its password in `%APPDATA%\postgresql\pgpass.conf` (or an existing approved secret manager), restricted to the Windows user. Obtain host/port/user from the verified project's Connect panel: direct or session pooler, not transaction pooler; database `postgres`, TLS enabled. Do not paste credentials here or reset/create credentials. Confirm only that configuration is ready. PostgreSQL 17 dump/restore tools can then be installed from the official distribution and used under this backup-only authority. A protected encrypted off-repository destination and fresh isolated restore target will be established before any private export. No archive, plaintext export, backup folder containing private data or restore result has been produced yet. Application deployment/private staging remain blocked by the unverified recovery gate.

### Separate release scopes

- **Application deployment and private preparation:** verified backup first; exact King ADL correction -> new staging migration -> four guarded readable-ID updates -> matching reviewed application deployment. Verify Pages, hosted new-resource reads/grants and old-season public behaviour. Then create the approved-name private draft, Save/Validate/Stage, import the unchanged 182/240-match files, review both plans and validate again. This involves authorised production private writes, but leaves the old season active and exposes no new draft competition publicly. Exclude alternative membership SQL and baseline imports. Stop before ACTIVATE.
- **Public season activation and fallback delivery:** separately approve ACTIVATE for the exact reviewed draft/versions; publish both editions and 422 fixtures atomically, archive old editions while preserving history, then perform the authorised master snapshot reconciliation and Pages/forced-fallback verification. Private staging/deployment approval alone does not include this step. Genuine hosted concurrency/non-admin JWT and changed-snapshot-chain limitations remain explicit.

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

1. Open `/admin/seasons/` as the verified FIS admin. Create a private draft named exactly **Season 2 2026**, copying 2026 Season 1 (`08dce649-66b8-5d32-9c9e-d07a180cf591`). Use season start 12 October 2026 and overall end 26 May 2027; the Monday edition's actual last fixture remains 3 May. Retain Monday/Wednesday Division A at Endeavour Hills Leisure Centre. Both editions use the approved season display name.
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

**Next outstanding gate:** configure the existing database connection privately, then create and restore-verify the protected logical backup; no platform recovery point is available. **Season 2 2026** is approved for both nights, with all dates/422 fixtures unchanged. Only after explicit authority for application deployment/private preparation may the guarded King ADL correction run first. Public activation and refresh dispatch need their distinct approval. New-resource hosted reads must pass after migration and before setup; existing verification limitations remain recorded.
