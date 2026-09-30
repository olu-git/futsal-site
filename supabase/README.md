# FIS Supabase preparation

The initial schema and administrator foundation have been applied to the FIS project. The public site remains a GitHub Pages static export. The fixture change-set migration in this directory is **local and unapplied**; see [ADMIN-FIXTURES-DESIGN.md](../docs/ADMIN-FIXTURES-DESIGN.md) for its review, verification and rollback steps.

## Apply later

1. The initial schema, administrator enrolment and current-season import are already applied and verified in the FIS project. Do not rerun those migrations or create another administrator for this fixture-change review.
2. Review `migrations/202609270001_fixture_change_sets.sql` and test it against a disposable/local database with the existing schema and a confirmed FIS administrator. Run `verification/verify_fixture_change_sets.sql` there; its test records are wrapped in a transaction and rolled back.
3. Only after separate approval, apply the fixture-change migration through the controlled Supabase migration workflow. Confirm its grants, RLS and fixture visibility before building an Admin Fixtures interface. Do not apply it as part of this task.
4. Use [SEASON_IMPORT.md](SEASON_IMPORT.md) for the existing regular-season import procedure. The in-progress 2026 knockout series remains JSON-managed and is not part of this migration.
5. Keep only the Supabase URL and publishable key in browser environment configuration. Never expose or commit a service-role key.

The migration creates no Auth accounts, seasons, teams, fixtures, scores, or other live competition rows. The only initial administrator allowed by the database is the confirmed Auth account for the email above. Admin users are explicitly enrolled after account creation.

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
