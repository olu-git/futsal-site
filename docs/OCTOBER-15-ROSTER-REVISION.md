# October 15 roster revision — applied and verified

## Confirmed decisions

- Monday expands from 14 to 16 active teams: return AFG using its retained mon-afg UUID; add Black Magic under a distinct new UUID/readable ID mon-black-magic. Hope remains retired. Buckle City and Kroos Kontrol remain independent teams.
- Both nights use 30 rounds, 240 matches, 30 games/team. Every pair meets twice, once home and once away, once in each half. The organiser explicitly removed Monday's previous Xaywan exclusions and extra/reduced pairing counts.
- Monday Bunyip may play only 19:00 or 19:40, hard. All other confirmed availability, Goldlink/Buckle non-simultaneous kickoff and calendar rules remain.
- Wednesday remains 16: replace departing Unathletico with a distinct new Xaywan membership/readable ID wed-xaywan. Do not reuse Kuq E Zi's identity/history or the Monday Xaywan UUID. Retain AFG. Buckle City counts normally in standings despite acting as a fill-in team.
- Monday AFG–Black Magic is an organiser-awarded 3–3 draw, Round 1, 12 October, 21:00 Court 2.
- Wednesday Misfits–Buckle City is an organiser-awarded 3–3 draw, Round 1, 14 October, 19:00 Court 1. AFG–MTS FC is a confirmed awarded 0–5 win for MTS, 19:00 Court 2, forfeit_side home.
- No public notes on these awarded results. Internal transaction/rehearsal records retain the decision history.

## Approved and applied Wednesday Round 1 (names at application)

| Time | Court | Home | Score | Away |
|---|---|---|---|---|
| 19:00 | 1 | Misfits | 3–3 | Buckle City |
| 19:00 | 2 | AFG | 0–5 | MTS FC |
| 19:40 | 1 | Etihad FC | 5–1 | Goldlink Up |
| 19:40 | 2 | Kuq E Zi | 10–10 | Ghazni United |
| 20:20 | 1 | Xaywan | 5–7 | Rinnai |
| 20:20 | 2 | Ibiza | 5–2 | King ADL |
| 21:00 | 1 | Pops | 4–12 | Umoja Stars |
| 21:00 | 2 | Hazara United | 9–9 | Wildcats |

Etihad/Goldlink, Pops/Umoja and Hazara/Wildcats keep their existing court assignments and home/away allocation. The other 19:40/20:20 court assignments preserve the existing slots; the organiser supplied their times but did not separately confirm physical courts. These assignments were subsequently approved and applied; physical courts were not independently observed.

## Calendar and validation

Monday: 12 October 2026 through 31 May 2027. Wednesday: 14 October 2026 through 26 May 2027. No finals dates. Shared season metadata ends_on must extend from 26 to 31 May to contain the 30-round Monday plan. Wednesday still ends on 26 May based on its actual fixtures.

Keep Wednesday 28 October closed, Christmas break after 23 December until 11 January, existing Labour Day/Easter Monday exclusions and provisional Monday 2 November. If 2 November is later cancelled and rounds roll forward, Monday's last round shifts to 7 June 2027; this alternative is not applied.

Independent TypeScript validation passes: 16 teams, 30 complete rounds, 240 fixtures per night; 15 home/15 away per team; maximum home/away streak 3; one match per team per round; no court/time collision; minimum rematch gap four rounds; all two-meeting pairs split across halves; Bunyip early-only, Blue Dragons/Rinnai no-19:00, Umoja 21:00, Kuq no-21:00 except Umoja, and Goldlink/Buckle separation. All seven existing Monday result fixtures are byte-for-byte preserved.

Soft exceptions: only the already-played Monday Kroos Kontrol–Misfits 21:00 match, and Wednesday Ghazni–Umoja at 21:00 in rounds 9 and 24 (16 December and 14 April). No future Monday soft exceptions and no other Wednesday soft exceptions. Wednesday's earlier ten Ghazni 19:00 and nine King ADL 19:00 exceptions are removed in this proposed plan.

The solver first maximised same-round opponent retention, then retained home orientation, subject to strict format and max-three streaks. Optimal solutions retain 144 of 175 existing future Monday pairings and 218 of 232 future Wednesday pairings (after mapping the departed Unathletico slot to new Xaywan for comparison). Time assignment then prioritised soft preferences, existing kickoff/court and kickoff distribution. The planned transaction creates 58 fixtures, changes 116 existing fixture rows and adds nine results. It does not delete fixtures or old identities.

## Artifacts and checks

