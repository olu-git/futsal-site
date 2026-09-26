# Current-season Supabase import reconciliation

Generated deterministically from source digest `bcf95212532b5530a8176fcf5aea22771f4a42481103971bfe3fae88cafcd0c8`.

## Source files

- `src/data/teams.json`
- `src/data/monday-fixtures.json`
- `src/data/wednesday-fixtures.json`
- `src/data/standings-adjustments.json`
- `src/data/season-2026-s1.json`
- `src/lib/finals.ts`
- `docs/COMPETITION-DATA-RECONCILIATION-2026-09-25.md`

The public data path was traced through `src/lib/competition-repository.ts`, `competition-service.ts`, and `standings.ts`. No page component or finals JSON was modified.

## Mapping

- Season: **2026 Season 1**, covering **2026-03-23 to 2026-10-07**. The start is the earliest completed regular-season fixture; the end is the latest scheduled finals date across both competitions (Wednesday 7 October 2026).
- Category: **Men's** (`mens`) for both Monday and Wednesday.
- Location: **Endeavour Hills Leisure Centre**, 10 Raymond McMahon Blvd, Endeavour Hills VIC 3802.
- Competitions: **Monday Night / Division A** and **Wednesday Night / Division A**.
- JSON team IDs, fixture IDs, and adjustment IDs map to Supabase `legacy_id`; UUIDs are deterministic UUIDv5-style identifiers derived from the season and legacy identity.
- All imported fixtures are completed, published `regular_season` fixtures. Every imported result is published revision 1.

## Record counts

| Night | Imported teams | Active | Inactive | Fixtures | Results | Adjustments | Published table rows |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Monday | 18 | 16 | 2 | 146 | 146 | 21 | 16 |
| Wednesday | 16 | 15 | 1 | 180 | 180 | 17 | 16 |

## Reconciliation decisions

- Dwell FC keeps `wed-dwell-fc`, all Wednesday regular-season fixtures and adjustments, and remains standings eligible. It imports as inactive because Top Up FC replaced it only for the knockout phase.
- Wednesday Top Up FC is not imported: it has no Wednesday regular-season team record, fixture, result, or adjustment. The Monday Top Up FC record is imported because it has genuine Monday regular-season history.
- Inactive Monday historical teams are retained where they have fixture or adjustment history. They are not standings eligible because the published JSON ladder excludes inactive Monday teams.
- The Wednesday finals-only Top Up FC/Dwell FC replacement and the QF2 Pops v Hazara United slot at 7:40 PM on Court 2 remain unchanged and are validated before artifact generation.

## Imported team inventory

Every team below has genuine regular-season fixture or adjustment history. Inactive teams are retained rather than erased.

### Monday

- Active teams (16): `mon-afg` (AFG), `mon-blue-dragons` (Blue Dragons), `mon-moza-mama` (Moza Mama), `mon-hunger-fc` (Hunger FC), `mon-goldlink-up` (Goldlink Up), `mon-misfits` (Misfits), `mon-ghazni-united` (Ghazni United), `mon-goal-diggers` (Goal Diggers), `mon-wildcats` (Wildcats), `mon-hope` (Hope), `mon-salvos` (Salvos), `mon-toss` (Toss), `mon-hazara-united` (Hazara United), `mon-top-up-fc` (Top Up FC), `mon-bunyip` (Bunyip), `mon-declans-team` (Declan's Team)
- Inactive historical teams (2): `mon-samen` (Samen), `mon-buckle-city` (Buckle City)
- Standings-eligible teams (16): `mon-afg` (AFG), `mon-blue-dragons` (Blue Dragons), `mon-moza-mama` (Moza Mama), `mon-hunger-fc` (Hunger FC), `mon-goldlink-up` (Goldlink Up), `mon-misfits` (Misfits), `mon-ghazni-united` (Ghazni United), `mon-goal-diggers` (Goal Diggers), `mon-wildcats` (Wildcats), `mon-hope` (Hope), `mon-salvos` (Salvos), `mon-toss` (Toss), `mon-hazara-united` (Hazara United), `mon-top-up-fc` (Top Up FC), `mon-bunyip` (Bunyip), `mon-declans-team` (Declan's Team)
- Standings-ineligible historical teams (2): `mon-samen` (Samen), `mon-buckle-city` (Buckle City)

### Wednesday

- Active teams (15): `wed-afg` (AFG), `wed-ibiza` (Ibiza), `wed-goldlink-up` (Goldlink Up), `wed-misfits` (Misfits), `wed-moza-mama` (Moza Mama), `wed-hazara-united` (Hazara United), `wed-ghazni-united` (Ghazni United), `wed-pops` (Pops), `wed-rinnai` (Rinnai), `wed-toss` (Toss), `wed-unathletico` (Unathletico), `wed-wildcats` (Wildcats), `wed-umoja-stars` (Umoja Stars), `wed-mts-fc` (MTS FC), `wed-xaywan` (Kuq E Zi)
- Inactive historical teams (1): `wed-dwell-fc` (Dwell FC)
- Standings-eligible teams (16): `wed-afg` (AFG), `wed-ibiza` (Ibiza), `wed-goldlink-up` (Goldlink Up), `wed-misfits` (Misfits), `wed-moza-mama` (Moza Mama), `wed-hazara-united` (Hazara United), `wed-ghazni-united` (Ghazni United), `wed-pops` (Pops), `wed-rinnai` (Rinnai), `wed-toss` (Toss), `wed-unathletico` (Unathletico), `wed-wildcats` (Wildcats), `wed-dwell-fc` (Dwell FC), `wed-umoja-stars` (Umoja Stars), `wed-mts-fc` (MTS FC), `wed-xaywan` (Kuq E Zi)
- Standings-ineligible historical teams (0): None

## Excluded records

- mon-buckle-city-fc (Buckle City): no completed fixture or standing adjustment; excluded as a stale/non-regular-season record.
- Monday finals/grading: 19 fixtures and 8 recorded results excluded.
- Wednesday finals/grading: 19 fixtures and 8 recorded results excluded.
- Scheduled regular-season fixtures excluded: Monday 0; Wednesday 0.

## Standings reconciliation

- Monday published JSON-derived table: **offline match passed** (16 rows).
- Wednesday published JSON-derived table: **offline match passed** (16 rows).
- The generated post-import SQL compares every standings field and position against these expected rows. Database parity remains pending until the operator deliberately executes the import and verification SQL.

## Assumptions and unresolved discrepancies

- The season starts with the first completed regular-season fixture and ends on the final scheduled finals night. Finals dates define the season boundary only; no finals records are imported.
- Existing 5-0 scores are imported as published scores only; the JSON does not provide a consistently structured forfeit marker, so no forfeit side is inferred.
- No unresolved source discrepancy blocks generation.
