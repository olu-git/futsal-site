# Goldlink Up-AFG: 16 November publication receipt

Status: **published and anonymously verified in production**, transaction `1761`, on 11 November 2026 after explicit organiser approval of the guarded SQL exception and fallback release. This commit packages the applied receipts and matching fallback for the normal master/Pages workflow. The earlier results/AFG release remains separately recorded as `40ed624`.

The requested game fits at **20:20, Court 1** (stored as AFG vs Goldlink Up). This feasible plan changes 15 of the 208 remaining Monday fixtures across rounds 5, 9, 10, 12 and 23. Four of next Monday's eight fixtures remain unchanged. The global minimum was not proved within the solver time limit. Two same-round whole-match slot swaps avoid adding any new soft preference conflicts.

## Published Monday 16 November

| Time | Court | Home | Away |
| --- | --- | --- | --- |
| 19:00 | 1 | Salvos | Buckle City |
| 19:00 | 2 | Wildcats | Nasaji FC |
| 19:40 | 1 | Ghazni United | Bunyip |
| 19:40 | 2 | Xaywan | Kroos Kontrol |
| 20:20 | 1 | AFG | Goldlink Up |
| 20:20 | 2 | Blue Dragons | Black Magic |
| 21:00 | 1 | Hakim's Team | Misfits |
| 21:00 | 2 | Jaghori FC | King ADL |

## Preserved

- All 32 completed Monday fixtures/results, team names and UUIDs, kits and records remain unchanged. No Kabul rename or Buckle/Hakim record swap.
- Buckle-Bunyip is not added on 16 November, avoiding a consecutive-week rematch. Buckle instead faces Salvos in the published schedule.
- 240 matches, 30 per team, every pair twice with one home meeting each, 15 home/15 away, maximum home/away streak four.
- One match per team per round, fixed dates/courts/kickoff slots, AFG no 21:00, Bunyip early only, Blue Dragons no 19:00, and Goldlink/Buckle separation.
- No new soft time-preference conflicts. Ghazni remains at 19:40 on 16 November; King ADL avoids the proposed new 19:00 assignment on 14 December. Existing soft compromises elsewhere remain unchanged.
- All Wednesday data, calendar exceptions, standings and archived/finals history.

## Local checks

The existing import parser/validator passed all 15 proposed updates with zero blocking messages and zero avoid-time warnings. Independent full-season checks passed fixture totals, opponent counts, participation, court occupancy, required times, home/away, soft preference preservation and past-result preservation. The normal admin review UI remained unavailable; the organiser explicitly authorised the guarded publication route. No application code or permanent tests were added. After publication, the matching fallback was generated and checked, and the production build passed.

Files: `docs/drafts/goldlink-afg-2026-11-16-import.json` and `docs/drafts/goldlink-afg-2026-11-16-review.json`. The alternative import is an applied receipt with stale expected versions; do not import it. The organiser subsequently authorised the guarded SQL route and matching release; no manual workflow dispatch is needed.


## Guarded publication fallback

`docs/drafts/goldlink-afg-2026-11-16.sql` prepares exactly the reviewed 15 future fixture updates. It is an applied receipt, not a migration. Do not rerun. Do not combine it with the alternative import. AGENTS.md directs regular-season changes through admin; the browser access host remains unavailable, so the organiser explicitly approved this narrow SQL exception.

The exact transaction passed a fresh loopback-only PostgreSQL rehearsal with all repository migrations, real foreign keys, schedule-version/audit triggers and the current structured Monday time preferences. All 240 assignments matched the approved plan. All 32 result rows, team identities, profiles, old audit entries and unrelated fixtures remained protected. A forced post-write assertion failure rolled everything back; repeat execution safely rejected the changed baseline without writing. The temporary cluster was removed; scripts/logs remain ignored.

Production preflight matched the published fixture/result/profile baseline and found no pending imports. Anonymous readback verified all 240 assignments and 15 expected version increments. Snapshot generation, canonical validation, anonymous comparison and the production build passed. The approved fallback release uses the normal commit/push/Pages workflow. No Buckle/Kabul rename or record transfer is included.


## Hosted evidence

Transaction `1761` added exactly 15 fixture UPDATE audit entries. Every played result and all standings/team/Wed fixture checksums matched the pre-operation values recorded in the review JSON. The stored name remains Hakim's Team; Buckle retains its four-point record. No team/profile/result rows or access permissions were modified. The alternative import now has stale expected versions and must not be imported. Temporary verification scripts/logs and the disposable cluster remain outside Git; the cluster was removed after testing.
