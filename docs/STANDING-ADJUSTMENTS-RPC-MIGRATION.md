# Standing adjustments transactional migration

This package adds draft/review/published lifecycle, versioned edits, immutable published rows and linked correction/reversal drafts. It does not alter existing published deltas or competition JSON.

## Disposable sequence

1. Confirm the selected project is `fis-fixture-test` and run `supabase/tests/disposable_standing_adjustment_schema_preflight.sql` only after applying the reviewed migration.
2. Apply `supabase/migrations/202609290001_transactional_standing_adjustments.sql` once.
3. Rerun the schema preflight; require every Boolean true.
4. Run `supabase/verification/verify_standing_adjustments.sql`; require `standing_adjustment_verification_passed = true`.
5. Run `supabase/tests/disposable_standing_adjustment_zero_check.sql`; require zero leakage and true cleanup.
6. Run `standing_adjustment_concurrency_prepare.sql`.
7. Start Session A, then while it sleeps run Session B. Session B must wait and fail with SQLSTATE `40001`.
8. Run `standing_adjustment_concurrency_verify.sql`; require `session_a_won = true`.
9. Run `standing_adjustment_concurrency_cleanup.sql`; require every result true, then rerun the zero check.

## Production sequence

After disposable verification only: run the read-only production preflight and save counts, apply the exact migration once, insert counts into the postflight placeholders, and require every postflight result true. Stop on any mismatch. Do not activate snapshot automation as part of migration application.

## Completed verification

Disposable schema preflight, functional verification, zero-record check and genuine two-session concurrency verification all passed. Session A committed and Session B waited before being rejected with SQLSTATE `40001`; concurrency verification, cleanup and the final zero-record check passed.

Production preflight recorded `teams_before = 34`, `adjustments_before = 38` and `published_adjustments_before = 38`, with migration readiness true. The migration was applied successfully and every postflight field returned true. No artificial production adjustment was created, reviewed, published, corrected or reversed as part of verification.
