# Monday 19 October 2026 results

Published on 20 October at the organiser's request. Round 2 now records the matches actually played. No roster change, season rebalance or future-fixture repair was requested or performed.

| Time | Court | Home | Score | Away |
|---|---|---|---|---|
| 19:00 | 1 | Salvos | 5-1 | Bunyip |
| 19:00 | 2 | Xaywan | 2-10 | Black Magic |
| 19:40 | 1 | Misfits | 7-3 | Blue Dragons |
| 19:40 | 2 | Ghazni United | 11-3 | Imole United |
| 20:20 | 1 | Goldlink Up | 6-7 | Kroos Kontrol |
| 20:20 | 2 | Declan's Delinquents | 7-9 | Wildcats |
| 21:00 | 1 | Gay Guys | 4-12 | Nasaji FC |
| 21:00 | 2 | AFG | 5-4 | King ADL |

## Identity and fixture handling

Hunger resolves to the already-renamed Monday Gay Guys (`mon-hunger-fc`); Ghazni is Ghazni United, Nasaji is Nasaji FC, and the supplied Declan's spelling resolves to the existing Declan's Delinquents. No identities were created or renamed. Bold text was not interpreted as indicating winners; the supplied scores determine outcomes.

All eight existing fixture UUIDs are retained. The four unchanged opponent pairs retain their existing UUIDs even where home/away order or court/time changed. The remaining four fixtures were matched to preserve one team per original fixture and minimize unnecessary slot changes. Seven fixture rows needed structural updates; Xaywan-Black Magic was unchanged. The transaction temporarily unpublished/re-published only the seven changed rows to free court slots atomically, then inserted eight revision-1 published regulation results. No forfeits or public notes were invented.

## Preservation and verification

- Transaction guards rejected baseline drift, any existing Round 2 result, incorrect teams, duplicate participation or court collisions. Current Monday edition status was checked. Audit and result-validation triggers stayed enabled; no user identity was impersonated.
- All fixtures outside the seven changed Round 2 rows, all previous result versions, all teams, private notes/preferences, adjustments, seasons, competition editions and prior audit records were protected by before/after hashes. Exactly 22 audited writes occurred: 14 fixture updates and eight result inserts.
- Every Monday team appears once in Round 2; all eight slots match the organiser's report. All 16 active Monday teams now have two games played. Monday has 16 published results; Wednesday remains at eight.
- Independent expected totals from the two weeks' scores match every active team's goals, points and goal difference: combined GF = GA = 178, combined points = 46. Leaders are Ghazni United (6 points, GD +15), Nasaji FC (6, +9), Misfits (6, +6). Upcoming form reflects these scores.
- The generated anonymous fallback exactly matches production. A separate comparison verifies that every other round, Wednesday fixtures/results, archived records and public team data are unchanged.
- Existing season-wide pairing/home-away balance is intentionally not repaired. Because actual opponents changed in Round 2, earlier double-round-robin balance claims describe the original plan, not a newly validated balanced season. Await the organiser's forthcoming roster updates before proposing later changes.

Applied receipts: `docs/drafts/monday-results-2026-10-19.json` and `.sql`. Do not rerun. Before fixture hash: `112e49816a66ac36d720945fd87c9227`; after: `6273eaa9139b8d0b7e4b61620fade025`. Before result hash: `fb8afcb4c1e8fe901add297074502ab0`; after eight new results: `fe6466938945a2afc1c948daa5f1318a`.

The organiser authorised commit/push after entry. Release includes the generated fallback, applied receipts and this handoff evidence; no application code or workflow configuration changes are needed. Temporary verification harnesses, credentials and build output stay outside Git.

Local release checks passed: 207 tests, production static build, snapshot validation/freshness and the independent published-data verification. No application source changes were made; CI repeats the repository release checks.
