# 22 October 2026 results and roster revision

## Current execution status

- Wednesday 21 October: all eight actual matches/scores are published in production, preserving all eight fixture UUIDs and agreed court/time slots. Three pairings changed.
- Wednesday 14 October: Pops 12-4 Umoja Stars is published as revision 2 of the existing fixture. Revision 1 (4-12) is superseded and retained.
- The website admin saved the correction draft but publication failed with `permission denied for table fixtures`. The organiser explicitly authorised the two rehearsed guarded result files. They are now applied receipts, never scripts to rerun. No grants, roles or session claims were changed.
- Both future schedules are published through the authenticated admin workflow. Monday: `860b3050-657c-4ecb-9d36-875431c2db64`, 145 changes, version 4. Wednesday: `b757941f-38ce-4ab3-8d58-2582795d7a63`, 142 changes, version 4. Both stored publication states were independently confirmed before withdrawing profiles. Do not duplicate/reimport these sets.
- The organiser explicitly authorised the guarded four-team withdrawal SQL; it is now applied. Exactly four profiles became withdrawn/ineligible, with profile versions incremented. Transaction checks confirmed all fixtures, result versions, other teams, notes and preferences remained unchanged. The file is an applied receipt, not a script to rerun.
- The organiser subsequently authorised committing and pushing this reviewed package, including the disorderly-behaviour bond rule, generated fallback, applied receipts, approved fixture artefacts and regression validation.

## Confirmed roster and competition policy

Withdraw Monday Gay Guys and Declan's Delinquents; withdraw Wednesday Etihad FC and Buckle City. Preserve identities, all played results, kits, private profiles and archived records. Each night retains 14 active/standings-eligible teams. Results against departed teams continue counting for their opponents; departed teams leave the active ladder.

All remaining teams finish on 26 counted matches, including their played withdrawal matches. This is a balanced 26-match season with explicit opponent-count exceptions, not a strict double round-robin among only the surviving teams.

| Night | Pairing | Total meetings |
|---|---|---|
| Monday | AFG - Bunyip | 1 |
| Monday | AFG - Kroos Kontrol | 3 |
| Monday | Kroos Kontrol - Bunyip | 1 |
| Monday | Xaywan - Bunyip | 3 |
| Monday | Xaywan - Nasaji FC | 1 |
| Monday | Wildcats - Salvos | 1 |
| Wednesday | Kuq E Zi - AFG | 1 |
| Wednesday | Misfits - Goldlink Up | 1 |

All other remaining-team pairings meet twice. The organiser approved the six non-standard Monday pairings, including Bunyip meeting AFG and Kroos Kontrol once, Nasaji twice and Xaywan three times. Wednesday reduces Misfits-Goldlink and Kuq-AFG to one meeting each to account for those four teams' retained withdrawal matches.

## Calendar, constraints and compromises

- Keep all completed fixture assignments and corrected published scores. Each future round gives all 14 remaining teams one match: seven games, two courts, four kickoff times with one 21:00 slot.
- Existing calendar/venue constraints remain: Wednesday 28 October closed; Christmas break after 23 December to Monday 11 January; Labour Day and Easter Monday excluded. Monday 2 November remains provisional, not cancelled.
- Monday regular season ends **3 May 2027**; Wednesday ends **28 April 2027**. Cancelling Monday 2 November shifts its end to **10 May 2027** if later approved playing nights otherwise remain available. No finals dates added; shared season identity/lifecycle/metadata are unchanged.
- Blue Dragons and Rinnai never play at 19:00. Bunyip only plays at 19:00/19:40. Umoja always plays at 21:00; Kuq plays there only against Umoja. Latest organiser-confirmed soft preferences remain soft. Goldlink/Buckle separation is irrelevant after Buckle leaves future fixtures; no restriction is transferred to Imole or Ibiza.
- Future rematches are separated by at least four rounds, except organiser-requested King ADL-AFG in Rounds 2/3 and Blue Dragons-Imole in Rounds 1/3. Wednesday Rinnai-Xaywan in Rounds 1/2 is actual played history, not a generated rematch.
- Maximum home/away streak is three. Monday's retained withdrawal matches have one surviving-team home and three surviving-team away assignments, so identical 13/13 totals are impossible: Wildcats is 12 home/14 away; the other 13 Monday teams are 13/13. All Wednesday teams are 13/13. Opposite home allocation per pair is a preference, not a silently imposed hard requirement.
- Future soft exceptions: none Monday; Wednesday Ghazni-Umoja in Rounds 9/24 and Pops-Umoja in Round 16, all required at 21:00 by Umoja.
- Temporary CP-SAT work produced feasible count/round solutions, prioritising same-round pair retention (119 Monday, 115 Wednesday of 168 future matches). Global optimality of pair retention is not claimed. Independent TypeScript validation checks every row, pair, team total, date, court, hard kickoff, streak and rematch exception.

