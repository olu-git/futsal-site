-- APPLIED RECEIPT ONLY: 22 October 2026, explicitly authorised by the organiser. DO NOT RERUN.
-- Dream Team addition, confirmed Etihad record inheritance,
-- and Buckle City reinstatement. Future fixtures are a separate reviewed admin import.
-- No permission changes, season activation, fabricated scores, or history deletion.
BEGIN;
SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='30s';
LOCK TABLE public.teams,public.fixtures,public.result_versions,public.team_kickoff_preferences,public.team_fixture_notes IN SHARE ROW EXCLUSIVE MODE;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.competition_seasons WHERE id='be008d39-f175-45c1-a232-2148d84b1cf9' AND lifecycle='active' AND publication_state='published') THEN RAISE EXCEPTION 'Competition state changed'; END IF;
 IF EXISTS(SELECT 1 FROM public.teams WHERE id='bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3' OR (competition_season_id='be008d39-f175-45c1-a232-2148d84b1cf9' AND (legacy_id='wed-dream-team' OR lower(btrim(name))='dream team'))) THEN RAISE EXCEPTION 'Dream Team identity exists; stop'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.teams WHERE id='c9f73f23-1e6c-42df-a7fa-9a7953d9cb75' AND competition_season_id='be008d39-f175-45c1-a232-2148d84b1cf9' AND legacy_id='wed-buckle-city' AND status='withdrawn' AND NOT standings_eligible AND profile_version=2 AND updated_at='2026-10-21T15:23:37.749877+00:00'::timestamptz) THEN RAISE EXCEPTION 'Buckle City baseline changed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.teams WHERE id='90f4484f-9735-4ba3-a9e9-f165381cf00b' AND competition_season_id='be008d39-f175-45c1-a232-2148d84b1cf9' AND status='withdrawn' AND NOT standings_eligible AND profile_version=2) THEN RAISE EXCEPTION 'Etihad baseline changed'; END IF;
 IF EXISTS(SELECT 1 FROM public.fixture_change_sets WHERE competition_season_id='be008d39-f175-45c1-a232-2148d84b1cf9' AND status IN('draft','pending_review')) THEN RAISE EXCEPTION 'Review pending fixture work first'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.fixtures WHERE id='19db805f-e697-4b6b-91c8-62f2dfe89f88' AND competition_season_id='be008d39-f175-45c1-a232-2148d84b1cf9' AND home_team_id='90f4484f-9735-4ba3-a9e9-f165381cf00b' AND away_team_id='b3be09fa-1f9e-4501-be80-ae0346804d31' AND match_date='2026-10-14' AND kickoff_time='19:40:00' AND court=1 AND schedule_version=1) THEN RAISE EXCEPTION 'Inherited fixture baseline changed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.result_versions WHERE id='a1aedbec-85b6-4819-ba25-4784c1baeabc' AND fixture_id='19db805f-e697-4b6b-91c8-62f2dfe89f88' AND status='published' AND revision=1 AND home_score=5 AND away_score=1) THEN RAISE EXCEPTION 'Inherited score baseline changed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.fixtures WHERE id='9771e8bd-f3f3-4d4f-a257-321bfa050482' AND competition_season_id='be008d39-f175-45c1-a232-2148d84b1cf9' AND home_team_id='90f4484f-9735-4ba3-a9e9-f165381cf00b' AND away_team_id='b7102a75-a3ad-488c-b16e-f6da36e7f7ba' AND match_date='2026-10-21' AND kickoff_time='20:20:00' AND court=1 AND schedule_version=1) THEN RAISE EXCEPTION 'Inherited fixture baseline changed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.result_versions WHERE id='247b101c-f213-4956-b17e-f2b6d0e16db3' AND fixture_id='9771e8bd-f3f3-4d4f-a257-321bfa050482' AND status='published' AND revision=1 AND home_score=5 AND away_score=5) THEN RAISE EXCEPTION 'Inherited score baseline changed'; END IF;
END $$;
CREATE TEMP TABLE expansion_protected ON COMMIT DROP AS
 SELECT 'results' kind,md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY id)::text,'[]')) hash FROM public.result_versions r
 UNION ALL SELECT 'fixtures',md5(coalesce(jsonb_agg(to_jsonb(f) ORDER BY id)::text,'[]')) FROM public.fixtures f WHERE id NOT IN('19db805f-e697-4b6b-91c8-62f2dfe89f88','9771e8bd-f3f3-4d4f-a257-321bfa050482')
 UNION ALL SELECT 'teams',md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]')) FROM public.teams t WHERE id<>'c9f73f23-1e6c-42df-a7fa-9a7953d9cb75'
 UNION ALL SELECT 'preferences',md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]')) FROM public.team_kickoff_preferences t
 UNION ALL SELECT 'notes',md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY team_id)::text,'[]')) FROM public.team_fixture_notes t;
