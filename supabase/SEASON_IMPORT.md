# Completed 2026 regular-season import

The 2026 Season 1 Monday and Wednesday regular-season records were imported to FIS production and verified. `imports/2026-s1/current-season-import.sql` is the deterministic historical import artifact, **not** a patch to run again after ordinary results, team-name, or finals changes. Do not rerun it against the already-imported season.

## Source and boundaries

- `src/data/teams.json`, `monday-fixtures.json`, `wednesday-fixtures.json`, and `standings-adjustments.json` are the reconciled historical source files used by the generator. `docs/COMPETITION-DATA-RECONCILIATION-2026-09-25.md` records the source reconciliation, and `docs/CURRENT-SEASON-IMPORT-RECONCILIATION.md` records the generated mapping and counts.
- `src/data/public-competition-snapshot.json` is the generated fallback for anonymous published regular-season data; Supabase remains the primary source after hydration.
- `src/data/season-2026-s1.json` and `src/lib/finals.ts` own the current finals and grading history. Neither knockout nor grading records are included in the import or public snapshot. Public pages display only the knockout bracket.

## Read-only local checks

```bash
npm run season:import:validate
npm run season:import:check
npm run snapshot:validate
npm run snapshot:check
```

`season:import:generate` regenerates reviewable SQL and a reconciliation report from local source; it does not execute SQL. `snapshot:check` compares the checked-in fallback with anonymously readable published Supabase data and does not write to Supabase. Run the retained read-only production verification SQL only as an explicitly reviewed database check, not as part of a local build.

Future seasons use the authenticated Admin Seasons workflow. Future regular-season edits use the admin Results, Fixtures, Teams, and Standing Adjustments workflows with their publication and correction rules. Preserve stable legacy IDs and published history; do not edit an applied migration to represent a production data correction.
