# Upcoming fixture adjustments - 16 October 2026

Status: authorised production data release completed on 16 October 2026; application release 7a33d33 deployed successfully. Production preflight matched the reviewed f1388cd baseline. The 25 fixture updates and current season name were applied atomically through the authorised connector. Existing audit/version triggers remained enabled; no admin identity was impersonated.

## Presentation

- Reserve two name lines in every upcoming fixture row; retain shared shirt/form subgrid alignment and full words. Forms remain five squares with the existing font/colours. Notes may legitimately add height.
- Home heading and Full schedule link now share a baseline; season text is a separate row.
- Display recognized season names as `2026 - Season 1` / `2026 - Season 2`, accepting both older formats. Numeric sorting, IDs and separate Current/Previous Season status labels remain unchanged. Admin draft display and archive trophy caption follow the same format.
- Generated fallback was regenerated from production after the transaction and contains the published fixture adjustments and new season labels.
- Preserve the pre-existing generated Next.js AGENTS.md instructions; update only the season-name convention.

## Fixture proposal

Monday: 23 future rows, comprising 8 changed pairings, 12 home/away-only changes and 3 additional slot/court repairs. Wednesday: 2 time changes. No fixture IDs, rounds or playing dates are added or removed.

Upcoming Monday 19 October: Bunyip-Salvos at 19:00 Court 1; Xaywan-Black Magic at 19:00 Court 2. The other six Round 2 matches retain assignments. Upcoming Wednesday 21 October: King ADL-Pops at 19:00 Court 1; Kuq E Zi-Buckle City at 19:40 Court 1. The other six remain unchanged.

The solver minimized changed pair/round assignments first, then orientation changes, with Round 1 and the other Round 2 pairings locked. Slot allocation preserves hard constraints and avoids adding soft exceptions; King ADL at 19:00 is the explicit organiser-requested soft exception. Home/away flips preserve reciprocal meetings and maximum streak three.

| Round/date | Before | After |
|---|---|---|
| 2 / 2026-10-19 | Salvos - Xaywan - 19:00 C1 | Xaywan - Black Magic - 19:00 C2 |
| 2 / 2026-10-19 | Black Magic - Bunyip - 19:00 C2 | Bunyip - Salvos - 19:00 C1 |
| 3 / 2026-10-26 | Buckle City - Black Magic - 21:00 C2 | Black Magic - Buckle City - 21:00 C2 |
| 3 / 2026-10-26 | Xaywan - Declan's Delinquents - 21:00 C1 | Declan's Delinquents - Xaywan - 21:00 C1 |
| 5 / 2026-11-09 | Declan's Delinquents - Black Magic - 21:00 C2 | Black Magic - Declan's Delinquents - 21:00 C2 |
| 5 / 2026-11-09 | Bunyip - Nasaji FC - 19:40 C2 | Nasaji FC - Bunyip - 19:40 C2 |
| 6 / 2026-11-16 | Nasaji FC - Salvos - 19:40 C2 | Salvos - Nasaji FC - 19:40 C2 |
| 8 / 2026-11-30 | Nasaji FC - Buckle City - 19:00 C2 | Nasaji FC - Buckle City - 19:00 C1 |
| 8 / 2026-11-30 | Wildcats - Ghazni United - 20:20 C2 | Bunyip - Wildcats - 19:00 C2 |
| 8 / 2026-11-30 | Salvos - Bunyip - 19:00 C1 | Ghazni United - Salvos - 20:20 C2 |
| 9 / 2026-12-07 | Nasaji FC - AFG - 21:00 C2 | Nasaji FC - AFG - 21:00 C1 |
| 9 / 2026-12-07 | Misfits - King ADL - 19:40 C2 | Misfits - King ADL - 21:00 C2 |
| 9 / 2026-12-07 | Ghazni United - Salvos - 20:20 C1 | Wildcats - Ghazni United - 20:20 C1 |
| 9 / 2026-12-07 | Xaywan - Wildcats - 21:00 C1 | Salvos - Xaywan - 19:40 C2 |
| 10 / 2026-12-14 | Bunyip - Wildcats - 19:00 C1 | Black Magic - Bunyip - 19:00 C1 |
| 10 / 2026-12-14 | Black Magic - Xaywan - 21:00 C2 | Xaywan - Wildcats - 21:00 C2 |
| 16 / 2027-02-08 | Xaywan - Black Magic - 19:40 C1 | Black Magic - Xaywan - 19:40 C1 |
| 17 / 2027-02-15 | Black Magic - Declan's Delinquents - 21:00 C1 | Declan's Delinquents - Black Magic - 21:00 C1 |
| 18 / 2027-02-22 | Nasaji FC - Bunyip - 19:00 C1 | Bunyip - Nasaji FC - 19:00 C1 |
| 20 / 2027-03-15 | Bunyip - Salvos - 19:00 C1 | Salvos - Bunyip - 19:00 C1 |
| 22 / 2027-04-05 | Black Magic - Buckle City - 20:20 C1 | Buckle City - Black Magic - 20:20 C1 |
| 22 / 2027-04-05 | Salvos - Nasaji FC - 19:40 C2 | Nasaji FC - Salvos - 19:40 C2 |
| 30 / 2027-05-31 | Declan's Delinquents - Xaywan - 21:00 C2 | Xaywan - Declan's Delinquents - 21:00 C2 |
| 2 / 2026-10-21 | Kuq E Zi - Buckle City - 19:00 C1 | Kuq E Zi - Buckle City - 19:40 C1 |
| 2 / 2026-10-21 | King ADL - Pops - 19:40 C1 | King ADL - Pops - 19:00 C1 |

