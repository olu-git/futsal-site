# Monday Week 1 update checkpoint — 13 October 2026

## Completed production amendments

Explicitly approved guarded SQL was rehearsed against disposable PostgreSQL 17, then applied atomically. Existing audit triggers and constraints remained enabled. No schema, role or access-control changes were made.

Monday now has 14 active teams: Goldlink Up, Wildcats, Blue Dragons, Bunyip, Gay Guys, Ghazni United, King ADL, Declan's Delinquents, Misfits, Salvos, Xaywan, Nasaji FC, Buckle City and Kroos Kontrol. Distinct Monday memberships replace AFG and Hope; their original identities/history remain retained as replaced/ineligible memberships. Gay Guys and Nasaji FC retain their existing UUIDs and readable IDs.

All seven confirmed Monday 12 October results are published:

| Time | Court | Result |
|---|---|---|
| 19:00 | 1 | Nasaji FC 9–8 Wildcats |
| 19:00 | 2 | Xaywan 2–4 Goldlink Up |
| 19:40 | 1 | Blue Dragons 5–0 Buckle City |
| 19:40 | 2 | Bunyip 1–6 Declan's Delinquents |
| 20:20 | 1 | Gay Guys 7–7 Salvos |
| 20:20 | 2 | Ghazni United 12–5 King ADL |
| 21:00 | 1 | Kroos Kontrol 4–6 Misfits |

Blue Dragons/Buckle City is an ordinary result; no forfeit was inferred. SQL publication has no authenticated UI user attribution; published_by is null, not a fabricated admin identity.

## Schedule and preferences

72 Monday fixture rows amended, including substitutions and actual played opponents; 29 kickoff changes and one future Round 10 home/away swap. Every team retains 26 matches, 13 home/13 away, maximum consecutive home/away streak 3; 182 Monday fixtures remain. No pairing exceeds three; Xaywan exclusions and Goldlink/Buckle separation are retained. All 182 stored assignments exactly match the reviewed plan. The played Kroos Kontrol 21:00 match is the sole Monday soft exception; future Monday assignments satisfy recorded hard/soft preferences.

Organiser's latest availability supersedes earlier assumptions: unmentioned teams accept all valid slots, except explicitly retained Umoja strict 21:00 and Kuq no-21:00 except versus Umoja. Blue Dragons Monday and Rinnai Wednesday hard no-19:00. Ghazni both nights soft avoid19:00/21:00; Bunyip, Salvos and Kroos soft avoid21:00; King ADL soft avoid19:00. Gay Guys is no longer hard late-only. Supplied kits saved using existing UI preset colours. Monday Buckle City kit remains unspecified, not invented.

Seven existing Wednesday profiles updated for supplied colours/preferences only. Wednesday roster and all 240 fixtures remain unchanged, including AFG pending separate instructions. Thus the stored Wednesday active roster remains 16, although AFG has reportedly left. The unchanged Wednesday draft retains 12 Ghazni soft exceptions. No Wednesday membership or fixture change was made.

## Preservation and verification

Historical fixtures/results/adjustments/UUID relationships were guarded and preserved; 326 historical fixtures retain hash 47318fb03a7fcfc62f37b136a02edb16. Safe rollback, stale baselines, mid-transaction failure, repeat rejection and archive preservation passed on disposable PostgreSQL 17. Hosted simultaneous editing/authenticated RPC publication was not exercised by these SQL tests.

All 196 local tests, lint, TypeScript, static build, snapshot validation/freshness, finals and whitespace checks passed before release. Only tests/season-names.test.ts was authorised for commit/push: 661b285 counts upcoming plus completed fixtures instead of treating all 182 as upcoming. Other planning/report/proposal files remain local and uncommitted. Initial combined production update was rejected by automatic approval review for scope concerns; strictly Monday and separate existing Wednesday-profile-only transactions were subsequently accepted and applied.

Refresh/deployment receipt pending below; previous scheduled refresh failed its stale upcoming-only test and preserved the old fallback. Do not rerun the applied SQL proposals: baseline guards intentionally reject repeats.

## Release receipt

