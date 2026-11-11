-- APPLIED RECEIPT: production transaction 1768, 11 November 2026. DO NOT RERUN.
-- Organiser explicitly approved this guarded SQL exception to the admin workflow.
-- No permissions or results changed. Rehearsed on fresh disposable PostgreSQL:
-- real uniqueness/version/audit triggers, full rollback and safe repeat rejection.
-- 11 November 2026, 21:00: Goldlink Up–Misfits Court 1;
-- Umoja Stars–Kawsar FC Court 2. All other assignments stay unchanged.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
LOCK TABLE public.fixtures, public.result_versions, public.fixture_change_sets
  IN SHARE ROW EXCLUSIVE MODE;
CREATE TEMP TABLE court_fixtures_before ON COMMIT DROP AS SELECT * FROM public.fixtures;
CREATE TEMP TABLE court_results_before ON COMMIT DROP AS SELECT * FROM public.result_versions;
CREATE TEMP TABLE court_audit_before ON COMMIT DROP AS SELECT * FROM public.admin_audit_log;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.fixtures
      WHERE competition_season_id='be008d39-f175-45c1-a232-2148d84b1cf9'
      AND match_date='2026-11-11' AND publication_state='published'
      AND schedule_status='scheduled') <> 8 THEN
    RAISE EXCEPTION 'Tonight schedule changed; inspect before retrying';
  END IF;
  IF (SELECT count(*) FROM public.fixtures f JOIN public.teams h ON h.id=f.home_team_id
      JOIN public.teams a ON a.id=f.away_team_id
      WHERE f.competition_season_id='be008d39-f175-45c1-a232-2148d84b1cf9'
      AND f.match_date='2026-11-11' AND f.kickoff_time='21:00'
      AND f.stage='regular_season' AND f.publication_state='published' AND f.schedule_status='scheduled'
      AND ((f.id='56c55c48-876b-412d-83f1-51ac0e22af69' AND f.court=2
        AND f.schedule_version=8 AND h.name='Goldlink Up' AND a.name='Misfits')
      OR (f.id='1db0e8bc-e51f-4a1a-906c-f76be786383e' AND f.court=1
        AND f.schedule_version=4 AND h.name='Umoja Stars' AND a.name='Kawsar FC'))) <> 2 THEN
    RAISE EXCEPTION 'Court swap baseline changed or already applied';
  END IF;
  IF EXISTS (SELECT 1 FROM public.result_versions WHERE fixture_id IN
      ('56c55c48-876b-412d-83f1-51ac0e22af69','1db0e8bc-e51f-4a1a-906c-f76be786383e')) THEN
    RAISE EXCEPTION 'Result work exists; inspect before changing a played assignment';
  END IF;
  IF EXISTS (SELECT 1 FROM public.fixture_change_sets
      WHERE competition_season_id='be008d39-f175-45c1-a232-2148d84b1cf9'
      AND status IN ('draft','pending_review')) THEN
    RAISE EXCEPTION 'Pending fixture changes require review first';
  END IF;
END $$;
-- Temporarily free both immediate unique court slots inside this transaction.
UPDATE public.fixtures SET publication_state='draft', court=3-court
WHERE id IN ('56c55c48-876b-412d-83f1-51ac0e22af69','1db0e8bc-e51f-4a1a-906c-f76be786383e');
UPDATE public.fixtures SET publication_state='published'
WHERE id IN ('56c55c48-876b-412d-83f1-51ac0e22af69','1db0e8bc-e51f-4a1a-906c-f76be786383e');
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM court_fixtures_before b FULL JOIN public.fixtures f USING(id)
      WHERE CASE WHEN b.id IN ('56c55c48-876b-412d-83f1-51ac0e22af69','1db0e8bc-e51f-4a1a-906c-f76be786383e')
      THEN (to_jsonb(b)-'court'-'schedule_version'-'updated_at') IS DISTINCT FROM
           (to_jsonb(f)-'court'-'schedule_version'-'updated_at')
           OR f.court <> 3-b.court OR f.schedule_version <> b.schedule_version+2
      ELSE to_jsonb(b) IS DISTINCT FROM to_jsonb(f) END) THEN
    RAISE EXCEPTION 'Unexpected fixture change';
  END IF;
  IF EXISTS (SELECT 1 FROM court_results_before b FULL JOIN public.result_versions r USING(id)
      WHERE to_jsonb(b) IS DISTINCT FROM to_jsonb(r)) THEN
    RAISE EXCEPTION 'Results changed';
  END IF;
  IF EXISTS (SELECT 1 FROM court_audit_before b LEFT JOIN public.admin_audit_log a USING(id)
      WHERE to_jsonb(b) IS DISTINCT FROM to_jsonb(a)) THEN
    RAISE EXCEPTION 'Existing audit changed';
  END IF;
END $$;
SELECT txid_current() AS transaction_id, id,court,schedule_version FROM public.fixtures
WHERE id IN ('56c55c48-876b-412d-83f1-51ac0e22af69','1db0e8bc-e51f-4a1a-906c-f76be786383e');
COMMIT;

