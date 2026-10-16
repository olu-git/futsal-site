# Monday Imole United replacement - 16 October 2026

## Current state: Round 1 result inherited

The organiser explicitly corrected the original no-inheritance setup: Imole United now inherits Monday Buckle City's 12 October 2026 0-5 loss to Blue Dragons. This section supersedes the original setup described below.

- Fixture `b6b1a297-478a-4e71-a674-4228f2f11107` now references `mon-imole` as its away team. Its original date, 19:40 kickoff, Court 1, opponent, published status, 5-0 score and published result UUID `ee9f7b8d-64cc-4d4c-b9f1-af3c034efaef` are unchanged.
- Only the existing fixture's away-team reference was corrected. No result was inserted, altered or duplicated, and no standings adjustment was added. The old attribution remains in the audit history.
- Imole United retains its fresh UUID/readable ID, black kit and unrestricted current availability. Buckle City's identity remains stored as replaced/ineligible. Wednesday and older seasons are unchanged.
- Imole now has 1 played, 1 lost, 0 points, 0 goals for, 5 against and -5 goal difference. Upcoming form is `? ? ? ? L`. Blue Dragons retain their existing 5-0 win and 3 points. Other teams' statistics are unchanged apart from table position.
- Imole now has all 30 season fixtures: 15 home/15 away, two meetings per opponent. Its 29 future fixtures have not moved.
- The private profile note records this latest organiser instruction and explicitly supersedes its original no-transfer note. Audit/version triggers remained enabled. All existing result_versions rows, all other fixtures, unrelated teams/profiles/preferences, adjustments, seasons, edition state and previous audit rows were protected by transactional checks.
- Applied receipt: `docs/drafts/monday-imole-result-inheritance-2026-10-16.sql`. Do not rerun. The public fallback is regenerated from production and included in the organiser-authorised commit/push together with the inheritance confirmation policy. No SQL receipt is rerun during release.

## Initial replacement receipt (superseded only where noted above)

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
