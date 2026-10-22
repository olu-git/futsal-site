# Wednesday expansion - 22 October 2026

## Status

Completed production data update, 22 October 2026. Roster/inheritance SQL applied with explicit organiser approval: Dream Team active/red with 4 points; Buckle City active/eligible with 1 point; Etihad withdrawn/ineligible. The organiser subsequently explicitly authorised public schedule publication. Change set `1cb905ac-8b8c-444d-bacb-716a858837f0` is published at version 4, publication time `2026-10-22 08:36:27.513788+00` (19:36 Australia/Sydney). All 104 saved proposals matched the reviewed import before publication. No duplicate change set or repeated publication was performed.

Postflight: all 240 active fixture assignments exactly match the reviewed plan. Independent validation passes 30 games per team, 120 pairs twice, 15 home/15 away, maximum-three home/away streaks, one match per round, court/date validity and all hard availability rules. Fingerprints confirm all 360 result versions unchanged and all Monday/other-edition fixtures, teams, notes and preferences unchanged by fixture publication. Live public browser verification shows 16 standings rows, Dream Team red/4 points/form `? ? ? W D`, Buckle City 1 point/form `? ? ? D L`, and eight upcoming games. The local fallback was regenerated and matches anonymous Supabase. All 223 tests and the production static build pass after the refresh; lint and non-incremental TypeScript passed during preparation. Whitespace checks pass. The organiser has authorised committing and pushing the reviewed fallback/source/docs package. Deployed static/failure-fallback parity is a subsequent release check; this is not a claim that the new local fallback has deployed.

## Team changes

- Create Dream Team as a distinct identity: `bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3` / `wed-dream-team`, red `#ED1C24` (existing admin red preset). Required kickoff set: 19:00/19:40. The sole future exception is 21:00 against Umoja Stars.
- Transfer only Etihad's two current-season fixture team references to Dream Team: 5-1 win over Goldlink Up on 14 October and 5-5 draw with AFG on 21 October. Preserve fixture/result UUIDs, scores, dates, times, courts and all result revisions. Dream Team starts on 4 points, 10 GF, 6 GA. The inherited Round 2 20:20 time is historical Etihad data, not a new Dream Team availability exception or a claim that Dream Team played it.
- Keep Etihad UUID/history and withdrawn/ineligible status. Do not rename or reuse Etihad as Dream Team.
- Reinstate existing Wednesday Buckle City UUID `c9f73f23-1e6c-42df-a7fa-9a7953d9cb75` / `wed-buckle-city`; retain both results, 1 point, 7 GF and 13 GA. Restore active and standings-eligible status. Preserve its recorded kit value (unspecified). No points are awarded or invented.
- Monday remains unchanged, including its separately approved opponent-count exceptions.

## Schedule review

- 16 teams; 30 rounds; 240 active fixtures. Each team plays 30 games and each of the 120 pairs meets exactly twice, once at home and once away. Each team has 15 home and 15 away games; maximum consecutive home/away streak is three.
- Preserve all 16 played results. Only the two confirmed Etihad fixture team references transfer to the new identity. Rinnai-Xaywan already played in Rounds 1/2; no future meetings are added. This existing close rematch is preserved history. All future rematches are at least four rounds apart. A strict one-meeting-per-half rule is impossible for that already-played pair, so it is not claimed.
- Start: Wednesday 14 October 2026. Final regular-season round: Wednesday 26 May 2027. No finals dates added. Wednesday 28 October stays closed; Christmas break and the standing venue booking remain unchanged.
- Dream Team faces Umoja at 21:00 twice; all its other future matches are 19:00/19:40. Rinnai never has a new 19:00 game. Kuq's 21:00 exception applies only against Umoja. Goldlink Up and Buckle City never kick off simultaneously unless opponents.
- Keep 120 future fixtures exactly unchanged; update 48 existing published fixtures and create 56 fixtures through the normal change-set workflow. The 56 previously cancelled records stay cancelled. Publication yields 240 active Wednesday fixtures and preserves the cancellation history.

### Next round - Wednesday 4 November 2026