## Next playing rounds

### Monday - 2026-10-26

| Time | Court | Home | Away |
|---|---|---|---|
| 19:00 | 1 | Wildcats | Kroos Kontrol |
| 19:00 | 2 | Black Magic | Salvos |
| 19:40 | 1 | King ADL | AFG |
| 19:40 | 2 | Goldlink Up | Bunyip |
| 20:20 | 1 | Nasaji FC | Ghazni United |
| 20:20 | 2 | Misfits | Xaywan |
| 21:00 | 1 | Imole United | Blue Dragons |

### Wednesday - 2026-11-04

| Time | Court | Home | Away |
|---|---|---|---|
| 19:00 | 1 | MTS FC | Wildcats |
| 19:00 | 2 | Goldlink Up | Misfits |
| 19:40 | 1 | King ADL | AFG |
| 19:40 | 2 | Rinnai | Ibiza |
| 20:20 | 1 | Ghazni United | Xaywan |
| 20:20 | 2 | Pops | Kuq E Zi |
| 21:00 | 1 | Umoja Stars | Kawsar FC |

## Validation and release boundary

- Current local checks pass: 210 tests, ESLint, non-incremental TypeScript, production static build, finals validation and whitespace check. After all publications/withdrawals, the fallback was regenerated, validated and checked against anonymous Supabase data; tests and the production build passed again.

- Disposable PostgreSQL loaded all seven repository migrations and the read-only production application baseline. Both result proposals passed application, rollback and stale-repeat rejection checks. The four-team withdrawal proposal additionally rejected premature execution before future-fixture removal and preserved all other teams, fixtures/results, notes and preferences.
- Hosted authenticated fixture validation has no blocking errors. The generic uneven-round warning fires on a valid odd number of matches (seven); independent checks confirm 14 distinct participants and no court/time collisions. Review-note warnings and the three understood soft exceptions were acknowledged.
- Result publication permission failure remains a separate admin maintenance issue. Do not weaken access control or impersonate an administrator to bypass it. Prepared guarded result operations used explicit organiser approval and retained validation/audit triggers.
- Final database verification passed: 14 active/eligible teams and 184 retained published fixtures per night (16 played plus 168 future); every remaining team has 26 matches. All 368 retained assignments match the approved artefact exactly; all 112 unused rows are cancelled. All 326 archived fixtures and 326 archived result versions match the rehearsal baseline, including every stored field. There are 806 fixture rows and 359 result versions overall; the superseded Pops result is retained.
- Live hydrated Monday/Wednesday browser views show 14-team ladders, seven next-round fixtures, preserved played results and the eight Wednesday Round 2 scores. Pops has 2 played, 1 win, 1 loss, GF 17, GA 10 and 3 points after its 12-4 correction. Initial static HTML still contained the older fallback at this check; do not claim deployed fallback parity until a successful scheduled/manual refresh and Pages deployment is verified.
- The saved future plan retains all existing fixture IDs, cancels 56 unused future rows per night and creates no fixtures. Monday changes 89 future rows; Wednesday changes 86. Cancellations and fixture history must be retained.
- The organiser authorised the matching application/fallback commit and push after the data verification. No further production SQL, workflow dispatch or access/configuration change is needed for that release. Verify the deployed fallback and Pages result for the pushed commit; the pre-release live checks above do not establish deployed-fallback parity.
