# Competition data reconciliation - 25 September 2026

## Sources compared

- Live deployment source: `origin/master` at `3780f29` (`.github/workflows/deploy.yml` deploys `master`).
- New website working branch: `feature/new-website` at `3b5c1fd`, plus the uncommitted work described below.
- Regular season: `teams.json`, Monday and Wednesday fixture JSON, and `standings-adjustments.json`.
- Finals: `season-2026-s1.json` for seeds/results and `finals.ts` for dates, match codes, feeder slots, times, and courts.

The remote refs were fetched without merging. No Supabase connection, SQL execution, commit, push, or deployment was performed.

## Reconciliation totals

| Competition | Active teams | Stored teams | Completed regular-season results | Latest completed round | Finals fixtures | Completed finals results | Upcoming finals fixtures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Monday | 16 | 19 | 146 | 24 | 19 | 8 | 11 |
| Wednesday | 16 | 16 | 180 | 26 | 19 | 8 | 11 |

Each finals schedule contains 15 elimination matches (Round of 16 through Grand Final) and 4 grading games. The eight completed results per competition are the Round of 16; the eleven upcoming entries are four grading games, four quarter-finals, two semi-finals, and one Grand Final.

## Match against the live data

- Both regular-season fixture files match `origin/master` exactly.
- Standing adjustments match `origin/master` exactly.
- Team identity, name, night, division, and active status match `origin/master`. The new website retains its approved `kitColour` fields, which are absent from `master`.
- Finals seeds, completed scores, and the Monday 3-2 penalty result match `origin/master`.
- The new website now uses the live grading pairings and current quarter-final feeder paths.
- The Wednesday QF2 hotfix is merged into `origin/master`; both branches now schedule Pops vs Hazara United for 7:40 PM on Court 2.

## Confirmed differences and records

1. Wednesday QF2, Pops vs Hazara United, is confirmed for 30 September 2026 at 7:40 PM on Court 2. The correction is present in both `origin/master` and `feature/new-website`, removing the previous clash with QF4.
2. Top Up FC replaced Dwell FC for the Wednesday knockout stage only. Dwell FC remains the owner of its complete regular-season history and standings record; Top Up FC is represented in the finals JSON without rewriting that history.
3. Monday seed 15 is now `Declan's Team` with its own ID and inherited administrative record. Its red kit colour is retained from the team it replaced.
4. Grading games are display-only and currently have no results. Quarter-final, semi-final, and Grand Final teams remain recursively resolved as `TBC` until feeder results exist.

The finals validation now explicitly checks that Dwell FC remains in Wednesday regular-season data, Top Up FC occupies Wednesday knockout seed 12 without a replacement regular-season team ID, and QF2 resolves to Pops vs Hazara United on 30 September 2026 at 7:40 PM on Court 2.

## Remaining unresolved records

No unresolved competition records remain from this reconciliation. Unplayed grading games and later knockout rounds intentionally remain scoreless or `TBC` until their matches and feeder results are completed.

## Release scope

The first Supabase release remains limited to teams, profiles/preferences, regular-season fixtures/results, derived standings, reasoned adjustments, publication workflow, seasons, and audit history. Current knockout and grading data remains JSON-managed through the completion of both finals series.