- docs/drafts/roster-revision-2026-10-15.json: complete local review plan, both nights.
- docs/drafts/roster-revision-2026-10-15.sql: guarded atomic application transaction. Applied after explicit approval; do not rerun.
- scripts/lib/validate-roster-revision.ts and tests/roster-revision.test.ts: independent current-format validator and regressions. Original 14-team drafts remain historical preparation evidence and are not overwritten.
- tests/season-names.test.ts: removes the old 182-match assumption, checking that naming preserves the actual complete snapshot fixture identities. This test-only change must be released before the scheduled refresh can accept a 240-match Monday snapshot; otherwise the existing runner test fails safely and preserves the previous fallback.

202 tests, lint, non-incremental TypeScript, static build and whitespace checks pass. Disposable PostgreSQL 17 rehearsal passed explicit rollback, injected failure rollback, stale fixture rejection, repeat rejection, foreign keys/uniqueness, preservation of all existing results/audits/archived fixtures, and AFG's expected 1 played/1 draw/3 GF/3 GA/1 point. Historical production fixture hash at capture: 47318fb03a7fcfc62f37b136a02edb16. New fixture/result rows increase the full rehearsal to 806 fixtures and 342 results including archives.

The local restore seed briefly disabled result user triggers to restore original publication timestamps, then re-enabled them and asserted none disabled before testing. The production SQL contains no trigger/RLS disabling, schema changes, role changes or fabricated authentication. Direct SQL publication, if approved, uses honest SQL-session audit attribution; no claim of authenticated UI result publication.

Temporary baseline/solver/disposable clusters are inside the ignored node_modules/.cache/fis-preparation-20261015 directory in futsal_site, not claude_cert. Servers are stopped; retain the baseline until approval/application, then clean up. No credentials, private contact exports, temporary harnesses or build output are proposed for Git.

## Earlier approval block (resolved by explicit approval)

Automatic approval review rejected the production transaction because confirmation of the data decisions was not accepted as approval to apply this exact large production mutation. No production mutation occurred; read-only postcheck still shows Monday 14 active teams, Wednesday 16, 422 current fixtures and seven published results. Do not retry indirectly.

Request explicit approval to apply this exact rehearsed transaction (58 new fixtures, 116 changed existing rows, nine results, two new memberships, Monday AFG return, Wednesday Unathletico withdrawal, Bunyip preference, season end 31 May). Separately request the required test-fix release and snapshot refresh so the fallback can follow the live update. No local commit/push, dispatch or deployment has been performed for this revision. Preserve unrelated AGENTS.md changes.

## Applied release receipt — 15 October 2026

The organiser explicitly approved the exact rehearsed transaction and the test-only release/refresh. The previously rejected transaction was then accepted and applied successfully. SQL SHA256 at execution: 01051e5a7e65935eb7309070ea90263435d6e0cabcdc60297a84db8ecc1ae288. No schema, role, RLS or production-trigger changes. All baseline and protected-history guards passed.

Production postflight confirms 16 active/eligible teams, 240 fixtures and eight published Round 1 results per night. The shared season ends_on is 31 May 2027. Every one of the 480 stored fixture assignments exactly matches the approved local plan; all previous seven Monday result rows remain unchanged. Historical fixture hash remains 47318fb03a7fcfc62f37b136a02edb16 and historical result hash remains 6516d92b598ea84034ea8d84709ee104. Both awarded 3–3 draws have null public_note. Wednesday AFG 0–5 MTS is recorded as a home forfeit; other supplied scores are normal results.

New memberships: Monday Black Magic UUID 38580a95-ab89-5ddd-a71d-c31ed05de4bd, mon-black-magic; Wednesday Xaywan UUID 435af587-f6ea-5030-a097-94ad466481c2, wed-xaywan. Kits remain unspecified/null rather than inferred. Existing Monday AFG and Wednesday Kuq E Zi retain their UUID/history. Unathletico is withdrawn/ineligible but retained; Monday Hope is still retained/inactive. Therefore each snapshot night has 17 membership records including one inactive team, while public active count/standings are 16.

Only tests/season-names.test.ts was committed/pushed: e1d9e4a0e5e63777e464d7bd4858728b3a755480. Manual master refresh https://github.com/olu-git/futsal-site/actions/runs/38710922883 succeeded: production public configuration, changed-snapshot freshness, tests/finals and guarded snapshot commit all passed. It created fb5b2e29052bbbdae82f4786953b93da095ca65b. Pages https://github.com/olu-git/futsal-site/actions/runs/38711039776 succeeded. Local master fast-forwarded after verifying identical local/remote snapshot blob d4f45b9a6c36b5bca1f8001f5b1a99938053f66c. Remaining preparation files stay uncommitted.

