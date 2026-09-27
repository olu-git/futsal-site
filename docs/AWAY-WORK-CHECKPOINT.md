# Away-work checkpoint

- Starting branch: `feature/new-website`
- Starting commit: `2a726f8c5c668db0be2cf9f706081c8dee627963`
- Work remains uncommitted for review.

## Completed

- Priority 1: added read-only production fixture migration preflight/postflight SQL and a production runbook.
- Priority 2: added the statically exported `/admin/fixtures` route, authenticated browser-side data access, RPC-backed draft/review/publish actions, fixture/change-set filtering, manual multi-change editing, create/cancel operations, local JSON parsing and preview, validation display, comparison review, published history display, responsive mobile sheet styling, and the pre-migration inactive state.
- Added focused tests for data separation, sorting, JSON errors, comparisons, inactive schema handling, static/browser-only architecture, venue-wide occupancy loading, and read-only production diagnostics.
- Completed local visual and interaction QA with a temporary synthetic-data route. The route was removed before final verification and is not part of the production export.
- Reviewed 1440px, 1024px, 768px, 390px and 360px layouts. Tested night, round and team filtering; fixture selection; mobile sheet locking, Escape close and focus restoration; mobile admin navigation; warning acknowledgement; JSON error/preview/editor handoff; and the publication confirmation boundary without accepting it.
- Added change-set reset, adding multiple existing fixtures, status/source/timestamp history, clearer tablet stacking, long-name wrapping, and a compact mobile sticky action area.
- Corrected local conflict validation to load regular-season occupancy across every active or published competition season at the selected physical location. Server-side publication validation remains authoritative.

## Files changed

- `supabase/production/fixture_change_preflight.sql`
- `supabase/production/fixture_change_postflight.sql`
- `docs/PRODUCTION-FIXTURE-MIGRATION.md`
- `src/app/admin/fixtures/page.tsx`
- `src/app/admin/fixtures/FixturesManager.tsx`
- `src/lib/admin/fixtures-data.ts`
- `src/lib/admin/fixtures-actions.ts`
- `src/app/globals.css`
- `tests/admin-fixtures.test.ts`
- `docs/AWAY-WORK-CHECKPOINT.md`

## Remaining limitations

- Snapshot automation remains deliberately inactive. Fixture publication reports this rather than adding a new trigger path; integrate retry only when automation activation is separately approved.
- Creator/reviewer display is limited to safe status/timestamps because private identities are intentionally not exposed.
- No real authenticated mutation was submitted. Loading, inactive-schema and general-error states are covered by component logic and automated checks rather than a live Supabase session.

## Verification

- 78 automated tests passed.
- ESLint, TypeScript and the production static build passed.
- Finals, snapshot, season source and generated-import checks passed.
- The build exported `/`, `/monday-night`, `/wednesday-night`, `/admin`, `/admin/login`, `/admin/results` and `/admin/fixtures`.
- The temporary `/admin/fixtures-visual-test` route was removed and is absent from the final export.
- Production migration preflight and postflight contain read-only queries only, no credentials, and no data/schema mutation statements.
- The runbook separates preflight, migration and postflight, includes explicit stop conditions, and directs failed executions to reviewed forward repair rather than destructive rollback.

## Exact next action

Review this uncommitted checkpoint and approve the fixture-change migration package before any production application. Snapshot automation activation remains a separate decision.

Supabase was not accessed or mutated. The production migration was not applied. Snapshot automation remains inactive. Competition/finals/grading/knockout JSON was unchanged. Nothing was committed, pushed, merged or deployed.
