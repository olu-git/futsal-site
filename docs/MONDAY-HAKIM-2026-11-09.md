# Monday Hakim replacement and 9 November fixtures

Status: **applied and verified in production**, transaction `1740`, on 6 November 2026 after explicit organiser approval of the guarded SQL exception. The organiser subsequently authorised commit and push. This release packages the regenerated public fallback and applied receipts; GitHub Pages deploys it through the normal master workflow.

The organiser explicitly requested Hakim's Team to replace Imole United and inherit its results in Monday Division A, 2026 - Season 2. This is a distinct identity, not a rename or global history merge.

- New UUID: `f0402dd7-5aa2-4a6b-98ee-6d8663c6a76c`.
- Readable ID: `mon-hakims-team`.
- Outgoing UUID remains `aae18510-0f33-494b-8962-d7a5e86d0bf0` / `mon-imole`.
- Inherited results: Blue Dragons 5-0 Imole (12 October), Ghazni United 11-3 Imole (19 October), Imole 0-5 Blue Dragons (26 October, existing forfeit retained).
- Derived starting record: 3 played, 0 wins, 0 draws, 3 losses; 3 GF, 21 GA, -18 GD, 0 points; form `??LLL`. Table position uses the existing ranking rules.
- No standings adjustments exist for Imole. No points or scores are invented.
- Organiser confirms white shirt (`#FFFFFF`) and **no current kickoff restrictions** on 6 November 2026. This current position is recorded in the private scheduling note; future changes can be saved normally through Teams. Imole's private profile was not copied.

## Published Monday 9 November

| Time | Court | Home | Away |
| --- | --- | --- | --- |
| 19:00 | 1 | Kroos Kontrol | Jaghori FC |
| 19:00 | 2 | Goldlink Up | Buckle City |
| 19:40 | 1 | Bunyip | King ADL |
| 19:40 | 2 | Hakim's Team | Ghazni United |
| 20:20 | 1 | Black Magic | Wildcats |
| 20:20 | 2 | Salvos | Blue Dragons |
| 21:00 | 1 | AFG | Nasaji FC |
| 21:00 | 2 | Xaywan | Misfits |

All 16 teams appear exactly once. Goldlink/Buckle are permitted to kick off together because they play each other. Bunyip remains early only; Blue Dragons remain excluded from 19:00.

## Future repair and safeguards

The local solver found an optimal minimum of 11 changed pairing slots, including the three requested 9 November slots. Repairs affect rounds 4, 5, 15, 17 and 23. Two additional future fixtures change home/away orientation only to preserve the existing maximum streak of four. See the review JSON for pairing changes and the import JSON for every affected future fixture and expected version.

There are 40 fixture-row updates in the combined proposal: three completed-result attribution transfers and 37 future changes. Most future changes simply substitute Hakim's new UUID for Imole's. Every fixture keeps its ID, date, round, kickoff time, court and publication/schedule state. Every result ID, revision, score and forfeit detail stays unchanged. Wednesday, prior-season records, finals, standing adjustments, original private profiles, existing audit rows and all unrelated fixtures remain protected.

The complete published season has 240 matches, 30 per team, each pair exactly twice with one home meeting each, and 15 home/15 away per team. One match per team per round, court occupancy, weekdays, hard availability and Goldlink/Buckle separation pass. Dates and calendar exclusions are inherited unchanged; the final Monday remains 7 June 2027.

Requested spacing compromises: Xaywan-Misfits occurs in consecutive playing rounds (26 October and 9 November); Hakim-Ghazni follows the inherited 19 October meeting in round 4. These are the requested second meetings, not extra third meetings. Other pair spacing keeps at least its existing minimum, capped at four rounds. Soft time preferences remain preferences; no new hard exception is introduced.

## Files and application paths

- `docs/drafts/monday-hakim-2026-11-09.sql`: **applied combined fallback receipt**, not a migration. The organiser explicitly approved bypassing the unavailable admin workflow. Do not rerun. Creates the new identity, retires Imole from active standings, transfers the three result-bearing fixture references and applies the 37 future updates atomically. Existing audit and schedule-version triggers remain enabled. Exact baseline guards reject changed fixtures, changed Imole profile/results, pending imports, unexpected adjustments and duplicate Hakim identities. A repeat attempt rejects without writing.
- `docs/drafts/monday-hakim-2026-11-09-import.json`: historical alternative normal-admin import for 37 future updates. **Do not import:** the combined SQL already applied these changes, and its expected versions are stale. This is not a second step of the combined fallback.
- `docs/drafts/monday-hakim-2026-11-09-review.json`: identity, totals, Week 4 table and pairing-change review.

Production preflight found no existing Hakim identity or pending Monday imports. Imole's profile and all recorded Monday kickoff preferences matched rehearsal. The organiser confirmed white kit/no current restrictions and explicitly approved the fallback. Transaction guards checked the exact published Monday baseline and inherited result versions before writing. The local fallback was generated from actual anonymous production reads after application, not from the planning projection.

## Verification and remaining work

- Passed disposable loopback-only PostgreSQL rehearsal using all repository migrations, actual foreign keys, the schedule-version trigger and audit triggers, with 240 fixture rows and 24 published results.
- The exact combined SQL passed; all 240 resulting assignments matched the local plan. A forced post-write assertion failure rolled back every write and audit entry. A second execution safely rejected the existing identity with no further changes.
- Transaction guards verified inherited standings, exact result versions, preserved result/fixture details, existing audit rows and protected tables. The disposable database used public Monday data and synthetic private-note sentinels; it was not production or a hosted test project. Hosted access/session checks were not performed.
- The application's actual import parser/validator passed the projected roster context: 37 import items, zero blocking errors and zero warnings for the recorded structured preferences. Hakim's availability is now separately organiser-confirmed as unrestricted currently.
- Existing standings/form functions passed the inherited-record projection; Wednesday fixtures, archive data, all scores, dates, times and courts remained unchanged.
- Production static build passed. Application code and dependencies were not changed, so the unrelated full application suite was not repeated. After the fallback refresh, snapshot validation/check and the production build passed. Temporary scripts, database cluster and detailed logs stay outside tracked Git files; the fresh local cluster was removed after verification.
- Browser access host is unavailable, and the existing Teams action requires an existing team ID; it cannot create this active-season identity or implement result inheritance. Production application, anonymous readback and local snapshot refresh are complete. The normal admin UI was not exercised for this operation. No frontend code changes or manual workflow dispatch are needed; this commit includes the fallback and applied receipts. No existing backup, credentials, authentication settings or permissions were changed.


## Hosted readback evidence

- Transaction `1740`: 40 fixture UPDATE audit rows, one team INSERT, one team UPDATE and one scheduling-note INSERT: 43 new audit entries. Existing audit rows remained protected by the transaction.
- Anonymous Data API reads matched all 240 approved fixture assignments and the exact expected version increments. All 24 Monday published result IDs, revisions, scores and forfeit fields matched the pre-operation export.
- All result-version rows across the database kept hash `a137994908ee5778ea412bc4dd0d409a`; Wednesday fixture rows kept hash `b1c65d992f18c7dacd36c3532bc73103`.
- Hakim is active/eligible, white kit, position 16 with the inherited 3 played/0 points/3 GF/21 GA record. Imole remains stored as replaced/ineligible, retaining its UUID, kit and original private profile. No result versions or adjustments were inserted or changed.
- The generated local fallback matches anonymous Supabase data. Commit and push were subsequently authorised. The normal push-triggered Pages workflow releases this matching fallback; no additional database operation or manual workflow dispatch is needed.