| Time | Court | Home | Away |
|---|---|---|---|
| 19:00 | 1 | MTS FC | Wildcats |
| 19:00 | 2 | Buckle City | Dream Team |
| 19:40 | 1 | King ADL | AFG |
| 19:40 | 2 | Rinnai | Ibiza |
| 20:20 | 1 | Ghazni United | Xaywan |
| 20:20 | 2 | Pops | Kuq E Zi |
| 21:00 | 1 | Umoja Stars | Kawsar FC |
| 21:00 | 2 | Goldlink Up | Misfits |

### Kickoff distribution across all 30 records

Dream Team's distribution includes Etihad's inherited historical kickoff times; future availability is checked separately.

| Team | 19:00 | 19:40 | 20:20 | 21:00 | Max H/A streak |
|---|---|---|---|---|---|
| AFG | 9 | 7 | 8 | 6 | 3 |
| Buckle City | 7 | 7 | 7 | 9 | 3 |
| Dream Team | 13 | 14 | 1 | 2 | 3 |
| Ghazni United | 0 | 13 | 15 | 2 | 3 |
| Goldlink Up | 9 | 8 | 7 | 6 | 3 |
| Ibiza | 10 | 6 | 7 | 7 | 3 |
| Kawsar FC | 8 | 6 | 7 | 9 | 3 |
| King ADL | 1 | 8 | 14 | 7 | 3 |
| Kuq E Zi | 12 | 9 | 7 | 2 | 3 |
| MTS FC | 9 | 6 | 7 | 8 | 3 |
| Misfits | 13 | 4 | 7 | 6 | 3 |
| Pops | 13 | 7 | 8 | 2 | 3 |
| Rinnai | 0 | 11 | 10 | 9 | 3 |
| Umoja Stars | 0 | 0 | 0 | 30 | 3 |
| Wildcats | 8 | 7 | 7 | 8 | 3 |
| Xaywan | 8 | 7 | 8 | 7 | 3 |

### Soft exceptions

- Round 9: Umoja Stars - Ghazni United, 21:00. Umoja's hard 21:00 availability takes priority over the other team's soft preference.
- Round 28: Ghazni United - Umoja Stars, 21:00. Umoja's hard 21:00 availability takes priority over the other team's soft preference.
- Round 27: Umoja Stars - Pops, 21:00. Umoja's hard 21:00 availability takes priority over the other team's soft preference.

## Rehearsal and release boundary

- Independent TypeScript validator verifies roster, 240 unique fixtures, exact round/calendar/court slots, one match per team per round, pair totals, opposite home allocation, 15/15 totals, maximum-three streaks, played-record preservation, hard availability, Goldlink/Buckle separation and future rematch spacing. Regression tests reject forbidden dates, changed played assignments and hard kickoff violations.
- Disposable PGlite with all repository migrations: exact roster SQL passes; rollback restores fixture references; repeat execution rejects the stale baseline; protected hashes preserve all results, unaffected fixtures, other teams, notes and preferences. Existing fixture RPC create/import/submit/publish succeeds locally for all 104 changes and produces 240 active fixtures with 120 pairs twice. This is local verification, not a hosted publication claim.
- The active-season Teams UI cannot create a team or restore standings eligibility; its profile-save RPC has no eligibility input. The guarded `docs/drafts/wednesday-dream-team-roster-2026-10-22.sql` was explicitly approved and applied as an alternative to unavailable admin operations; it is now an applied receipt and must not be rerun. It changes only the new Dream Team profile/preferences/private exception note, Buckle active/eligible status, and the two inherited fixture team references. It does not change permissions or future fixture assignments.
- The following import is already published; do not duplicate it: `docs/drafts/wednesday-expansion-import-2026-10-22.json` into Wednesday Fixtures, review 48 updates/56 creates, acknowledge the known availability/profile warnings and publish once through the existing workflow. Revalidate the latest stored state first. Do not rerun stale imports or roster SQL.
- Hosted import/review/publication, exact active assignment comparison, Dream/Buckle live table/form derivation and local snapshot generate/validate/check are complete. The 56 created fixtures received new UUIDs through the normal RPC; cancelled source rows remain preserved. Draft schedule IDs for those rows describe source-slot planning, not the new published fixture UUIDs. Deployed fallback verification remains a subsequent release check. Existing Results publication permission bug is separate and is not repaired by this work.
- No new database schema, grant, role, Supabase permission or season activation change is proposed. The fallback was regenerated from production rather than edited by hand. No application deployment, workflow dispatch, commit or push was performed.
