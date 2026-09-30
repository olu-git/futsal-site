# Admin standing adjustments audit

## Existing schema

`public.standing_adjustments` stores UUID identity, competition season and team references, optional legacy ID, signed integer deltas for played, wins, draws, losses, goals for, goals against and points, a mandatory non-blank reason, `draft` or `published` state, and timestamps. Composite foreign keys keep teams inside their competition season. RLS permits public reads only for published adjustments in public competition seasons; administrators can manage all rows. Generic audit triggers record changes.

`public.standings` combines published regular-season results with published adjustments and includes standings-eligible teams. Draft adjustments neither affect the view nor anonymous reads. The public Supabase loader and generated fallback snapshot request published adjustments only.

## Implemented UI

`/admin/standings` loads current published Monday and Wednesday competition editions, the derived table, team kit colours and adjustment history through the authenticated browser client. It supports signed whole-number deltas, original/projected values, mandatory reasons, draft saves and confirmation before immediate publication. It states that adjustments alter tables, not match scores, and that snapshot automation is inactive.

## Transactional package

`202609290001_transactional_standing_adjustments.sql` adds pending review, row versions, immutable-published enforcement, linked correction/reversal drafts and a one-follow-up constraint. Secure RPCs save versioned drafts, transition lifecycle states atomically and create compensating reversals or correction drafts. Existing published imports remain published and continue contributing unchanged.

Disposable verification completed successfully: schema preflight, functional verification, rollback zero-record check and genuine two-session concurrency all passed. Session A committed; Session B waited and was rejected with SQLSTATE `40001`. Concurrency verification, cleanup and the final zero-record check passed.

Production preflight recorded `teams_before = 34`, `adjustments_before = 38`, `published_adjustments_before = 38` and migration readiness true. The migration applied successfully, every postflight field returned true and no artificial production adjustment was created.