Raw deployed /_next/static/chunks/3k6o9tb62bpq9.js contains an exact JSON match to the anonymous-production snapshot: 480 fixtures, 16 completed, 32 active teams, 326 archive fixtures. Bundle SHA256 59098440b0390fda5a425457c126435b99500c781854454a8e9b38e1b8455e10. Home and both competition pages returned HTTP 200; competition static HTML contains 2026 Season 2 and 16 TEAMS.

Fresh 202 local tests and finals check passed against the new snapshot, alongside earlier lint, TypeScript/build and the successful deployed Actions checks. Anonymous live data and deliberately failed-read fallback yield equal presented fixtures, results, kits, standings, form and archive views, accounting for the intended UUID/readable-ID mapping. Actual FixtureList/LeagueTable rendering checks show 80 form badges across each eight-game upcoming round, none in results, and 16 standings rows. Next rounds are Monday 19 October and Wednesday 21 October, eight games each.

Verification limitation: no fresh visual browser sign-off. Automatic review rejected inspection of an unrelated private Google Sheets window; it was not inspected. A clean-tab attempt from the public FIS window then timed out waiting for Computer Use app approval. The approved workflow was dispatched successfully via the official GitHub API using existing Git authentication only in memory, without logging credentials. No bypass of private-window inspection or access controls occurred. Forced fallback was verified through the shared failure-selection path and rendered public components, not an interactive forced-fallback browser session. Hosted concurrent editing was not retested.

After these receipts were recorded, stopped disposable PostgreSQL clusters, raw seed/baseline copies, solver dependencies and temporary harnesses were removed from the ignored repository cache. No new FIS assets were placed in claude_cert; production recovery/off-site backups were untouched. Old screenshot paths in earlier historical checkpoints may no longer exist after organiser-authorised cleanup.

## Team notes follow-up — 16 October 2026

Applied the organiser's newly supplied profile changes only: Wednesday Pops soft avoid 21:00; current Wednesday Hazara United renamed Kawsar FC on unchanged UUID 3a2cbf2d-326d-4a3b-bd94-56ac4f46a999/readable ID wed-hazara-united/white kit. Both profiles advanced version 1 -> 2. Other saved rules already match: Blue Dragons/Rinnai hard no19:00, Bunyip hard19:00/19:40-only, Salvos soft avoid21:00, both Ghazni soft avoid19:00/21:00, Umoja strict21:00. Organiser explicitly retained Kuq E Zi's 21:00 exception against Umoja, with all other Kuq opponents earlier. No fixture or result row changed; all-fixture hash 7c61ac7435b0faa7eaeb0b03d31bd8ba and all-result hash fb8afcb4c1e8fe901add297074502ab0 remained identical. Both archived Hazara United records retain their names/history.

Pops future soft exceptions: 13 January 2027 vs Xaywan, 3 February vs Buckle City, 17 February vs Umoja Stars, 19 May vs Buckle City, all21:00. The already-played 14 October vs Umoja also remains21:00. The Umoja games follow Umoja's hard rule; three other future games are candidates for an earlier kickoff but have not been rescheduled. The current validation helper/regression now reports Pops exceptions as soft, without affecting the preserved pre-October-15 draft rules. Fresh production read finds zero future violations of the named hard availability rules.

The guarded two-profile SQL is retained in docs/drafts/team-profile-update-2026-10-16.sql as an applied receipt; repeat attempts reject stale versions. The local public snapshot reflects Kawsar FC, preserving the legacy ID, archives, fixtures and results. Snapshot validation and anonymous production freshness pass. All203 tests, lint, TypeScript, static build and whitespace checks pass. No commit/push/deployment/manual workflow dispatch was performed for this follow-up. The deployed fallback will receive the rename through the existing scheduled refresh; no claim that it is refreshed already. Retain other local preparation changes and AGENTS.md edits.


## Final Week 1 results and standings verification â€” 16 October 2026

All results below were verified read-only against production and the generated fallback, then standings were independently recalculated from the organiser-confirmed scores. No result was inserted again and no SQL receipt was rerun.

### Monday 12 October

| Match | Result |
|---|---|
| Goldlink Up â€“ Xaywan | 4â€“2 |
| Wildcats â€“ Nasaji FC | 8â€“9 |
| Blue Dragons â€“ Buckle City | 5â€“0 |
| Bunyip â€“ Declan's Delinquents | 1â€“6 |
| Gay Guys â€“ Salvos | 7â€“7 |
| Ghazni United â€“ King ADL | 12â€“5 |
| Kroos Kontrol â€“ Misfits | 4â€“6 |
| AFG â€“ Black Magic | 3â€“3 |

