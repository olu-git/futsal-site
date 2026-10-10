# New-season identity and scheduling preparation

Current follow-up status: scheduling-source reconciliation is closed by supplied authenticated exports and the organiser correction on 10 October 2026. Monday King ADL has no current kickoff preference. See the final correction section; older checkpoint profile-access limitations are historical. Production cleanup and hosted release checks remain pending.


Prepared 10 October 2026. **Review only: no hosted SQL, production season activation, production fixture publication, push or deployment has been performed; SQL verification uses only local synthetic data.** Branch: `prep/new-season-identities`, based on freshly fetched `origin/master` at `628a1da`.

## Identity evidence and questions

Current production public records were read anonymously through REST. They contain 34 memberships in two active/published Division A editions of 2026 Season 1. This inventory covers publicly visible records, not hidden drafts. Private scheduling preferences and notes require administrator authentication; their latest contents remain unverified.

Monday edition: `8021a2bb-eb2b-55fe-9900-d3f50facf092`. Wednesday edition: `e1db4456-0663-55d2-95a1-681d17163b91`. Both belong to season `08dce649-66b8-5d32-9c9e-d07a180cf591`, 2026 Season 1 (23 March to 7 October 2026). A row's UUID identifies a season-specific membership, not a shared cross-night club identity.

**Confirmed identities:** King ADL is Toss renamed on both nights; no naming conflict remains. Existing UUIDs/history are preserved. Monday Xaywan is a completely new entrant. Wednesday Buckle City is a distinct placeholder membership with ordinary scheduled matches, not an automatic bye; Ibiza remains unchanged.

| Requested name | Night | Stored name | Database UUID | Current readable ID | Status / membership | Proposed action / question |
|---|---|---|---|---|---|---|
| AFG | Monday | AFG | `b6374b74-1c92-5796-a39f-c0935ec5bfee` | `mon-afg` | active; 2026 S1, Monday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Blue Dragons | Monday | Blue Dragons | `5abfb2ea-6371-553f-a0d6-183433a5da64` | `mon-blue-dragons` | active; 2026 S1, Monday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Goldlink Up | Monday | Goldlink Up | `48bde0c2-9466-5ef4-8b84-8f150f0daf28` | `mon-goldlink-up` | active; 2026 S1, Monday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Misfits | Monday | Misfits | `b86d5ed5-20cc-5e3a-957f-0ee36cf400f1` | `mon-misfits` | active; 2026 S1, Monday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Ghazni United | Monday | Ghazni United | `49af3e93-876c-5538-af80-0e0acef919e7` | `mon-ghazni-united` | active; 2026 S1, Monday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Wildcats | Monday | Wildcats | `31dc0cdb-ec3c-5497-ba57-c24a9256a68f` | `mon-wildcats` | active; 2026 S1, Monday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Nassaji FC | Monday | No exact membership | - | - | Not present in current visible Monday edition | Confirmed new entrant; fresh UUID/readable ID reserved locally (see reservation table); no production membership created. |
| Salvos | Monday | Salvos | `fb74c735-3291-5c0f-9903-2886d57fa33c` | `mon-salvos` | active; 2026 S1, Monday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Hunger FC | Monday | Hunger FC | `4a71b16e-3503-5414-a122-5cf9d593fbe3` | `mon-hunger-fc` | active; 2026 S1, Monday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| King ADL | Monday | King ADL | `04ebec43-f537-52b4-bbae-ffe3449b7826` | `mon-toss` | active; 2026 S1, Monday, A | Readable ID -> `mon-king-adl`; preserve UUID, history and kit. |
| Xaywan | Monday | No exact membership | - | - | Not present in current visible Monday edition | NEW team; reserve fresh UUID `d9611fa9-bb86-4b6c-9ed9-75113b231809` / `mon-xaywan`, no source membership or history. |
| Hope | Monday | Hope | `7d4f7cde-d0fc-587e-81a0-242d7037e14e` | `mon-hope` | active; 2026 S1, Monday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Bunyip | Monday | Bunyip | `c45d3081-6fd9-5cfd-ad32-c9c7f5ed37b2` | `mon-bunyip` | active; 2026 S1, Monday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Declan's Delinquents | Monday | Declan's Delinquents | `5ab40935-7320-536b-a625-13661e1cdb8d` | `mon-declans-team` | active; 2026 S1, Monday, A | Readable ID -> `mon-declans-delinquents`; preserve UUID, history and kit. |
| AFG | Wednesday | AFG | `cfc5c915-1f34-5995-96d1-ef4b62d7c93f` | `wed-afg` | active; 2026 S1, Wednesday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Goldlink Up | Wednesday | Goldlink Up | `d098c8c3-bfa2-5c4f-b627-f1c0bbe59df7` | `wed-goldlink-up` | active; 2026 S1, Wednesday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Misfits | Wednesday | Misfits | `67c0aaae-329e-5c95-9217-392c74046dcb` | `wed-misfits` | active; 2026 S1, Wednesday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Ghazni United | Wednesday | Ghazni United | `24c8ab29-64f4-597f-97df-571b62a5bbb3` | `wed-ghazni-united` | active; 2026 S1, Wednesday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Pops | Wednesday | Pops | `41c7b7cf-7d53-50ea-a393-dbc1aa1db852` | `wed-pops` | active; 2026 S1, Wednesday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Rinnai | Wednesday | Rinnai | `fc2b2203-9a12-5a25-9b99-6370c00a5dc7` | `wed-rinnai` | active; 2026 S1, Wednesday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Unathletico | Wednesday | Unathletico | `457fcb9b-aecd-550f-8b2a-711e5b1a3158` | `wed-unathletico` | active; 2026 S1, Wednesday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Wildcats | Wednesday | Wildcats | `5dae69e2-1e55-563e-8a0b-25f80f845677` | `wed-wildcats` | active; 2026 S1, Wednesday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Hazara United | Wednesday | Hazara United | `31e79707-81a2-5ff2-abfd-2e42537855df` | `wed-hazara-united` | active; 2026 S1, Wednesday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| King ADL | Wednesday | King ADL | `402549b9-1e74-51ff-b058-9749e72ddd74` | `wed-toss` | active; 2026 S1, Wednesday, A | Readable ID -> `wed-king-adl`; preserve UUID, history and kit. |
| Ibiza | Wednesday | Ibiza | `f4874f8a-c472-5fb7-8984-46e8f0506f5a` | `wed-ibiza` | active; 2026 S1, Wednesday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Umoja Stars | Wednesday | Umoja Stars | `ce320e94-4be0-511b-b78b-7dcad3b8d9b0` | `wed-umoja-stars` | active; 2026 S1, Wednesday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| MTS FC | Wednesday | MTS FC | `22d0eada-cd6e-5aee-a447-c74f5c07a371` | `wed-mts-fc` | active; 2026 S1, Wednesday, A | Reuse as the source for a new-season membership; preserve historical UUID and kit. |
| Kuq E Zi | Wednesday | Kuq E Zi | `629727a3-27fb-59de-a790-c578aeffd38f` | `wed-xaywan` | active; 2026 S1, Wednesday, A | Readable ID -> `wed-kuq-e-zi`; preserve UUID, history and kit. No relationship to Monday Xaywan inferred. |
| Etihad FC | Wednesday | No exact membership | - | - | Not present in current visible Wednesday edition | Confirmed new entrant; fresh UUID/readable ID reserved locally (see reservation table); no production membership created. |
| Buckle City | Wednesday | No exact membership | - | - | Not present in current visible Wednesday edition | Distinct placeholder; reserve fresh UUID `36781b64-2197-4a8b-ac2e-bb9c76c5c167` / `wed-buckle-city`. No club/player identity inferred; ordinary standings eligibility confirmed. |

