-- APPLIED RECEIPT ONLY. Applied with explicit organiser authority on 22 October 2026. DO NOT RERUN.
-- Narrow organiser-confirmed correction: Pops 12-4 Umoja Stars, 14 October 2026.
-- Publishes the existing admin-created correction draft; no duplicate revision.
-- Prepared 22 October. Baseline guarded; never rerun after application.
BEGIN;
SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='30s';
LOCK TABLE public.result_versions IN SHARE ROW EXCLUSIVE MODE;
SELECT id FROM public.fixtures WHERE id='48c204ff-64e9-414c-b6c8-17217afbc9f7' FOR UPDATE;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.result_versions WHERE id='e0fd416e-874e-4d41-83c8-7121bbd86e32' AND fixture_id='48c204ff-64e9-414c-b6c8-17217afbc9f7' AND revision=1 AND status='published' AND home_score=4 AND away_score=12 AND updated_at='2026-10-15T08:58:03.138018+00:00'::timestamptz) THEN RAISE EXCEPTION 'Pops result baseline changed; stop'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.fixtures WHERE id='48c204ff-64e9-414c-b6c8-17217afbc9f7' AND home_team_id='8902231b-a7f3-474b-96da-c8b3ac09c74b' AND away_team_id='bafe147f-c3ac-4285-8159-f8e13a06e067' AND match_date='2026-10-14' AND competition_season_id='be008d39-f175-45c1-a232-2148d84b1cf9') THEN RAISE EXCEPTION 'Pops fixture changed; stop'; END IF;
 IF EXISTS(SELECT 1 FROM public.result_versions WHERE fixture_id='48c204ff-64e9-414c-b6c8-17217afbc9f7' AND revision>2) THEN RAISE EXCEPTION 'Newer result exists; stop'; END IF;
END $$;
CREATE TEMP TABLE pops_protected ON COMMIT DROP AS
SELECT 'fixtures' kind,md5(coalesce(jsonb_agg(to_jsonb(f) ORDER BY id)::text,'[]')) hash FROM public.fixtures f
UNION ALL SELECT 'other_results',md5(coalesce(jsonb_agg(to_jsonb(v) ORDER BY id)::text,'[]')) FROM public.result_versions v WHERE id NOT IN ('e0fd416e-874e-4d41-83c8-7121bbd86e32','5c5c67da-8014-4785-87a8-3407a7e95dcd')
UNION ALL SELECT 'teams',md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]')) FROM public.teams t;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.result_versions WHERE id='5c5c67da-8014-4785-87a8-3407a7e95dcd' AND fixture_id='48c204ff-64e9-414c-b6c8-17217afbc9f7' AND revision=2 AND status='draft' AND home_score=12 AND away_score=4 AND supersedes_result_id='e0fd416e-874e-4d41-83c8-7121bbd86e32' AND updated_at='2026-10-21 15:05:16.401581+00'::timestamptz) THEN RAISE EXCEPTION 'Existing admin correction draft changed'; END IF;
END $$;
CREATE TEMP TABLE pops_correction ON COMMIT DROP AS SELECT id FROM public.result_versions WHERE id='5c5c67da-8014-4785-87a8-3407a7e95dcd';
UPDATE public.result_versions SET status='superseded' WHERE id='e0fd416e-874e-4d41-83c8-7121bbd86e32';
UPDATE public.result_versions SET status='published' WHERE id=(SELECT id FROM pops_correction);
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.result_versions WHERE id='e0fd416e-874e-4d41-83c8-7121bbd86e32' AND status='superseded' AND home_score=4 AND away_score=12) OR NOT EXISTS(SELECT 1 FROM public.result_versions WHERE id=(SELECT id FROM pops_correction) AND status='published' AND home_score=12 AND away_score=4 AND supersedes_result_id='e0fd416e-874e-4d41-83c8-7121bbd86e32' AND published_at IS NOT NULL) THEN RAISE EXCEPTION 'Correction verification failed'; END IF;
 IF (SELECT md5(coalesce(jsonb_agg(to_jsonb(f) ORDER BY id)::text,'[]')) FROM public.fixtures f) IS DISTINCT FROM (SELECT hash FROM pops_protected WHERE kind='fixtures') OR (SELECT md5(coalesce(jsonb_agg(to_jsonb(v) ORDER BY id)::text,'[]')) FROM public.result_versions v WHERE id NOT IN ('e0fd416e-874e-4d41-83c8-7121bbd86e32','5c5c67da-8014-4785-87a8-3407a7e95dcd') AND id<>(SELECT id FROM pops_correction)) IS DISTINCT FROM (SELECT hash FROM pops_protected WHERE kind='other_results') OR (SELECT md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]')) FROM public.teams t) IS DISTINCT FROM (SELECT hash FROM pops_protected WHERE kind='teams') THEN RAISE EXCEPTION 'Unrequested data changed'; END IF;
END $$;
COMMIT;