| Team | P | W | D | L | GF | GA | GD | Pts |
|---|---|---|---|---|---|---|---|---|
| Ghazni United | 1 | 1 | 0 | 0 | 12 | 5 | 7 | 3 |
| Declan's Delinquents | 1 | 1 | 0 | 0 | 6 | 1 | 5 | 3 |
| Blue Dragons | 1 | 1 | 0 | 0 | 5 | 0 | 5 | 3 |
| Misfits | 1 | 1 | 0 | 0 | 6 | 4 | 2 | 3 |
| Goldlink Up | 1 | 1 | 0 | 0 | 4 | 2 | 2 | 3 |
| Nasaji FC | 1 | 1 | 0 | 0 | 9 | 8 | 1 | 3 |
| Gay Guys | 1 | 0 | 1 | 0 | 7 | 7 | 0 | 1 |
| Salvos | 1 | 0 | 1 | 0 | 7 | 7 | 0 | 1 |
| AFG | 1 | 0 | 1 | 0 | 3 | 3 | 0 | 1 |
| Black Magic | 1 | 0 | 1 | 0 | 3 | 3 | 0 | 1 |
| Wildcats | 1 | 0 | 0 | 1 | 8 | 9 | -1 | 0 |
| Kroos Kontrol | 1 | 0 | 0 | 1 | 4 | 6 | -2 | 0 |
| Xaywan | 1 | 0 | 0 | 1 | 2 | 4 | -2 | 0 |
| Bunyip | 1 | 0 | 0 | 1 | 1 | 6 | -5 | 0 |
| Buckle City | 1 | 0 | 0 | 1 | 0 | 5 | -5 | 0 |
| King ADL | 1 | 0 | 0 | 1 | 5 | 12 | -7 | 0 |

### Wednesday 14 October

| Match | Result |
|---|---|
| Goldlink Up â€“ Etihad FC | 1â€“5 |
| Kuq E Zi â€“ Ghazni United | 10â€“10 |
| Xaywan â€“ Rinnai | 5â€“7 |
| Ibiza â€“ King ADL | 5â€“2 |
| Kawsar FC â€“ Wildcats | 9â€“9 |
| Pops â€“ Umoja Stars | 4â€“12 |
| AFG â€“ MTS FC | 0â€“5 |
| Buckle City â€“ Misfits | 3â€“3 |

| Team | P | W | D | L | GF | GA | GD | Pts |
|---|---|---|---|---|---|---|---|---|
| Umoja Stars | 1 | 1 | 0 | 0 | 12 | 4 | 8 | 3 |
| MTS FC | 1 | 1 | 0 | 0 | 5 | 0 | 5 | 3 |
| Etihad FC | 1 | 1 | 0 | 0 | 5 | 1 | 4 | 3 |
| Ibiza | 1 | 1 | 0 | 0 | 5 | 2 | 3 | 3 |
| Rinnai | 1 | 1 | 0 | 0 | 7 | 5 | 2 | 3 |
| Ghazni United | 1 | 0 | 1 | 0 | 10 | 10 | 0 | 1 |
| Kuq E Zi | 1 | 0 | 1 | 0 | 10 | 10 | 0 | 1 |
| Kawsar FC | 1 | 0 | 1 | 0 | 9 | 9 | 0 | 1 |
| Wildcats | 1 | 0 | 1 | 0 | 9 | 9 | 0 | 1 |
| Buckle City | 1 | 0 | 1 | 0 | 3 | 3 | 0 | 1 |
| Misfits | 1 | 0 | 1 | 0 | 3 | 3 | 0 | 1 |
| Xaywan | 1 | 0 | 0 | 1 | 5 | 7 | -2 | 0 |
| King ADL | 1 | 0 | 0 | 1 | 2 | 5 | -3 | 0 |
| Goldlink Up | 1 | 0 | 0 | 1 | 1 | 5 | -4 | 0 |
| AFG | 1 | 0 | 0 | 1 | 0 | 5 | -5 | 0 |
| Pops | 1 | 0 | 0 | 1 | 4 | 12 | -8 | 0 |


Final release review: current Kawsar FC snapshot 53b910e arrived through scheduled refresh 38831626274, followed by successful Pages run 38831717754. Its snapshot blob exactly matched the preserved local generated reference before fast-forwarding. All 480 production assignments match the approved plan; both nights retain 15 home/15 away per team, max streak three and zero hard availability violations. Three future non-Umoja Pops21:00 fixtures remain soft-preference exceptions, deliberately unchanged. No production writes were needed during this final release review. Both applied SQL files now carry an explicit receipt-only/do-not-rerun banner; execution hashes earlier in this report refer to the original applied content.

The final checkpoint commits only reviewed plans/receipts, validation code/tests and current documentation. It excludes the unrelated generated AGENTS.md edit, credentials, temporary harnesses, seed exports and build output. Verification remains automated-only as requested by the organiser.