Relevant related record: inactive Monday Buckle City, UUID `5b27722d-c362-5c56-9379-7e7987d6039f`, readable ID `mon-buckle-city`, Monday 2026 S1 Division A. It is not automatically a Wednesday identity. Legacy `mon-buckle-city-fc` is a separate excluded source artifact, not another production membership. Ibiza is its own active Wednesday membership, UUID `f4874f8a-c472-5fb7-8984-46e8f0506f5a`; it must not be repurposed. Old guidance about Umoja replacing Toss is historical, not a reason to merge Umoja with either King ADL record.

## Reference changes and migration plan

- `src/lib/team-readable-id.ts` contains the King ADL/Declan ID transitions and a UUID-bound Kuq E Zi identity. There is no current Xaywan string alias. The old `wed-xaywan` survives only as a historical import seed, migration old-value guard or verification/history evidence. Snapshot normalization resolves Kuq by its preserved UUID; the new Monday Xaywan UUID is independent.
- Exact JSON ID tokens are updated in legacy teams, regular-season fixture team references and adjustment team references. Match IDs, dates, courts, scores, kit values and historical notes remain unchanged.
- The snapshot is generated from read-only production data using the reviewed mapping. Live runtime team/fixture joins continue using original database UUIDs. Snapshot team/fixture/adjustment references use the same canonical readable IDs before and after migration.
- Declan's display-name compatibility handles both old and new IDs.
- The import generator retains the original four UUID seeds. Regenerated import SQL, verification SQL and reconciliation report therefore use new readable IDs but unchanged team/fixture/result/adjustment UUIDs. These are offline reconciliation artifacts; **never rerun the completed production import to apply these changes**.
- Historical narrative documents and distinct identities named Toss/Xaywan are not globally replaced. No new-season teams or fixtures are inserted into the completed-season source JSON.

Prepared data migration (kept outside the installed migration chain until reviewed and verified): `supabase/production/team-readable-id-update.sql`. It is a transactional data migration updating only `teams.legacy_id` for four exact UUIDs. It requires the expected name, membership, active status and active/published edition, checks ID collisions, permits an already-applied target ID without a second write, and leaves archive protection enabled. Ordinary timestamps/audit records may update through existing triggers; child references and kit data do not change. No schema change or new RPC is included.

Before any future hosted execution: verify the intended project without printing credentials and take a read-only before inventory. Local verification against the real schema and synthetic records has now passed; this does not authorise hosted execution. Test wrong UUID/membership/name, target collisions, partial failure rollback, archived rejection and rerun behaviour. Compare all original team PKs, membership IDs, kits, fixture FKs/dates/scores, published results, adjustments and private profiles afterward. The migration must run before archiving those editions; it deliberately refuses archived editions rather than disabling their protection. New-season membership UUIDs are created separately at eventual activation and should not be confused with preserving the old UUIDs.

SQL has been executed only in a fresh local in-memory PostgreSQL instance; no production or hosted fixture-test connection was made. Existing unactivated drafts must be inspected when admin access is available: copied names/profiles can be stale even though their source-team UUID references remain valid.

## Approved Monday opponent counts

Double round-robin baseline: 14 teams - 26 games / 2 = 182 matches, requiring 26 complete rounds of seven matches if every team plays once per round.

| Non-standard pairing | Meetings |
|---|---:|
| Xaywan-Bunyip | 0 |
| Xaywan-Declan's Delinquents | 0 |
| Bunyip-Declan's Delinquents | 3 |
| Bunyip-Misfits | 3 |
| Declan's Delinquents-Misfits | 3 |
| Xaywan-AFG | 3 |
| Xaywan-Blue Dragons | 3 |
| Xaywan-Hope | 3 |
| Xaywan-Salvos | 3 |
| Misfits-AFG | 1 |
| Misfits-Blue Dragons | 1 |
| Hope-Salvos | 1 |

All other permitted pairings are two, including Misfits-Hope and Misfits-Xaywan. Wildcats-Nassaji FC remains two meetings, one required in Week 1.

| Team | Total |
|---|---:|
| AFG | 26 |
| Blue Dragons | 26 |
| Goldlink Up | 26 |
| Misfits | 26 |
| Ghazni United | 26 |
| Wildcats | 26 |
| Nassaji FC | 26 |
| Salvos | 26 |
| Hunger FC | 26 |
| King ADL | 26 |
| Xaywan | 26 |
| Hope | 26 |
| Bunyip | 26 |
| Declan's Delinquents | 26 |

There are two forbidden pairs, seven triple pairs, three single pairs and 79 double pairs: 0 + 21 + 3 + 158 = 182 matches. The four Xaywan triples restore its four lost games; the two Misfits singles remove its two extra games; Hope-Salvos offsets those teams' extra Xaywan games.

This minimizes the number of departures from two meetings: Xaywan needs at least four permitted pairs increased to three, on top of the three required triples. Two forbidden pairs remove four matches; seven triples add seven, so at least three other pairings must decrease from two to one. The approved matrix attains these lower bounds: 12 non-standard pairings total. Other choices of partners can attain the same optimum. The user has approved these redistribution partners. There is no known general time rule that makes this matrix unsuitable; private profiles may change that assessment.

The local Monday draft now proves a decomposition into 26 rounds, with seven matches and every team playing once per round. All teams have 26 games (13 home / 13 away), all approved pair totals match, Week 1 contains Wildcats-Nassaji FC, there are no court/time collisions, every hard Monday kickoff rule passes, rematches are at least four rounds apart, and every two-meeting pair occurs once in each half with opposite homes. Playing dates are now derived from the confirmed 12 October start and known restrictions. Wednesday is confirmed double round-robin and its complete dated draft is generated below. The organiser-confirmed standing venue booking covers the scheduled nights; inaccessible private preferences remain unverified.

## Availability and calendar

`scripts/lib/new-season-planning.ts` preserves general availability and expresses the approved counts/calendar independently of archived finals. It is a planning helper, **not an admin publication validator**; the separate local Python generator produces review artifacts only.

