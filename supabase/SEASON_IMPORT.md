# Regular-season import plan

The schema migration deliberately contains no live data. Prepare a separate, reviewable import artifact from the latest approved source snapshot immediately before import. Reconcile `feature/new-website` with the deployed competition data before treating either as canonical.

## Inputs

- `src/data/teams.json`: team IDs, names, active state, night, division, kit colour.
- `src/data/monday-fixtures.json` and `src/data/wednesday-fixtures.json`: fixture ID, round, date, time, court, participants, completed scores and notes.
- `src/data/standings-adjustments.json`: played, W/D/L, goals and points deltas; `note` becomes the required reason.
- `src/lib/standings.ts`: current 3/1/0 points calculation and tie order (points, goal difference, goals for, name).

The current knockout series is intentionally excluded from the first Supabase import. `src/data/season-2026-s1.json` and `src/lib/finals.ts` remain its source of truth until the Monday and Wednesday finals are complete.

## Import sequence

1. Take a read-only snapshot of the teams, both fixture files, and standings adjustments, then record their hashes. Validate unique legacy IDs, all team references, fixture slots, completed score presence, and adjustment reasons. Resolve any divergence between the feature branch and deployed data with the league operator.
2. In a separate import migration or reviewed admin import job, create the dated season, men's category, Endeavour Hills location, stable Monday/Wednesday Division A competitions, and one draft `competition_seasons` row for each night. Map every source team/fixture/adjustment ID to a UUID using the `legacy_id` columns. Translate the JSON active flag into an explicit team status and keep historical teams rather than deleting them.
3. Import team profiles, `standings_eligible`, and approved kit colours. A historical team may be inactive, withdrawn, or replaced while remaining standings-eligible. A knockout-only replacement may be active but standings-ineligible. Put confirmed free-text preferences in the admin-only `team_fixture_notes` table and structured times in `team_kickoff_preferences` only after checking the source policy; do not invent a time constraint from a match's past start time.
4. Import every regular-season fixture by legacy ID as draft. For completed fixtures create one result version (revision 1) with the recorded home/away scores. Forfeit metadata should be set only where the source explicitly confirms a forfeit. Do not infer a forfeit from a 5-0 score.
5. Import each standing adjustment with all seven numeric deltas and its non-empty reason. Investigate any missing reason instead of generating one. Keep adjustments draft until the comparison is complete.
6. In an isolated test database, publish the regular-season fixture, result, and adjustment rows, then the two competition-season editions. Compare `public.standings` for every eligible team and every column with `calculateStandings`; confirm active-team totals separately from standings eligibility, then compare all regular-season results and fixtures. Investigate any mismatch before production import.
7. After approval, repeat the validated import in production using a privileged migration/import job with an idempotency plan keyed by `legacy_id`. Review RLS as `anon`, a non-admin authenticated user and the enrolled administrator. Keep a backup and an explicit correction plan; never overwrite a published result in place.

The website will continue to use JSON until a separately approved Supabase-backed repository adapter and admin interface are implemented. Knockout fixtures and results continue to be edited through JSON and VS Code/Codex for the rest of the current finals series. This import plan does not run SQL or alter deployment.