## Validation and release

- Complete local 480-fixture projection passed the existing roster-revision validator: 240/night, 30 rounds, 30 games/team, 15 home/15 away, every pair twice with reciprocal homes, one meeting in each half, minimum four-round rematch gap, maximum streak three.
- Dates/calendar, one match/team/round, unique courts/times, Blue Dragons/Rinnai/Bunyip/Umoja/Kuq hard availability and Goldlink/Buckle separation pass. All 16 completed Round 1 rows are byte-for-byte unchanged in the local projection. Results are not updated by this proposal.
- Monday retains one soft exception (played Round 1 Kroos at 21:00). Wednesday has eight including the requested King ADL 19:00 game; no existing hard rule is weakened.
- The JSON imports use the existing admin fixture-change workflow with expected fixture versions. They are retained as applied review receipts, not reusable uploads: the expected versions are now stale.
- Do not re-upload the applied Monday/Wednesday import receipts or rerun the applied SQL. Future edits need a freshly versioned admin plan.
- Persisted current season name is now `2026 - Season 2`, applied in the same transaction. The redundant standalone name-only proposal was removed. No season was recreated or reactivated.
- Fallback generation reads the committed production changes. Matching application/fallback release follows repository checks and the master Pages workflow.
- Initial release used automated checks; subsequent isolated Edge browser checks verified the deployed desktop and mobile layout. Production changes were limited to the authorised 25 future fixtures and current season name.

## Check evidence

207 tests passed; ESLint, non-incremental TypeScript, static production build, snapshot validation/freshness, finals validation and diff whitespace checks passed. Static output contains the new label on Home and both competition pages. Before the data release, structural comparison confirmed only season labels changed; after release the fallback was regenerated from production. The original CLI browser attempt was inconclusive. A supported isolated Edge DevTools run subsequently verified the deployed site at 1440, 768, 390 and 320 CSS pixels: no page overflow, clipped names or form-baseline differences, and Press Start 2P badges. It identified the last row as one pixel shorter because its border was removed; a transparent one-pixel border now preserves equal height. The redundant standalone name-only SQL proposal was removed after the combined applied transaction.

## Production transaction evidence

Fixture hash before: `7c61ac7435b0faa7eaeb0b03d31bd8ba`; after: `108cba318df2a00406f2fd432ee3fc06`. Complete result_versions hash unchanged: `fb8afcb4c1e8fe901add297074502ab0`. All 16 published current-season results remain. The transaction checked unchanged non-target fixtures (including archives and Round 1), all teams/preferences/notes, adjustments, edition lifecycle/publication state, other seasons and previous audit rows. Existing triggers produced 51 audit records: two updates per target fixture plus one season rename. Target schedule versions increased by two. Current season dates and all edition/team IDs are unchanged. A fresh post-commit read passed the full 480-fixture validator.

Pages run [38836988455](https://github.com/olu-git/futsal-site/actions/runs/38836988455) successfully deployed commit `7a33d33032da3b5c869b4054dc0125b567664478`. Home, Monday and Wednesday HTTPS responses returned 200 with the new season label and published fixtures. The row-border correction passed the same 207 tests, lint, TypeScript and static build before its follow-up release.