- Goldlink Up and Bunyip have no opponent or simultaneous-kickoff restriction.
- Goldlink Up/Buckle City shared-player separation remains, except their own head-to-head; do not extend it to Hunger FC or Ibiza.
- Monday Hunger FC and Ghazni United: 20:20/21:00. Blue Dragons: no 19:00.
- Wednesday Rinnai: no 19:00. Umoja Stars: 21:00 throughout the season.
- Kuq E Zi: no 21:00 except its explicit match against Umoja Stars, which must be at 21:00.
- Preserve Wednesday Ghazni's soft avoidance of 21:00 and Ibiza's preference for 20:20/21:00 (19:40 fallback; avoid 19:00 where practical).
- Retain other documented general preferences, including Samen and Premiers FC, if those teams return. Use the minimum necessary time range, skip confirmed holidays/blackouts and keep pairs separated where practical.
- Finals checking/seed preparation no longer enforces availability retrospectively against recorded 2026 finals. Dates, fixtures, scores, advancement and structural validation remain. Hunger's historic 19:30 exception is not a new-season rule.
- No Wednesday games on 28 October 2026.
- Monday 2 November 2026 is provisionally available, not cancelled.
- Wednesday 23 December 2026 is the last playing night before Christmas.
- No fixtures after 23 December and before 11 January 2027. Monday 11 January is the first playing night back; the following Wednesday is 13 January.
- "Available" in the helper means the confirmed date rules and checked holidays allow it. The standing Monday/Wednesday venue booking is confirmed by the organiser, subject to the listed exceptions; this does not confirm private team availability.

## Admin setup status and remaining gates

The staging extension targets Monday/Wednesday, even active rosters of 2-16 teams, two courts and the four current kickoff slots. Unsupported structures are rejected before freezing. The smallest coherent staging extension is now implemented locally in `20261009224309_season_fixture_staging.sql`, the existing Seasons wizard and Fixtures loader. It is **not installed on any hosted database**. The six installed migrations remain unchanged. See the practical sequence below.

1. New draft entrants now allow null source-team IDs, explicit readable IDs, optional reserved fresh membership UUIDs, normal kit and standings controls. Returning source UUIDs/history stay intact. The current roster has no need for an inactive-returning picker; that convenience remains unsupported.
2. Persisted Validate is blocked while edits are unsaved. Save resets validation and reloads persisted status/version; fixture changes must also be saved before submission, and pending-review fields are read-only; requests from a closed or replaced editor cannot replace the new editor. Fixture review versions are bound to the season's validation, so changing/re-reviewing a plan requires validating the season again.
3. Stage materializes planned/unpublished editions and all selected memberships before fixture import. Team structure/profiles become frozen; fixtures remain editable through private change sets. Database triggers enforce the freeze. Staged abandon/restructure is deliberately blocked rather than leaving orphaned public-reference mappings; a later draft-discard/rebuild workflow is not implemented.
4. Import each local schedule plus its constraints. The backend independently checks complete roster/rounds, configured dates, pair counts, home/away totals and streaks, repeated-pair spacing/half placement, court/time collisions, hard availability and recorded exceptions, shared-player separation, Week 1 requirements and minimum late slots. Required private preferences block planned-season review unless an explicit opponent/time exception applies. Soft preferences/notes remain warnings requiring acknowledgement.
5. Team availability confirmation is an explicit gate before staging. The organiser-confirmed standing Monday/Wednesday booking at Endeavour Hills Leisure Centre satisfies the venue gate without individual date confirmations; other venues still require explicit confirmation. Untouched copied or new profiles are not treated as unrestricted. The exact unresolved inventory is below. Source profile snapshots are checked and locked against their current database rows at staging, validation and activation; changed source information requires recreating/reloading the private draft and reviewing it.
6. Activation reuses staged IDs, locks and rechecks all reviewed plans, publishes their fixtures inside unpublished editions, then archives the matching old editions and exposes the new ones in the same transaction. Ordinary fixture publication cannot bypass planned-season activation. Historical teams, fixtures, results, adjustments and JSON knockout history are preserved.
7. Public season selection remains automatic, with no historical-season dropdown; old knockout history remains pinned to 2026 S1 and needs clear historical presentation at rollover. Neither public behaviour was changed here.
8. GitHub Variables authentication, new-migration hosted Auth/PostgREST and multiple-connection concurrency, and changed-snapshot-to-Pages verification remain outstanding. Browser interaction QA is now completed against disposable mocked data, separately from the embedded-Postgres backend verification. No hosted database or deployment action is authorised by this work.

## Validation

All 181 tests passed, including twelve preparation/draft regressions and ten admin staging regressions. Lint, TypeScript (`--noEmit --incremental false`), static build, import validation/check, finals check, snapshot validation/live comparison and whitespace checks passed. Structural comparisons prove every generated import UUID/reference unchanged; legacy fixture/adjustment changes are exact team-ID substitutions; the generated snapshot only remaps the four IDs/references; recorded finals data/templates are unchanged. Both guarded SQL proposals have now passed local disposable execution verification; hosted authentication and concurrent sessions remain untested. No hosted mutation, migration, activation, publication, push or deployment is authorised by this preparation; only local synthetic SQL verification has been performed.


## Local identity reservations and verified SQL

`docs/drafts/new-season-team-memberships.json` reserves these fresh UUIDs only for local preparation. They are not production memberships and do not reuse old club/history records.

| Name / night | Reserved new UUID | Readable ID | Eligibility |
|---|---|---|---|
| Xaywan / Monday | `d9611fa9-bb86-4b6c-9ed9-75113b231809` | `mon-xaywan` | Ordinary default: true |
| Nassaji FC / Monday | `8b1cff66-c38c-45bd-92a7-7fe80ac89a77` | `mon-nassaji-fc` | Ordinary default: true |
| Etihad FC / Wednesday | `bd8d3bb7-6fde-4e7d-b779-3ed2d92e6d72` | `wed-etihad-fc` | Ordinary default: true |
| Buckle City / Wednesday | `36781b64-2197-4a8b-ac2e-bb9c76c5c167` | `wed-buckle-city` | Confirmed ordinary eligibility: true |

The placeholder receives a distinct new membership because no clearly appropriate existing Wednesday identity exists; inactive Monday Buckle City is not repurposed. No links to fill-in players/teams are inferred. Matches and ordinary recorded scores remain matches. The existing schema defaults active teams to standings eligibility; excluding a team removes its ladder row but its actual games can still affect opponents. The user has now confirmed ordinary eligibility: Buckle City games, points and goals count normally. The reservation and guarded proposal explicitly use true. No special forfeits, automatic scores or byes are added.

`supabase/production/new-season-team-memberships.sql` requires explicit Monday/Wednesday edition IDs, the same season/venue, Division A, lifecycle planned, publication draft, with confirmed ordinary Buckle eligibility. It cannot create/activate a season. Reserved UUID conflicts, readable-ID/name collisions and any late failure reject the whole transaction. Re-execution confirms matching identity fields and does not overwrite kits or history.

`scripts/verify-local-season-identities.mjs` is an intentionally retained reproducible harness. It uses PGlite in-memory PostgreSQL with no connection URL and no environment credentials. PGlite 0.5.8 was installed outside the repository in the system temporary folder; no dependency or lockfile was added to the website. The six existing migrations were loaded unchanged, with minimal mocked Auth helpers and synthetic hierarchy/current-season import records confined to this local engine.

Executed checks passed: four guarded ID updates, all UUID/kit/history preservation, 326 fixtures, 326 result versions, 38 adjustments, private-note/preference sentinels, four fresh memberships, team FK/normalized-name/readable-ID uniqueness, rollback on a later ID collision and on a later entrant collision, repeat execution without duplicate writes, archived protection, and Buckle City ordinary-match behaviour: a local 2-2 draw produces one played, one point, two goals for and two against for its ladder row. Hosted Auth/PostgREST, multiple-connection concurrency and production SQL remain untested.

