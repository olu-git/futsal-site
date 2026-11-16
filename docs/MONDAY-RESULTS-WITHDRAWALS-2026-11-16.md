# Monday 16 November results and 14-team revision

**Applied on 17 November 2026, transaction `1797`, with explicit organiser approval.** The organiser confirmed the two changed games' 19:40 Court 1/2 slots and selected 26 matches per remaining team, counting all played results. Bunyip and Monday Buckle City withdraw after this round. Wednesday is unchanged.

## Confirmed played games

| Time | Court | Home | Score | Away |
|---|---|---|---|---|
| 19:00 | 1 | Salvos | 3–7 | Buckle City |
| 19:00 | 2 | Wildcats | 2–10 | Nasaji FC |
| 19:40 | 1 | Ghazni United | 6–6 | Kroos Kontrol |
| 19:40 | 2 | Xaywan | 9–8 | Bunyip |
| 20:20 | 1 | AFG | 5–5 | Goldlink Up |
| 20:20 | 2 | Blue Dragons | 7–12 | Black Magic |
| 21:00 | 1 | Kabul Commandos | 8–2 | Misfits |
| 21:00 | 2 | Jaghori FC | 7–3 | King ADL |

Only the two 19:40 opponents need correcting. All eight are ordinary scores, without invented forfeit flags or notes. Existing identities, fixture IDs, earlier scores and audit history remain preserved.

## Future season

The 14 remaining teams each finish with 26 games including their retained results against the withdrawing teams. There are 21 future rounds of seven games, from 23 November 2026 through **10 May 2027**. All current playing dates, Christmas and public-holiday exclusions are preserved; no finals dates are added. The shared season end remains unchanged because Wednesday continues into June.

Four remaining-team pairs meet once: **Jaghori FC–Nasaji FC, Jaghori FC–Salvos, Xaywan–Salvos, Goldlink Up–Salvos**. The other 87 pairs meet twice, once at home each. These four reductions are required by the eight retained appearances against departing opponents; no pairing exceeds two meetings. All teams play once per future round.

Keeping the actual home/away assignments against departing opponents leaves five home and three away appearances for the remaining teams. Equal 13/13 totals for all 14 are therefore impossible: this plan gives Goldlink 14 home/12 away and every other team 13/13, the smallest aggregate deviation. Home/away streaks remain at most four. Existing short rematches fixed by played results remain recorded; future rematch gaps retain the prior minimum capped at four rounds.

Future games respect AFG's no-21:00 and Blue Dragons' no-19:00 rules. There are zero future avoid-time exceptions for Ghazni, Salvos, Kroos or King ADL. Bunyip's historical availability is preserved with its profile; its withdrawal removes it from future scheduling. Monday's Goldlink/Buckle simultaneous-play restriction becomes moot once Buckle withdraws; Wednesday's restriction remains unchanged.

## Published 23 November round

| Time | Court | Home | Away |
|---|---|---|---|
| 19:00 | 1 | Black Magic | Wildcats |
| 19:00 | 2 | Xaywan | Kroos Kontrol |
| 19:40 | 1 | Ghazni United | Goldlink Up |
| 19:40 | 2 | Salvos | Nasaji FC |
| 20:20 | 1 | Blue Dragons | King ADL |
| 20:20 | 2 | AFG | Misfits |
| 21:00 | 2 | Jaghori FC | Kabul Commandos |

## Guarded publication and checks

`docs/drafts/monday-results-withdrawals-2026-11-16.sql` is an **applied receipt; do not rerun**. The organiser explicitly approved this exact admin-workflow exception, commit and push. It added eight published results, corrected two past pairings, updated 47 future fixtures, and cancelled 53 superseded fixtures without deletion. It changed only Bunyip and Monday Buckle to withdrawn/standings-ineligible, retaining their UUIDs, readable IDs, kits, private preferences and all history. The published Monday schedule contains 187 games: 40 retained played games plus 147 future games. All 240 previously published fixture rows remain stored.

The transaction passed fresh disposable PostgreSQL with all repository migrations, real uniqueness/foreign-key/version/audit triggers, 480 fixtures and 56 existing results. Forced post-write failure fully rolled back; safe repeat execution rejected without writes. Independent full-schedule checks and the actual application preview verified 14 active/standings teams, five played each, the exact points/goals increments, all eight latest results retained and 26 games per remaining team. The solver found a feasible repair, not a proven global minimum of edits. Review JSON includes each team's kickoff distribution and home/away totals.

Production readback matched all 187 published Monday games and verified the eight exact new scores, both intended withdrawals and every other team profile. All prior results and Wednesday data remained unchanged. A separate read verified all 53 cancelled rows remain stored. Published standings exactly matched the reviewed preview: 14 teams, five played each, correct points/goals and 26 games each through 10 May. Snapshot generation, validation and freshness checks passed, as did all 188 application tests, the production build and diff checks. Git commit/push and Pages deployment are separate release steps. Temporary helpers, exports, logs and disposable databases are outside Git.
