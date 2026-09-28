# Seasons and competitions implementation plan

1. Add an administrator-only transactional RPC that creates a season and its competition-season editions from selected existing competition definitions. Validate dates, one active edition per competition, unique night/location/division combinations and administrator access.
2. Present location, category, night and division as explicit relationships; do not duplicate these labels onto season rows.
3. Offer an optional reviewed carry-forward of active team profiles and kick-off preferences. Never copy fixtures, results, standings adjustments or audit history.
4. Archive each previous competition season independently. Require confirmation, reject outstanding draft changes and rely on the existing archived-data guards to make historical records read-only.
5. Publish new editions only after team membership and schedule review. Keep draft editions unavailable to anonymous users.
6. Record create, activate, archive and carry-forward operations in the audit log with a required administrative reason.
7. Verify in the disposable project with schema preflight, rollback-only functional checks, concurrent activation attempts, zero-record cleanup and read-only production pre/postflight scripts before production application.