Reproduce using a temporary PGlite 0.5.8 installation (`npm.cmd install --prefix $taskDbDir --no-audit --no-fund @electric-sql/pglite@0.5.8`, where `$taskDbDir` is a temporary folder), then:

```powershell
$taskPgliteEntry = Join-Path $env:TEMP 'fis-local-verification\node_modules\@electric-sql\pglite\dist\index.js'
node scripts/verify-local-season-identities.mjs $taskPgliteEntry
python scripts/generate-new-season-draft.py
npx.cmd tsx scripts/validate-new-season-draft.ts
```

## Xaywan reference review

- Current legacy team/fixture/adjustment references and generated import/snapshot membership labels already use `wed-kuq-e-zi` for the preserved Wednesday UUID.
- `src/lib/team-readable-id.ts` retains `wed-xaywan` strictly as the original 2026 S1 UUID derivation seed, not a current alias.
- The ID-update SQL and local tests retain the old label as pre-update evidence; they cannot attach its UUID to Monday Xaywan.
- Historical adjustment ID `wed-admin-xaywan-r1-r18-entry-record` remains linked to Kuq's original UUID and is not renamed or reassigned.
- The MTS FC administrative note saying a historical win/loss was against Xaywan remains historical prose. Its context is Wednesday 2026 S1, not the new Monday entrant.
- No other ambiguous repository identity link was found. Production private notes remain inaccessible without admin authentication and may need individual review.

## Remaining decisions and smallest admin changes

Start dates, format and Buckle eligibility are now confirmed. The dated local drafts use all known calendar restrictions and verified Victorian holidays. Monday 2 November remains provisionally scheduled for a team participation decision, not an unconfirmed venue booking. Private database preferences remain inaccessible without authenticated read-only admin access; no new preferences were invented. The new staging migration is local and unreleased; hosted setup remains blocked pending its separately authorised release and team-profile review.

The local staging implementation follows the existing planned/draft states. Do not use the standalone four-membership SQL proposal as a parallel creation path: the new Stage action creates all selected destinations, including the four reserved new teams when their UUIDs are entered. The separate guarded historical readable-ID proposal remains a reviewed pre-archive operation, not an automatic staging side effect.

No hosted migration or admin rollout has been performed.

## Confirmed dated drafts - 10 October 2026

Both artifacts are local review JSON for the new private season importer, not payloads for the existing generic fixture-change uploader: [Monday draft](drafts/monday-rounds.json), [Wednesday draft](drafts/wednesday-rounds.json). [Calendar inputs](drafts/new-season-calendar.json) record start dates, blackouts, break boundaries, public-holiday sources and provisional dates. No finals dates are included. Existing Monday opponents, rounds, times, courts and dates are retained. Only double-pair home/away orientations were changed to reduce the longest streak from 12 to three, preserving 13 home / 13 away per team.

| Competition | Start | Rounds | Matches | Per team | Home / away | Final regular-season date |
|---|---|---:|---:|---:|---:|---|
| Monday | 12 October 2026 | 26 | 182 | 26 | 13 / 13 | **3 May 2027** |
| Wednesday | 14 October 2026 | 30 | 240 | 30 | 15 / 15 | **26 May 2027** |

