-- APPLIED RECEIPT ONLY: 22 October 2026, explicitly authorised by the organiser. DO NOT RERUN.
-- Published revision 2 at 2026-10-22 03:30:18.36549+00: Umoja Stars 9-11 Misfits.
-- Admin browser saved the correction draft but could not complete publication.
-- Existing revision 2 was published; original revision 1 remains superseded with its scores intact.
-- Local rehearsal verified rollback, audit append, protected-data hashes and stale-repeat rejection.
-- Publishes the existing admin-created revision 2; no duplicate revision.
-- Preserve original scores, fixture assignments and automatic audit history.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
LOCK TABLE public.result_versions IN SHARE ROW EXCLUSIVE MODE;
SELECT id FROM public.fixtures WHERE id='e612c91b-5ebf-4343-b8f6-03cd6ad2382e' FOR UPDATE;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.fixtures WHERE id='e612c91b-5ebf-4343-b8f6-03cd6ad2382e'
  AND competition_season_id='be008d39-f175-45c1-a232-2148d84b1cf9'
  AND home_team_id='bafe147f-c3ac-4285-8159-f8e13a06e067' AND away_team_id='92b8f805-41b1-446a-b843-6f7cc7083e90'
  AND match_date='2026-10-21' AND kickoff_time='21:00' AND court=1)
 THEN RAISE EXCEPTION 'Fixture baseline changed; stop'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.result_versions WHERE id='7d52134b-8333-4e02-bb98-7a2dd6885015'
  AND fixture_id='e612c91b-5ebf-4343-b8f6-03cd6ad2382e' AND revision=1 AND status='published'
  AND home_score=11 AND away_score=9 AND forfeit_side IS NULL
  AND updated_at='2026-10-21T15:10:58.780271+00:00'::timestamptz)
 THEN RAISE EXCEPTION 'Published result baseline changed; stop'; END IF;
 IF EXISTS (SELECT 1 FROM public.result_versions WHERE fixture_id='e612c91b-5ebf-4343-b8f6-03cd6ad2382e' AND revision>2)
 THEN RAISE EXCEPTION 'Another correction exists; inspect before proceeding'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.result_versions WHERE id='7f6ee7ce-4540-4f19-a6c7-9f35df7f3ce7'
  AND fixture_id='e612c91b-5ebf-4343-b8f6-03cd6ad2382e' AND revision=2 AND status='draft'
  AND home_score=9 AND away_score=11 AND forfeit_side IS NULL
  AND supersedes_result_id='7d52134b-8333-4e02-bb98-7a2dd6885015'
  AND correction_reason='Organiser correction: Misfits won 11–9; Umoja Stars scored 9 and Misfits scored 11.'
  AND updated_at='2026-10-22T03:28:18.29056+00:00'::timestamptz)
 THEN RAISE EXCEPTION 'Existing admin correction draft changed; stop'; END IF;
END $$;
CREATE TEMP TABLE umoja_protected ON COMMIT DROP AS
 SELECT 'fixtures' kind,md5(coalesce(jsonb_agg(to_jsonb(f) ORDER BY id)::text,'[]')) hash FROM public.fixtures f
 UNION ALL SELECT 'teams',md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]')) FROM public.teams t
 UNION ALL SELECT 'other_results',md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY id)::text,'[]')) FROM public.result_versions r WHERE fixture_id<>'e612c91b-5ebf-4343-b8f6-03cd6ad2382e';
UPDATE public.result_versions SET status='superseded' WHERE id='7d52134b-8333-4e02-bb98-7a2dd6885015';
UPDATE public.result_versions SET status='published' WHERE id='7f6ee7ce-4540-4f19-a6c7-9f35df7f3ce7';
DO $$ BEGIN
 IF (SELECT count(*) FROM public.result_versions WHERE fixture_id='e612c91b-5ebf-4343-b8f6-03cd6ad2382e' AND status='published' AND home_score=9 AND away_score=11 AND published_at IS NOT NULL AND supersedes_result_id='7d52134b-8333-4e02-bb98-7a2dd6885015')<>1
 THEN RAISE EXCEPTION 'Corrected result verification failed'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.result_versions WHERE id='7d52134b-8333-4e02-bb98-7a2dd6885015' AND status='superseded' AND home_score=11 AND away_score=9)
 THEN RAISE EXCEPTION 'Original result preservation failed'; END IF;
 IF EXISTS (SELECT 1 FROM umoja_protected p JOIN (
  SELECT 'fixtures' kind,md5(coalesce(jsonb_agg(to_jsonb(f) ORDER BY id)::text,'[]')) hash FROM public.fixtures f
  UNION ALL SELECT 'teams',md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]')) FROM public.teams t
  UNION ALL SELECT 'other_results',md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY id)::text,'[]')) FROM public.result_versions r WHERE fixture_id<>'e612c91b-5ebf-4343-b8f6-03cd6ad2382e'
 ) actual USING(kind) WHERE p.hash IS DISTINCT FROM actual.hash)
 THEN RAISE EXCEPTION 'Unrequested competition data changed'; END IF;
END $$;
COMMIT;
