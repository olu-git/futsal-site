# Monday Imole United replacement - 16 October 2026

Production data updated at the organiser's request. No application code, dates, times, courts, results, points or Wednesday data were changed.

- New UUID: `aae18510-0f33-494b-8962-d7a5e86d0bf0`; readable ID: `mon-imole`.
- Initial display name Imole was corrected to Imole United in the same preparation session, preserving the fresh IDs. Black kit `#111111` is provisional. The organiser confirmed no current kickoff restrictions; the private profile note records availability at all four slots. No inherited private preferences were copied.
- Monday Buckle City `997291fd-33ff-40cc-9fd8-be732f6e07ca` / `mon-buckle-city` is `replaced` and excluded from current standings. Its name, UUID, kit, private profile and completed 12 October Blue Dragons 5-0 Buckle City fixture/result are preserved.
- Exactly 29 unplayed Round 2-30 fixtures now reference Imole United. Dates, times, courts, round numbers, fixture UUIDs and opponents remain unchanged. Monday retains 16 active teams and 240 fixtures. Wednesday is unchanged.
- First fixture: Monday 19 October 2026, 19:40, Court 2, Declan's Delinquents vs Imole United.
- Imole United starts with zero played/wins/draws/losses/goals/points and five question-mark form badges. No results or standings adjustments were invented or transferred. Blue Dragons retain their legitimate Round 1 win and points.
- Because this is a distinct team joining after Round 1, Imole has 29 actual scheduled matches (15 home/14 away): one meeting with Blue Dragons and two with each of its other 14 opponents. Buckle City's Round 1 appearance is not attributed to Imole. No extra fixture is added to force a 30th match.
- Existing slot allocation still preserves all other teams' hard availability and Goldlink/Buckle separation; it was not regenerated. No Imole-specific shared-player restriction was inferred.

## Verification

A local projection through the existing standings/form logic verified 16 active standings rows, zero Imole totals, five unknown form boxes, unchanged Blue Dragons points, unchanged completed results, no duplicate team appearances in future rounds and unchanged Wednesday teams/fixtures. Anonymous snapshot refresh after the writes verifies the actual public dataset. The full result_versions hash stayed `fb8afcb4c1e8fe901add297074502ab0`. Fixture hash changed only through the 29 authorised team-reference updates, from `108cba318df2a00406f2fd432ee3fc06` to `ef259b455eee5be598021cb0c6b0e082`.

The replacement transaction checked exact fixture/result/team baseline values, future fixture versions and absence of any result on a target. It protected all non-target fixtures, other teams, results, private notes/preferences, adjustments, seasons, edition states and previous audit rows. All normal audit/version triggers remained enabled, producing 31 audited changes. The follow-up display-name/kit correction kept the new UUID/readable ID and all fixtures/results unchanged.

Applied SQL receipts are under `docs/drafts/monday-imole-{replacement,profile}-2026-10-16.sql`; do not rerun them.

Live Supabase data is updated. The organiser explicitly authorised committing and pushing the verified fallback and applied receipts on 16 October 2026. This release includes no application code, workflow configuration or additional database mutations.

All 207 tests, production static build, snapshot validation/freshness and diff whitespace checks passed. Verification through the actual published snapshot confirmed black kit, zero inherited statistics, five unknown form boxes, unchanged other active-team statistics apart from table position, and unchanged completed/Wednesday records.

The prepared fallback was rechecked against anonymous production data immediately before release. No temporary harnesses, credentials or build output are included.