Monday excludes Labour Day 8 March and Easter Monday 29 March 2027 under repository public-holiday guidance. ANZAC Day is Sunday 25 April; Victoria gives no replacement holiday on Monday 26 April, so that Monday remains scheduled. Sources: [Victorian 2027 public holidays](https://business.vic.gov.au/business-information/public-holidays/victorian-public-holidays-2027), [2026 holidays](https://business.vic.gov.au/business-information/public-holidays/victorian-public-holidays-2026), checked 10 October 2026. Venue-specific closures beyond the supplied blackout are not confirmed.

Wednesday 28 October is excluded. Wednesday 23 December is round 10 and the last pre-break playing night; Monday resumes 11 January (round 12), Wednesday resumes 13 January (round 11). There are no games after 23 December and before 11 January. Monday 2 November is round 4; every fixture that night carries `provisional: true`.

If 2 November is cancelled, remove that playing date and redate round 4 onward to the next eligible Monday, preserving round order/opponents/slots. Round 4 becomes 9 November and Monday's final date becomes **10 May 2027**. Wednesday is unchanged. This alternative is calculated and tested, not substituted into the current draft.

### Independent feasibility validation

- Every round contains exactly one match per rostered team: seven games Monday, eight Wednesday; no byes, team double bookings or court/time collisions.
- Monday's approved pair matrix is unchanged (including both forbidden Xaywan opponents, all seven triples, three singles, Misfits-Hope and Misfits-Xaywan twice). Every team plays 26, total 182; no pair exceeds three. Week 1 contains Wildcats-Nassaji FC.
- Wednesday has every permitted pairing exactly twice, reversed homes and one meeting in each 15-round half: 30/team, 240 total. Buckle City has the same 30-match/15-home/15-away allocation and normal standings treatment.
- Independent TypeScript verification checks identities, exact round dates, holidays/breaks, provisional flags, opponent totals, home/away totals, repeat spacing, all hard kickoff rules and Goldlink Up/Buckle City non-simultaneous starts except their own match. No Goldlink/Bunyip restriction is imposed.
- Hunger and Monday Ghazni stay at 20:20/21:00; Blue Dragons and Rinnai never play at 19:00. Umoja plays all 30 games at 21:00. Both Kuq-Umoja games are at 21:00 and Kuq's other 28 games are earlier.
- Repeat gaps are at least **five rounds Monday**, exactly **15 rounds Wednesday**. Every two-meeting pair has opposite homes and one match per half. Odd one/three-meeting Monday pairs necessarily have unequal per-pair home totals, while each team's whole season is exactly 13/13.
- Wednesday Ibiza stays at 20:20/21:00. Ghazni's only soft preference exceptions are its two matches against 21:00-only Umoja, rounds 9 and 24; these are necessary to satisfy Umoja's hard rule. No hard rule was relaxed.
- Both nights now have a maximum consecutive home/away run of **three**. Monday was improved by flipping only two-meeting pair orientations; round order, opponents, dates, time and court assignments, odd-pair orientations, total 13/13 balance and five-round minimum repeat gap are unchanged. No hard rule was relaxed and no round/time rearrangement was needed.

### Round dates

| Round | Monday | Wednesday |
|---:|---|---|
| 1 | 2026-10-12 | 2026-10-14 |
| 2 | 2026-10-19 | 2026-10-21 |
| 3 | 2026-10-26 | 2026-11-04 |
| 4 | 2026-11-02 (provisional) | 2026-11-11 |
| 5 | 2026-11-09 | 2026-11-18 |
| 6 | 2026-11-16 | 2026-11-25 |
| 7 | 2026-11-23 | 2026-12-02 |
| 8 | 2026-11-30 | 2026-12-09 |
| 9 | 2026-12-07 | 2026-12-16 |
| 10 | 2026-12-14 | 2026-12-23 |
| 11 | 2026-12-21 | 2027-01-13 |
| 12 | 2027-01-11 | 2027-01-20 |
| 13 | 2027-01-18 | 2027-01-27 |
| 14 | 2027-01-25 | 2027-02-03 |
| 15 | 2027-02-01 | 2027-02-10 |
| 16 | 2027-02-08 | 2027-02-17 |
| 17 | 2027-02-15 | 2027-02-24 |
| 18 | 2027-02-22 | 2027-03-03 |
| 19 | 2027-03-01 | 2027-03-10 |
| 20 | 2027-03-15 | 2027-03-17 |
| 21 | 2027-03-22 | 2027-03-24 |
| 22 | 2027-04-05 | 2027-03-31 |
| 23 | 2027-04-12 | 2027-04-07 |
| 24 | 2027-04-19 | 2027-04-14 |
| 25 | 2027-04-26 | 2027-04-21 |
| 26 | 2027-05-03 | 2027-04-28 |
| 27 | Not applicable | 2027-05-05 |
| 28 | Not applicable | 2027-05-12 |
| 29 | Not applicable | 2027-05-19 |
| 30 | Not applicable | 2027-05-26 |

Latest validation: 181 tests, lint, TypeScript, static build, import validation/check, snapshot validation, finals check and whitespace checks passed. Local PGlite verification reconfirmed rollback, repeat execution, UUID/history preservation and ordinary Buckle standings. No hosted SQL or new production data was used. Read-only snapshot comparison was rerun and matched anonymous production data; no fallback file was refreshed or published.

## Week 1 fixtures and season kickoff distribution

Teams are shown **home first**. Times are local Australia/Sydney clock times, including daylight-saving changes; kickoff clock slots do not shift. All fixtures are local review drafts.

### Monday Week 1

| Date | Time | Court | Home | Away |
|---|---|---:|---|---|
| 2026-10-12 | 19:00 | 1 | Nassaji FC | Wildcats |
| 2026-10-12 | 19:00 | 2 | Xaywan | Hope |
| 2026-10-12 | 19:40 | 1 | Blue Dragons | AFG |
| 2026-10-12 | 19:40 | 2 | Bunyip | Declan's Delinquents |
| 2026-10-12 | 20:20 | 1 | Hunger FC | Salvos |
| 2026-10-12 | 20:20 | 2 | Ghazni United | King ADL |
| 2026-10-12 | 21:00 | 1 | Goldlink Up | Misfits |

### Monday season kickoff totals

| Team | 19:00 | 19:40 | 20:20 | 21:00 | Total |
|---|---:|---:|---:|---:|---:|
| AFG | 7 | 9 | 4 | 6 | 26 |
| Blue Dragons | 0 | 22 | 4 | 0 | 26 |
| Goldlink Up | 8 | 8 | 4 | 6 | 26 |
| Misfits | 13 | 5 | 4 | 4 | 26 |
| Ghazni United | 0 | 0 | 26 | 0 | 26 |
| Wildcats | 14 | 5 | 4 | 3 | 26 |
| Nassaji FC | 8 | 10 | 4 | 4 | 26 |
| Salvos | 5 | 11 | 4 | 6 | 26 |
| Hunger FC | 0 | 0 | 26 | 0 | 26 |
| King ADL | 8 | 6 | 4 | 8 | 26 |
| Xaywan | 8 | 8 | 4 | 6 | 26 |
| Hope | 11 | 6 | 6 | 3 | 26 |
| Bunyip | 12 | 6 | 6 | 2 | 26 |
| Declan's Delinquents | 10 | 8 | 4 | 4 | 26 |

### Wednesday Week 1

| Date | Time | Court | Home | Away |
|---|---|---:|---|---|
| 2026-10-14 | 19:00 | 1 | Misfits | Kuq E Zi |
| 2026-10-14 | 19:00 | 2 | AFG | Buckle City |
| 2026-10-14 | 19:40 | 1 | Etihad FC | Goldlink Up |
| 2026-10-14 | 19:40 | 2 | MTS FC | Ghazni United |
| 2026-10-14 | 20:20 | 1 | Ibiza | Rinnai |
| 2026-10-14 | 20:20 | 2 | Unathletico | King ADL |
| 2026-10-14 | 21:00 | 1 | Pops | Umoja Stars |
| 2026-10-14 | 21:00 | 2 | Hazara United | Wildcats |

### Wednesday season kickoff totals

| Team | 19:00 | 19:40 | 20:20 | 21:00 | Total |
|---|---:|---:|---:|---:|---:|
| AFG | 9 | 8 | 8 | 5 | 30 |
| Goldlink Up | 9 | 8 | 7 | 6 | 30 |
| Misfits | 8 | 9 | 7 | 6 | 30 |
| Ghazni United | 10 | 9 | 9 | 2 | 30 |
| Pops | 10 | 8 | 7 | 5 | 30 |
| Rinnai | 0 | 12 | 9 | 9 | 30 |
| Unathletico | 9 | 8 | 7 | 6 | 30 |
| Wildcats | 10 | 8 | 6 | 6 | 30 |
| Hazara United | 9 | 8 | 8 | 5 | 30 |
| King ADL | 9 | 9 | 7 | 5 | 30 |
| Ibiza | 0 | 0 | 16 | 14 | 30 |
| Umoja Stars | 0 | 0 | 0 | 30 | 30 |
| MTS FC | 9 | 8 | 7 | 6 | 30 |
| Kuq E Zi | 11 | 9 | 8 | 2 | 30 |
| Etihad FC | 9 | 8 | 7 | 6 | 30 |
| Buckle City | 8 | 8 | 7 | 7 | 30 |

Slot totals reflect hard availability and the existing Monday slot assignments; they are not an equal-time guarantee. Monday time/court assignments were deliberately retained. Wednesday balances repeat slot usage after satisfying hard rules and soft preferences; Umoja's 30 late games and its opponents' two required late meetings necessarily prevent equal kickoff distributions. Ghazni's two Wednesday 21:00 games are rounds 9 and 24 against Umoja, the only soft time-preference compromises.

## Precise unresolved availability and venue inventory

Latest private profile contents are unverified for **all 26 returning memberships** below. The two admin-only sources to inspect for each exact UUID are `team_kickoff_preferences.team_id` (required/preferred/avoid rows) and `team_fixture_notes.team_id` (free-text availability, shared players, dates and exceptions). Anonymous public reads cannot establish that either table has no current rows. The older runbook's zero-profile counts are dated evidence, not confirmation of their current contents. Review all old copied drafts too: source snapshots may be stale.

| Returning team | Night | Existing source UUID: both private profile tables unverified |
|---|---|---|
| AFG | Monday | `b6374b74-1c92-5796-a39f-c0935ec5bfee` |
| Blue Dragons | Monday | `5abfb2ea-6371-553f-a0d6-183433a5da64` |
| Goldlink Up | Monday | `48bde0c2-9466-5ef4-8b84-8f150f0daf28` |
| Misfits | Monday | `b86d5ed5-20cc-5e3a-957f-0ee36cf400f1` |
| Ghazni United | Monday | `49af3e93-876c-5538-af80-0e0acef919e7` |
| Wildcats | Monday | `31dc0cdb-ec3c-5497-ba57-c24a9256a68f` |
| Salvos | Monday | `fb74c735-3291-5c0f-9903-2886d57fa33c` |
| Hunger FC | Monday | `4a71b16e-3503-5414-a122-5cf9d593fbe3` |
| King ADL | Monday | `04ebec43-f537-52b4-bbae-ffe3449b7826` |
| Hope | Monday | `7d4f7cde-d0fc-587e-81a0-242d7037e14e` |
| Bunyip | Monday | `c45d3081-6fd9-5cfd-ad32-c9c7f5ed37b2` |
| Declan's Delinquents | Monday | `5ab40935-7320-536b-a625-13661e1cdb8d` |
| AFG | Wednesday | `cfc5c915-1f34-5995-96d1-ef4b62d7c93f` |
| Goldlink Up | Wednesday | `d098c8c3-bfa2-5c4f-b627-f1c0bbe59df7` |
| Misfits | Wednesday | `67c0aaae-329e-5c95-9217-392c74046dcb` |
| Ghazni United | Wednesday | `24c8ab29-64f4-597f-97df-571b62a5bbb3` |
| Pops | Wednesday | `41c7b7cf-7d53-50ea-a393-dbc1aa1db852` |
| Rinnai | Wednesday | `fc2b2203-9a12-5a25-9b99-6370c00a5dc7` |
| Unathletico | Wednesday | `457fcb9b-aecd-550f-8b2a-711e5b1a3158` |
| Wildcats | Wednesday | `5dae69e2-1e55-563e-8a0b-25f80f845677` |
| Hazara United | Wednesday | `31e79707-81a2-5ff2-abfd-2e42537855df` |
| King ADL | Wednesday | `402549b9-1e74-51ff-b058-9749e72ddd74` |
| Ibiza | Wednesday | `f4874f8a-c472-5fb7-8984-46e8f0506f5a` |
| Umoja Stars | Wednesday | `ce320e94-4be0-511b-b78b-7dcad3b8d9b0` |
| MTS FC | Wednesday | `22d0eada-cd6e-5aee-a447-c74f5c07a371` |
| Kuq E Zi | Wednesday | `629727a3-27fb-59de-a790-c578aeffd38f` |

The four fresh memberships (Monday Xaywan and Nassaji FC; Wednesday Etihad FC and Buckle City) have **no reused source profile**. The organiser now confirms all four kickoff times for these four entries as the current position on 10 October 2026; availability may change. Record this dated confirmation in their new private draft profiles; null source IDs alone still never grant unrestricted availability. Their reserved UUIDs are listed above. Buckle City's ordinary standings eligibility and current four-slot availability are confirmed. No inactive Buckle City, old Xaywan or Ibiza profile is silently substituted. Samen/Premiers are not in these rosters; their archived general preferences remain preserved if they return later.

### Standing venue booking: confirmed

The organiser confirms an ongoing Endeavour Hills Leisure Centre booking **every Monday and Wednesday**. This is confirmation for all **56 scheduled playing nights**, without 56 separate confirmations, and covers a replacement Monday 10 May 2027 if needed. The local UI and database staging gate recognise the exact venue UUID `ce7becb1-0bbc-5cb4-8aa9-d708aaeaebce` and Monday/Wednesday nights; this does not confer confirmation on another venue or night.

Retain the closure on Wednesday **28 October 2026**, Christmas break after Wednesday **23 December 2026** through the return on Monday **11 January 2027**, Labour Day **8 March 2027** and Easter Monday **29 March 2027** exclusions. The staging validator independently rejects these excluded dates, even if an import changes both its fixture dates and rules. Monday **2 November 2026** has a confirmed venue booking but remains provisional for **team participation**. No fixtures have been changed. If cancelled later, Monday ends **10 May 2027** instead of **3 May 2027**; Wednesday still ends **26 May 2027**. No finals dates are added.

### Private-profile access result and new-entry assumptions for organiser review

Read-only REST checks on 10 October 2026 returned **HTTP 401 / SQLSTATE 42501** for both private-profile tables using the configured publishable key. No authenticated administrator session is available in this environment. Therefore every one of the **26 exact returning source UUIDs in the table above remains inaccessible**. No discrepancy can be established from inaccessible rows; empty public results must not be treated as unrestricted availability. No credentials were displayed and no hosted SQL was executed.

The four new memberships have null source profiles and **organiser-confirmed current availability at 19:00, 19:40, 20:20 and 21:00**, dated **10 October 2026**. Availability may change later. `new-season-team-memberships.json` now records the confirmation source/date, `availabilityConfirmed: true`, explicit allowed-time preference rows and a dated scheduling note. This is preparation metadata, not an executed production update. When entering these four in the wizard, transfer these profiles and set their confirmation checkbox based on the recorded organiser decision; generic new-team entry remains unconfirmed by default. Identity/profile edits revoke confirmation and require renewed review. The database does not infer confirmation from a team name or null source.

| New entry | Night | Draft kickoff counts: 19:00 / 19:40 / 20:20 / 21:00 | Current confirmed position |
|---|---|---|---|
| Xaywan | Monday | 8 / 8 / 4 / 6 | All four times; fresh identity. Approved opponent restrictions/counts preserved. |
| Nassaji FC | Monday | 8 / 10 / 4 / 4 | All four times; Wildcats pairing in Week 1 preserved. |
| Etihad FC | Wednesday | 9 / 8 / 7 / 6 | All four times; no inherited private profile. |
| Buckle City | Wednesday | 8 / 8 / 7 / 7 | All four times; confirmed Goldlink Up non-simultaneous rule except their own match; ordinary standings participation. |

All **26 returning profiles remain inaccessible/unconfirmed**, separately from these four decisions. [The bounded read-only query](../supabase/production/review-returning-availability.sql) returns team/night and structured scheduling preferences, plus a private-note-review flag without exporting its free text. It requires existing authorised SQL Editor or authenticated FIS-admin access, runs in a read-only transaction and rolls back. Local actual-grants/RLS tests return exactly 26 rows, exclude a synthetic personal marker and reject a non-admin. It has **not been run on a hosted database**. Follow the authenticated admin review and comparison procedure in [NEW-SEASON-RELEASE-CHECKLIST.md](NEW-SEASON-RELEASE-CHECKLIST.md); stop on access/schema/identity errors, never interpreting them as missing preferences.

No approved fixture assignment was regenerated or changed. The independent validators still verify both complete drafts, retained time/calendar/pairing rules and the explicit Goldlink/Buckle exception. Source-profile freshness is now checked and locked at staging, final validation and activation; a synthetic later returning-profile change rejects both Validate and Activate locally. Genuine two-session concurrency remains outstanding. If availability changes after staging but before activation, stop: staged discard/restructure is unsupported and needs reviewed recovery rather than a SQL bypass.

## Practical staged admin sequence after a separately authorised migration release

1. Create a private draft from the old season. Select exactly the confirmed entrants; edit the known returning names/readable IDs, preserving source UUIDs. Add Xaywan/Nassaji/Etihad/Buckle with the four reserved UUIDs and readable IDs above. Keep Buckle eligibility enabled. New kits stay unset until confirmed.
2. Inspect current source notes/preferences using authenticated admin access and use the dated organiser confirmation for the four prepared new entrants; review any subsequent changes. Preserve general availability; remove only obsolete finals-specific entries and the single Hunger 19:30 exception from the new profile. Record the explicit Kuq-Umoja exception in the reviewed imported constraints, not by weakening Kuq's other opponents. The standing venue booking already confirms scheduled Mondays/Wednesdays. Decide 2 November participation separately; if cancelled, re-date and review the calendar while retaining the standing booking.
3. Save. The editor reloads persisted status/version and displays draft status. Validate the persisted team structure; unsaved edits cannot be validated. Confirm every selected team's availability before Stage can succeed. The standing venue booking is recognised automatically for the confirmed venue/night; other venues require their own competition booking confirmation.
4. Stage teams and competitions. These planned/unpublished rows remain invisible publicly and reuse the draft competition/team IDs as stable destination UUIDs. Structure/profiles are frozen after staging; no existing season is archived. To change that structure later needs a reviewed discard/rebuild extension, not direct edits.
5. In the review step import `monday-rounds.json` and `wednesday-rounds.json`. Their constraint documents bind readable IDs to the staged UUIDs, with complete round dates/opponent matrices/availability/spacing. Imports are atomic; invalid rules/fixtures leave no partial plan. To replace an import, cancel its previous private change set first.
6. Open Fixtures, select the planned season/night/division, inspect every matchup and warnings, validate, save any item changes, then submit each complete plan for review with warnings acknowledged. Pending-review item fields are read-only; Return to Draft before editing. Ordinary Publish is disabled and rejected by the database for planned fixtures.
7. Return to Seasons and Validate again. Both complete plans must be pending review and match current validation. Their exact review versions are bound to season validation; changing/re-reviewing either requires another season validation. This step still makes nothing public.
8. A future explicitly authorised activation is the first public exposure: it atomically publishes the new fixtures/editions and archives matching old editions, retaining all historical records. Existing automatic public selection then chooses the active editions. Reconcile the JSON fallback with the scheduled/manual refresh procedure and verify deployment separately. This preparation performs no hosted activation or refresh.

## New staging verification and limitations

`scripts/verify-local-season-staging.mjs` is an intentionally retained, URL-free local verification harness. It loads all **seven** migrations into fresh PGlite, with mocked Auth helpers and synthetic data. The identity-only harness intentionally loads the six installed baseline migrations to verify its separate proposals; it does not pretend that its old direct-fixture test is valid for planned editions under the new staging guard.

The staging harness verified new-team creation/null sources, membership IDs/kits, auth rejection, unavailable-profile gate, standing-booking recognition and retained calendar-exclusion gates, Save resetting validation, stale-version rejection, failed import rollback, Kuq required-time exception handling, complete 182+240-match review, anonymous invisibility, staged-structure freeze, direct-publication rejection, binding review versions, and old UUID/fixture/result/adjustment preservation. A forced second-night failure rolled back first-night writes; a successful synthetic rollover was tested only inside a transaction then rolled back. A synthetic Buckle 2-2 draw counted played/points/goals normally. No hosted database or fixture-test service was used.

Reproduce with the existing temporary PGlite install:

```powershell
$taskPgliteEntry = Join-Path $env:TEMP 'fis-local-verification\node_modules\@electric-sql\pglite\dist\index.js'
node scripts/verify-local-season-staging.mjs $taskPgliteEntry
```

Browser verification now passes using installed **Microsoft Edge headless with temporary Playwright Core**, against the production static export and isolated disposable REST/Auth mocks. Every Supabase request was intercepted; no browser request reached production, no external request was issued and no JavaScript page error occurred. This verifies the client workflow; the seven-migration PGlite harness separately verifies the actual database procedures. Browser mocks are not a hosted Auth/PostgREST or integrated browser-to-Postgres claim.

Verified interactions: new entrant with null source/reserved UUID and no inherited kit; standing venue booking; Save resetting validation; unsaved validation/staging blocks; private staging/import; missing-review error message; planned edition selection; fixture Save retaining its editor/receipt; Cancel -> Create restoring proposed fields; unsaved fixture submission blocked; warning acknowledgement; pending-review fields read-only; planned Publish disabled; season re-validation before activation; activation confirmation cancellation and synthetic success; terminal import/Validate disabled; access denial hiding setup controls. Close, Escape, Back and sidebar navigation preserve unsaved season edits when discard is cancelled; cancelling the browser reload warning also preserves the open unsaved editor. The wizard is visually checked at **390, 768 and 1365 pixels**, with no document overflow. Full season labels now wrap without squeezing night tabs.

Browser review fixed three additional issues: season exit had no discard confirmation; Supabase RPC error objects lost their useful validation message; refreshing Fixtures after Save unmounted its editor and lost selection/receipt. Activated drafts also disable import/validation controls. These changes do not alter public competition selection or production data.

All **181 tests**, lint (zero warnings), TypeScript, static build, independent draft validation, legacy import checks, finals checks, snapshot validation/check and whitespace pass. Both local Postgres harnesses pass, including foreign keys/uniqueness, guarded repeat/rollback, anonymous invisibility, 422-match review, second-night failure rollback and history preservation. Browser library, screenshots and mock harness remain under the temporary directory, outside the release diff; the two URL-free database verification scripts are intentionally retained for repeatable migration review.

Complete diff review covers **46 files**: admin workflow/validation, exact identity/reference changes, local schedule/calendar artifacts, regression tests, guarded SQL proposals and operational documentation. Historical JSON comparison allows only the four approved readable-ID substitutions, King ADL's confirmed legacy display-name update and canonical adjustment ordering; every historical score/date/kit/record is preserved. Approved draft fixture arrays are unchanged in this checkpoint. Import UUID seeds retain original IDs. Existing installed migrations, finals history, workflows, rollback tag and runbook are untouched. No credentials, environment files, build output or temporary browser harness are included.

Remaining release-verification gaps: all 26 returning private profiles are inaccessible and the four new entries now have current dated organiser confirmations. The new migration is not installed on hosted services. Hosted Auth/PostgREST/schema-cache behaviour, two-connection concurrency and source-profile freshness with real authenticated access are untested. GitHub Variables authentication and the changed-snapshot -> commit -> Pages chain remain unverified. Staged discard/restructure and historical public-season selection remain unsupported. No production data was manufactured. Local implementation is ready for review; real season staging/activation is not ready until profile gates and a separately authorised migration release are completed.

Release order, returning-profile review, hosted Auth/concurrency gates, GitHub/fallback verification and private staging through atomic publication are recorded in [NEW-SEASON-RELEASE-CHECKLIST.md](NEW-SEASON-RELEASE-CHECKLIST.md). A local Git checkpoint is authorised after checks; it is not a hosted release.


## Scheduling-source reconciliation closed ? 10 October 2026

Organiser correction: Monday King ADL has **no kickoff-time preference currently**. The 19:00 preferred entry was unintentionally added during the Toss rename and is disregarded for this season. No approved fixture assignment changes.

Authorised SQL Editor exports supplied by the organiser: query1/query3 are identical 26-row identity/profile results; query2/query4 are identical four-event King ADL audit results; query5 has the expected 20 schema columns. All 26 requested/stored names, nights and expected editions match. Twenty-five memberships have no structured preference rows, all 26 have no private-note rows. Empty database profiles do not cancel repository/organiser rules. Audit identifies the accidental preference insertion alongside Toss -> King ADL on 10 October 2026 at 07:00:03 Sydney time; old preferences were empty. Provenance and organiser intent are now reconciled. Earlier inaccessible-profile statements above describe the pre-export checkpoint and are superseded by these supplied authenticated results, not by new agent-hosted access.

Retain Monday Blue Dragons no 19:00; Monday Ghazni/Hunger 20:20 or 21:00; Wednesday Rinnai no 19:00; Ghazni soft avoid 21:00; Ibiza soft prefer 20:20/21:00; Umoja always 21:00; Kuq no 21:00 except Umoja; Goldlink/Buckle separation except head-to-head. Preserve four new entrants' current four-slot confirmations, Xaywan exclusions/counts, Wildcats/Nassaji Week 1 and all calendar rules. Hunger's historical one-match 19:30 exception is not carried forward. No individual restriction is invented for otherwise empty profiles.

Prepared **supabase/production/correct-king-adl-kickoff-preference.sql** is a separately authorised future data correction, not executed hosted. It locks the exact source identity, verifies active/published edition, exact preference ID/time/classification/timestamps and profile version 2, deletes only that row, and advances the profile version. Audit triggers retain history; repeat execution is a no-op when already corrected; changed profiles abort. It does not rename teams or edit fixtures/results/kits/notes. Execute before new draft creation; then read back zero preferences and the advanced version.

The local unreleased staging migration rejects the exact accidental source record and stale source snapshots for this UUID. Newly reviewed draft preferences remain editable, including a legitimate future 19:00 preference. Draft creation/copy and later edits are guarded; validation, Stage and activation recheck. Existing stale copied drafts must be recreated/reviewed after correction; do not mask the source or weaken freshness checks. A legitimate future organiser preference needs ordinary renewed profile review/confirmation; no migration amendment is required simply to use 19:00.

Reconciliation is closed for the supplied evidence/current organiser decisions. This is not production cleanup or activation approval. The correction itself remains pending separate write authorisation. GitHub configuration and naturally changed snapshot-to-Pages verification remain outstanding.

## Reviewed follow-up checkpoint - 10 October 2026

The six original follow-up files were reviewed and a practical fixture-review document added. The King ADL guard is now scoped to the exact accidental row and stale source snapshots, rather than permanently prohibiting 19:00. Disposable regression coverage accepts both a newly reviewed draft preference and a distinct future stored source preference at 19:00. The correction remains an exact, audited deletion with version advance, guarded rollback and safe repeat; no production execution.

Real PostgreSQL 17 on an ephemeral loopback cluster now verifies independent concurrent sessions: competing profile saves and draft saves demonstrably wait on locks and reject the stale writer; activation waits for a fixture review edit and rejects its outdated validation. All seven migrations, 30 memberships, 422 reviewed fixtures, failed imports, second-night activation failure rollback, safe retry and archived history preservation pass. SQL roles/grants/RLS are real; Auth helper functions remain mocked. The retained verifier accepts no hosted URL. Its failure exit status is preserved despite the temporary PostgreSQL library's shutdown hook.

Edge checks of the production export repeat the admin journey with intercepted disposable REST/Auth mocks at 390/768/1365px. Separately, anonymous public DTOs from actual disposable PostgreSQL activation verify Monday/Wednesday active-season selection, 14/16-team standings, empty new-season results, upcoming fixture form placeholders and preserved labelled 2026 S1 finals at 390/1365px. Home fixtures also show current-season form. Forced live-read failure retains the existing JSON fallback; restoring the disposable live response recovers correctly. No page errors, overflow or hosted mutations occurred. These browser checks are mocked HTTP transport, not hosted Auth/PostgREST integration.

[Practical fixture review](NEW-SEASON-FIXTURE-REVIEW.md) records both Week 1 tables, all kickoff distributions, dates/totals/streaks and soft exceptions. Approved Monday/Wednesday files remain identical to e013330. All 181 application tests, lint and TypeScript pass; the unchanged application production build and unaffected import/finals/snapshot checks are reused from e013330. The final reviewed SQL verifier and whitespace checks pass. Temporary libraries/harnesses/screenshots, personal exports, credentials and build output are excluded.

Read-only metadata confirms expected hosted tables/RLS and supplied schema evidence. The migration-history API returns an empty list, so actual installed effects must be checked rather than blindly rerunning baselines. Automatic approval review rejected the proposed production SQL preflight because this task prohibits executing production SQL; it was not run. GitHub public API shows successful Pages run 37992904367 and successful refresh 38012665030 with downstream Pages 38012696221 skipped, all on master 628a1da. Variables return 401 and authenticated Pages configuration remains unavailable (404 is not proof of absent configuration).

Next outstanding release step: separately authorised compatibility/grant/schema-cache preflight and actual hosted JWT/PostgREST checks on explicitly disposable infrastructure, plus authenticated GitHub configuration verification. Local SQL concurrency is completed; hosted request-level concurrency remains outstanding. Then follow the checklist's exact correction -> staging migration -> readable IDs -> matching application order. Never combine alternative membership provisioning with Stage. Changed-snapshot -> commit -> Pages remains untested; the checklist gives an exact future naturally changed-data and forced-fallback procedure. No production SQL, activation, publication, push, merge, deployment or production dispatch occurred.

## Final authorised read-only release package - 10 October 2026

User explicitly superseded the earlier SQL prohibition for read-only diagnostics. Production target verified against repository configuration; PostgreSQL 17.6 baseline columns, constraints/indexes, admin RLS/grants and RPC definitions inspected. All 32 repository baseline function bodies match hosted definitions after normalisation. The history relation is absent, explaining the empty migration API; no baseline reinstallation. Proposed staging additions remain absent. King ADL remains mon-toss/profile version 2 with the exact accidental row; correction is still prepared only.

Public-key production REST reads pass; private draft/profile reads are denied and private schema excluded. Authenticated SQL role without JWT is not admin/has zero private rows, not proof of actual JWT authentication. Signed-in Supabase confirms public/graphql_public exposure. Signed-in GitHub confirms both production Variables (configured key length/fingerprint matches tested public key), Pages Actions source/custom domain/DNS/HTTPS, Pages 37992904367 and no-change refresh 38012665030. No credential values disclosed, hosted writes/configuration changes, or production dispatch.

The grant review found table-wide TRUNCATE/REFERENCES/TRIGGER for authenticated on private draft tables. The unreleased staging migration now removes these narrowly scoped privileges while retaining admin-gated DML; regression injects hosted-like defaults before migration and verifies removal. A genuine independent-session duplicate activation test confirms only one commit, stale loser/retry rejection and no duplicate fixtures. Existing source freshness/races/rollback/history tests pass. Validator output now accurately directs private-profile reconciliation to this report rather than claiming it remains inaccessible.

Both approved drafts revalidate unchanged. All 181 tests/lint/TypeScript pass; unchanged application build and browser evidence are reused. [Single release runbook](NEW-SEASON-RELEASE-RUNBOOK.md) records SQL/files/commands/order, both Week 1 tables, linked full kickoff distributions, calendar/cancellation summary, private review/atomic publication and recovery limits. Wizard-generated fresh UUIDs are stable after Save/Stage; the reservation document is not a second SQL step. Remaining gates: actual FIS-admin/non-admin/expired JWT checks, hosted concurrency on explicitly disposable infrastructure, and naturally changed-snapshot -> commit -> Pages/forced fallback during an authorised release. No production mutation, activation/publication or external release action.
