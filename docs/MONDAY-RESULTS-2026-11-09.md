# Monday 9 November actual results and fixture repair

Status: **applied and anonymously verified in production**, transaction `1756`, on 10 November 2026. The organiser confirmed all proposed slots and explicitly approved the guarded SQL exception. Eight results are published, the schedule repairs are applied, and the local fallback matches production. The organiser subsequently authorised release of the completed results and AFG availability updates. This commit packages their applied receipts and verified public fallback; the normal master push workflow deploys it. No Buckle/Kabul record swap, rename or new 16 November request is included.

The organiser supplied these actual games/scores. Every active Monday team appears once. Existing stored names/UUIDs resolve all teams, including Hakim's Team, Nasaji FC, King ADL and Ghazni United; no identity change is needed.

| Time (confirmed) | Court | Home | Score | Away |
| --- | --- | --- | --- | --- |
| 19:00 | 1 | Kroos Kontrol | 7-3 | Jaghori FC |
| 19:00 | 2 | Goldlink Up | 6-6 | Wildcats |
| 19:40 | 1 | Bunyip | 5-0 | Buckle City |
| 19:40 | 2 | Hakim's Team | 5-6 | Ghazni United |
| 20:20 | 1 | Black Magic | 3-6 | AFG |
| 20:20 | 2 | Salvos | 10-2 | Blue Dragons |
| 21:00 | 1 | Nasaji FC | 8-3 | King ADL |
| 21:00 | 2 | Xaywan | 3-9 | Misfits |

Scores and pairings are confirmed by the supplied results. The organiser subsequently confirmed the retained kickoff/court values. Xaywan remains the home team in its existing fixture, so Misfits' 9-3 win is stored as Xaywan 3-9 Misfits, preserving the home/away return. Bunyip's 5-0 is an ordinary result; no forfeit was reported and none is inferred.

## Applied change

Four Round 4 fixture rows change opponents: Goldlink-Wildcats, Bunyip-Buckle, Black Magic-AFG and Nasaji-King ADL. Eight new revision-1 results are published for the existing fixture IDs. All other existing result IDs, revisions, scores and audit history stay protected. No existing result is overwritten, no duplicate fixture is created, and no team/profile/standing adjustment changes.

To retain the approved season totals, the local solver found an optimal nine future pairing-slot changes in rounds 5, 6, 21 and 26. Three additional home/away-only swaps in rounds 14, 16 and 19 preserve the current maximum streak of four. The transaction updated 16 fixture rows: four actual-game corrections and 12 future changes. Every fixture retains its date, round, kickoff time, court, publication state and schedule status; its version increments once if its team assignment changes.

The final projected season remains 16 teams, 240 matches, 30 games each, every pair twice with one home meeting each, and 15 home/15 away per team. Every round has eight games and one appearance per team. Blue Dragons never play at 19:00, Bunyip stays at 19:00/19:40, and Goldlink/Buckle do not kick off simultaneously unless playing one another. Soft preferences are retained in the optimisation. Calendar dates, venue exclusions, 7 June Monday finish and all Wednesday/history/finals data are unchanged.

Actual completed close repeats remain locked: Xaywan-Misfits in rounds 3/4, Hakim-Ghazni in rounds 2/4 and AFG-Black Magic in rounds 1/4. No third meetings are introduced. All future meetings keep the existing minimum separation where applicable, capped at four rounds; affected new return pairings use at least four rounds.

## Files and execution

- `docs/drafts/monday-results-2026-11-09.sql`: applied guarded receipt for all 16 fixture updates and eight results. **Not a migration. Do not rerun.** It checks the exact published 240-fixture baseline, 16 active/eligible teams, no pending imports, no existing result work on affected games and no duplicate result IDs. Existing validation, schedule-version and audit triggers stay enabled. Transaction assertions check scores, match totals, pairing limits, hard time rules and protected rows. A repeat attempt safely rejects without writes.
- `docs/drafts/monday-results-2026-11-09-import.json`: historical alternative **future-only** admin import for 12 changes. **Do not import:** the combined SQL already applied these changes and the expected versions are stale.
- `docs/drafts/monday-results-2026-11-09-review.json`: eight confirmed published scores/slots, all 16 fixture changes and totals.

AGENTS.md requires routine changes through admin. The existing fixture validator blocks past-date changes (`past_fixture` and `past_schedule`), so it cannot correct the four actual 9 November pairings on 10 November. The browser DOM host is also unavailable, and native access did not provide a reliable admin view; no browser writes were attempted. The narrow SQL exception was explicitly approved for this operation, not inferred from previous approvals. No access control or application change is proposed to bypass the existing guard.

## Local verification

- Fresh, loopback-only disposable PostgreSQL with all repository migrations, real foreign keys, fixture version triggers, result validation/publishing triggers and audit triggers.
- Exact SQL proposal succeeded; all 240 assignments matched the plan. All eight new published scores were verified. Existing 24 published Monday results remained protected, with 32 after application locally.
- All 16 local database standings matched the existing application's independently calculated projected table: four games per active team. Total points 93 across 32 matches, including three draws; total goals for equals total goals against.
- A deliberately failed post-write assertion rolled back fixtures, results and audit entries. Re-execution rejected safely and left state unchanged. The temporary cluster was removed afterwards.
- Existing fixture import parser/validator passed the future-only projected context: 12 items, zero blocking errors and zero warnings against the current recorded structured time preferences. Full-season independent checks also enforce Goldlink/Buckle separation and once-per-round participation.
- Earlier completed Monday fixtures, Wednesday fixtures, team records and archives remained unchanged in the application projection. The local public fallback was subsequently generated from actual anonymous production reads, not from the proposed projection. Temporary scripts/logs remain ignored; no credentials or private exports are included in tracked files.
- No new tests or application code were added. Production preflight matched the exact rehearsed fixtures, result entries, team profiles and recorded kickoff preferences. Anonymous readback, local snapshot generation/validation/check and production build passed after application. Git publication is subsequently authorised; no further production database operation is needed for this receipt.


## Production verification

- Transaction `1756` added 24 audit entries: 16 fixture UPDATEs and eight result INSERTs. All earlier audit rows remained protected by the transaction.
- Anonymous production reads exactly matched all 240 planned Monday assignments, eight reserved result IDs/scores/statuses and 16 one-step fixture-version increments. All earlier result entries matched the pre-operation export.
- Every active Monday team has four played. All 16 production database standings match the application's projected values. Existing scoring, tie-breaks and form calculation remain authoritative; no standings are hardcoded.
- Earlier result rows retained checksum `a137994908ee5778ea412bc4dd0d409a`; all team rows retained `1111d289db5fbed3407b8a796660255e`; all Wednesday fixture rows retained `b1c65d992f18c7dacd36c3532bc73103`.
- Local fallback generation, canonical validation, anonymous Supabase comparison and production static build passed. The organiser subsequently authorised committing and pushing the matching fallback and receipts. Pages deploys through the normal master push workflow; no manual workflow dispatch or additional SQL is needed.