Test-only commit 661b2856f36f8f83ef852c314a1233623a329206 pushed to master. Manual refresh run https://github.com/olu-git/futsal-site/actions/runs/38335767409 succeeded and created snapshot-only commit 0418ae49615cce54c12402ae6557038ff6aa48b7. Pages run https://github.com/olu-git/futsal-site/actions/runs/38335821802 succeeded. Local master fast-forwarded after verifying the bot snapshot blob exactly matched the preserved local snapshot.

Deployed JavaScript /_next/static/chunks/0r7qewngl6q8k.js contains an exact JSON match to refreshed master: 422 current fixtures, 32 membership records (30 active across both nights plus two retained replaced Monday records), 326 archived fixtures, year-first season names. Bundle SHA256 7af89d6eae989c654f263334772983de826273a33ef1914f5e568fb959b4c5b6.

Read-only localhost proxy served actual deployed assets with CSP connect-src none. Forced-fallback Monday displayed snapshot notice, 14 standings teams, all seven exact scores and current form; live production rendered the identical Results DOM with no fallback notice. At 390px, five-box form rendered without page overflow. Home showed new Monday Round 2 and form. Wednesday fallback retained its 16-team Round 1 schedule. Screenshots and proxy/harness remain outside Git in claude_cert. This release exercised changed snapshot -> commit -> successful Pages -> raw deployed JSON -> forced fallback, rather than only a no-change refresh.

Other local preparation files remain uncommitted. Concurrent unrelated FIS TV/gallery changes were observed after the push and preserved; none were included in 661b285 or the snapshot-only bot commit. Wednesday AFG withdrawal/fixture replacement remains deferred; Monday Buckle kit is unspecified. No claim of fresh hosted concurrent-edit or authenticated result-RPC testing.

## Follow-up confirmation — 13 October 2026

Organiser confirmed Monday Buckle City wears black. A guarded single-profile update saved kit_colour #111111 and advanced profile_version 2 -> 3 on UUID 997291fd-33ff-40cc-9fd8-be732f6e07ca. No preferences, fixtures, results, identities or Wednesday records changed. Original amendment JSON/SQL intentionally retain the pre-application proposal and baseline; this later confirmation is not folded into that historical transaction. Its fallback will reconcile through the existing scheduled refresh; no new manual dispatch or push was authorised in this follow-up.

Wednesday changes remain deferred. The twelve Ghazni soft exceptions were freshly verified in production:

| Round | Date | Time | Court | Opponent |
|---|---|---|---|---|
| 3 | 4 Nov 2026 | 19:00 | 2 | Hazara United |
| 4 | 11 Nov 2026 | 19:00 | 2 | Unathletico |
| 7 | 2 Dec 2026 | 19:00 | 2 | Buckle City |
| 9 | 16 Dec 2026 | 21:00 | 1 | Umoja Stars |
| 10 | 23 Dec 2026 | 19:00 | 1 | King ADL |
| 11 | 13 Jan 2027 | 19:00 | 2 | Wildcats |
| 18 | 3 Mar 2027 | 19:00 | 2 | Hazara United |
| 19 | 10 Mar 2027 | 19:00 | 2 | Unathletico |
| 21 | 24 Mar 2027 | 19:00 | 2 | Misfits |
| 22 | 31 Mar 2027 | 19:00 | 2 | Buckle City |
| 24 | 14 Apr 2027 | 21:00 | 1 | Umoja Stars |
| 26 | 28 Apr 2027 | 19:00 | 2 | Wildcats |

These are preference exceptions, not hard availability violations. Umoja requires 21:00, so its two matches cannot move earlier without changing that rule. The ten early matches remain as approved; no rescheduling feasibility optimisation was attempted. Separately the unchanged Wednesday draft has nine King ADL soft avoid-19:00 exceptions (not part of the twelve Ghazni entries).

Reviewed planning changes, tests and amendment receipts are authorised for a local checkpoint commit only. Fresh full checks: 199 tests, lint, TypeScript and static build passed. FIS TV changes and generated AGENTS.md edits remain outside this checkpoint. No secrets, private exports, temporary verification harnesses or build output are included.
