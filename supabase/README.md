# FIS Supabase preparation

This directory contains a schema migration only. It has not been applied to any Supabase project. The public website still reads local JSON and remains a GitHub Pages static export.

## Apply later

1. Review the migration and test it against a disposable/local Supabase database first. Confirm the project uses PostgreSQL 15 or newer (the standings view uses `security_invoker`). After applying it and enrolling the administrator, run `verification/verify_initial_fis_admin_schema.sql`; the verification data is wrapped in a transaction and rolled back.
2. Create the single administrator through Supabase Auth with email/password, confirm the address `contact@futsalindoorsoccer.com.au`, then enrol that Auth user in `private.admin_users` using a privileged migration or SQL Editor session. Do not insert a user or password into this schema file. The singleton index and the confirmed-email check prevent a second initial administrator.
3. Apply `supabase/migrations/202609250001_initial_fis_admin_schema.sql` through the Supabase migration workflow after approval. Do not run it against production as part of the current task.
4. Use [SEASON_IMPORT.md](SEASON_IMPORT.md) to stage and reconcile regular-season data. Import all competition data as drafts, compare calculated standings with the JSON site, then publish deliberately. The in-progress 2026 knockout series remains JSON-managed for this release.
5. Add the Supabase URL and publishable key to local environment configuration when the application integration is built. The service-role key must never be exposed in browser code or committed.

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
