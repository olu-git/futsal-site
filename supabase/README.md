# FIS Supabase operations

The FIS production project has the initial schema, administrator access, completed 2026 regular-season import, fixture change-set workflow, transactional team-profile save, standing-adjustment workflow, and season management installed and verified. Do not rerun an installed migration or the current-season import. The public site is still a GitHub Pages static export: browser reads use the Supabase publishable key and RLS, with a checked-in published-data fallback. Current finals and grading history remain JSON-managed.

## Operating boundaries

1. Use `/admin/` for routine results, fixture, team, standing-adjustment, and season work. Published-result corrections and other changes must follow their reviewed RPC workflows.
2. Keep only the Supabase URL and publishable key in browser configuration. Never expose or commit a secret/service-role key or a database password.
3. For a new migration, first use the guarded disposable verification package and the appropriate read-only production preflight/postflight in `tests/`, `verification/`, and `production/`. The retained runbooks describe those procedures as historical records and future diagnostic references, not instructions to reapply installed migrations.
4. Use [SEASON_IMPORT.md](SEASON_IMPORT.md) for the already-completed import's source and artifact boundaries. Do not run `current-season-import.sql` again for a routine team-name or finals change.
5. Snapshot refresh automation has a separate activation procedure in [PUBLIC-SNAPSHOT-AUTOMATION.md](../docs/PUBLIC-SNAPSHOT-AUTOMATION.md); do not assume the Edge Function is active merely because the workflow file exists.

Migrations do not create Auth users or import current finals. Administrator membership is explicitly enrolled after account creation.

## Model notes

- A competition is the stable category/location/night/division identity. `competition_seasons` links that identity to a dated season and owns its planned, active, or archived lifecycle.
- Each competition may have at most one active competition season. Monday, Wednesday, future locations, categories, and divisions can be active simultaneously and independently.
- Archiving a competition season makes that edition and its teams, preferences, fixtures, results, and adjustments read-only. Publication remains independent from lifecycle.
- Fixtures and standing adjustments have draft/published states. A result can be drafted, submitted for review, published, or superseded. Use `publish_result(result_id)` to atomically replace a published score with a reviewed correction.
- Team status is explicit (`active`, `inactive`, `withdrawn`, or `replaced`) and independent from `standings_eligible`. Public team totals count `status = 'active'`; the ladder includes every standings-eligible historical team regardless of current status.
- Team names are unique within a competition season after trimming and case normalisation.
- `public.standings` is derived per competition season from published regular-season results and published adjustments. It filters on `standings_eligible`, so inactive historical teams can remain while knockout-only replacements stay out. Knockout and grading matches never affect the ladder.
- Draft result versions may have incomplete scores. Publishing requires complete regulation scores; tied knockout results additionally require complete, non-tied penalty scores and a matching winner. Penalty fields are forbidden on non-knockout fixtures.
- Generic fixture stage, match-code-compatible legacy IDs, and penalty fields are retained for future compatibility, but this release does not add a knockout administration model. Current finals stay in JSON until both competitions finish.
- Team fixture notes live in an admin-only one-to-one profile table. Structured kick-off preferences and audit row images are admin-only too.
- Every table in the exposed `public` schema has RLS and explicit grants. The helper schema `private` is not exposed through the Data API.
- The audit log records row-level inserts, updates, and deletes, including membership changes. It is readable only by the administrator and writable only by database-owned triggers.

No payment transactions, medical details, or emergency contacts are stored.