CREATE TEMP TABLE inherited_before ON COMMIT DROP AS SELECT id,to_jsonb(f)-'home_team_id'-'away_team_id'-'updated_at'-'schedule_version' preserved FROM public.fixtures f WHERE id IN('19db805f-e697-4b6b-91c8-62f2dfe89f88','9771e8bd-f3f3-4d4f-a257-321bfa050482');
INSERT INTO public.teams(id,competition_season_id,legacy_id,name,kit_colour) VALUES('bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3','be008d39-f175-45c1-a232-2148d84b1cf9','wed-dream-team','Dream Team','#ED1C24');
INSERT INTO public.team_kickoff_preferences(team_id,kickoff_time,classification) VALUES('bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3','19:00','required'),('bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3','19:40','required');
INSERT INTO public.team_fixture_notes(team_id,notes) VALUES('bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3','Only 19:00 or 19:40. Organiser-approved exception: 21:00 against Umoja Stars only. Inherits Etihad FC current-season record with explicit organiser approval on 22 October 2026.');
UPDATE public.teams SET status='active',standings_eligible=true,profile_version=profile_version+1 WHERE id='c9f73f23-1e6c-42df-a7fa-9a7953d9cb75';
UPDATE public.fixtures SET home_team_id=CASE WHEN home_team_id='90f4484f-9735-4ba3-a9e9-f165381cf00b' THEN 'bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3'::uuid ELSE home_team_id END,away_team_id=CASE WHEN away_team_id='90f4484f-9735-4ba3-a9e9-f165381cf00b' THEN 'bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3'::uuid ELSE away_team_id END WHERE id IN('19db805f-e697-4b6b-91c8-62f2dfe89f88','9771e8bd-f3f3-4d4f-a257-321bfa050482');
DO $$ BEGIN
 IF (SELECT count(*) FROM public.teams WHERE competition_season_id='be008d39-f175-45c1-a232-2148d84b1cf9' AND status='active' AND standings_eligible)<>16 THEN RAISE EXCEPTION 'Expected 16 active eligible teams'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.standings WHERE team_id='bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3' AND played=2 AND wins=1 AND draws=1 AND losses=0 AND goals_for=10 AND goals_against=6 AND points=4) THEN RAISE EXCEPTION 'Dream Team inheritance verification failed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.standings WHERE team_id='c9f73f23-1e6c-42df-a7fa-9a7953d9cb75' AND played=2 AND wins=0 AND draws=1 AND losses=1 AND goals_for=7 AND goals_against=13 AND points=1) THEN RAISE EXCEPTION 'Buckle City reinstatement verification failed'; END IF;
 IF EXISTS(SELECT 1 FROM inherited_before b JOIN public.fixtures f USING(id) WHERE b.preserved IS DISTINCT FROM to_jsonb(f)-'home_team_id'-'away_team_id'-'updated_at'-'schedule_version') THEN RAISE EXCEPTION 'Inherited fixture details changed'; END IF;
 IF EXISTS(SELECT 1 FROM expansion_protected p JOIN (
 SELECT 'results' kind,md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY id)::text,'[]')) hash FROM public.result_versions r
 UNION ALL SELECT 'fixtures',md5(coalesce(jsonb_agg(to_jsonb(f) ORDER BY id)::text,'[]')) FROM public.fixtures f WHERE id NOT IN('19db805f-e697-4b6b-91c8-62f2dfe89f88','9771e8bd-f3f3-4d4f-a257-321bfa050482')
 UNION ALL SELECT 'teams',md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]')) FROM public.teams t WHERE id NOT IN('c9f73f23-1e6c-42df-a7fa-9a7953d9cb75','bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3')
 UNION ALL SELECT 'preferences',md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]')) FROM public.team_kickoff_preferences t WHERE team_id<>'bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3'
 UNION ALL SELECT 'notes',md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY team_id)::text,'[]')) FROM public.team_fixture_notes t WHERE team_id<>'bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3'
 ) actual USING(kind) WHERE p.hash IS DISTINCT FROM actual.hash) THEN RAISE EXCEPTION 'Unrequested records changed'; END IF;
END $$;
COMMIT;
