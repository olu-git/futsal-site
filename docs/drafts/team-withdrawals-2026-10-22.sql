-- Four organiser-requested withdrawals only. No identity deletion or result changes.
-- APPLIED RECEIPT ONLY: applied 22 October 2026 with explicit organiser approval.
-- Both reviewed fixture sets were confirmed published at version 4 first.
-- Four profiles withdrawn/ineligible; protected-record checks passed. DO NOT RERUN.
BEGIN;
SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='30s';
LOCK TABLE public.teams IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.fixtures,public.result_versions,public.team_fixture_notes,public.team_kickoff_preferences IN SHARE MODE;
CREATE TEMP TABLE oct22_withdraw ON COMMIT DROP AS SELECT * FROM jsonb_to_recordset('[{"id":"1d74c3b0-90ba-4304-aa68-b9681ea4bb9a","name":"Declan''s Delinquents","status":"active","legacy_id":"mon-declans-delinquents","created_at":"2026-10-10T19:11:23.617699+00:00","kit_colour":"#111111","updated_at":"2026-10-13T01:55:32.481516+00:00","profile_version":2,"standings_eligible":true,"competition_season_id":"62ce7ec9-459e-4acf-bec5-c6734a3199ef"},{"id":"2368a5c2-7a91-484a-b201-fde870c85690","name":"Gay Guys","status":"active","legacy_id":"mon-hunger-fc","created_at":"2026-10-10T19:11:23.617699+00:00","kit_colour":"#111111","updated_at":"2026-10-13T01:55:32.481516+00:00","profile_version":3,"standings_eligible":true,"competition_season_id":"62ce7ec9-459e-4acf-bec5-c6734a3199ef"},{"id":"90f4484f-9735-4ba3-a9e9-f165381cf00b","name":"Etihad FC","status":"active","legacy_id":"wed-etihad-fc","created_at":"2026-10-10T19:11:23.617699+00:00","kit_colour":null,"updated_at":"2026-10-10T19:11:23.617699+00:00","profile_version":1,"standings_eligible":true,"competition_season_id":"be008d39-f175-45c1-a232-2148d84b1cf9"},{"id":"c9f73f23-1e6c-42df-a7fa-9a7953d9cb75","name":"Buckle City","status":"active","legacy_id":"wed-buckle-city","created_at":"2026-10-10T19:11:23.617699+00:00","kit_colour":null,"updated_at":"2026-10-10T19:11:23.617699+00:00","profile_version":1,"standings_eligible":true,"competition_season_id":"be008d39-f175-45c1-a232-2148d84b1cf9"}]'::jsonb) AS t(id uuid,competition_season_id uuid,name text,status text,standings_eligible boolean,profile_version bigint,legacy_id text,kit_colour text,created_at timestamptz,updated_at timestamptz);
DO $$ BEGIN
 IF (SELECT count(*) FROM oct22_withdraw)<>4 OR EXISTS(SELECT 1 FROM oct22_withdraw p LEFT JOIN public.teams t USING(id) WHERE t.id IS NULL OR to_jsonb(t) IS DISTINCT FROM to_jsonb(p) OR t.status<>'active' OR NOT t.standings_eligible) THEN RAISE EXCEPTION 'Withdrawal profile baseline changed'; END IF;
 IF EXISTS(SELECT 1 FROM oct22_withdraw p JOIN public.fixtures f ON p.id IN(f.home_team_id,f.away_team_id) WHERE f.match_date>'2026-10-22' AND f.publication_state='published' AND f.schedule_status='scheduled') THEN RAISE EXCEPTION 'Publish replacement future schedule before withdrawing profiles'; END IF;
END $$;
CREATE TEMP TABLE oct22_profile_protected ON COMMIT DROP AS
SELECT 'fixtures' kind,md5(coalesce(jsonb_agg(to_jsonb(f) ORDER BY id)::text,'[]')) hash FROM public.fixtures f
UNION ALL SELECT 'results',md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY id)::text,'[]')) FROM public.result_versions r
UNION ALL SELECT 'other_teams',md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]')) FROM public.teams t WHERE t.id NOT IN(SELECT id FROM oct22_withdraw)
UNION ALL SELECT 'preferences',md5(coalesce(jsonb_agg(to_jsonb(p) ORDER BY id)::text,'[]')) FROM public.team_kickoff_preferences p
UNION ALL SELECT 'notes',md5(coalesce(jsonb_agg(to_jsonb(n) ORDER BY team_id)::text,'[]')) FROM public.team_fixture_notes n;
UPDATE public.teams t SET status='withdrawn',standings_eligible=false,profile_version=t.profile_version+1 FROM oct22_withdraw p WHERE t.id=p.id;
DO $$ BEGIN
 IF (SELECT count(*) FROM public.teams t JOIN oct22_withdraw p USING(id) WHERE t.status='withdrawn' AND NOT t.standings_eligible AND t.profile_version=p.profile_version+1 AND (to_jsonb(t)-'status'-'standings_eligible'-'profile_version'-'updated_at')=(to_jsonb(p)-'status'-'standings_eligible'-'profile_version'-'updated_at'))<>4 THEN RAISE EXCEPTION 'Withdrawal verification failed'; END IF;
 IF EXISTS(SELECT 1 FROM oct22_withdraw p GROUP BY competition_season_id HAVING (SELECT count(*) FROM public.teams t WHERE t.competition_season_id=p.competition_season_id AND t.status='active')<>14) THEN RAISE EXCEPTION 'Expected 14 active teams on each night'; END IF;
 IF (SELECT md5(coalesce(jsonb_agg(to_jsonb(f) ORDER BY id)::text,'[]')) FROM public.fixtures f) IS DISTINCT FROM (SELECT hash FROM oct22_profile_protected WHERE kind='fixtures')
 OR (SELECT md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY id)::text,'[]')) FROM public.result_versions r) IS DISTINCT FROM (SELECT hash FROM oct22_profile_protected WHERE kind='results')
 OR (SELECT md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]')) FROM public.teams t WHERE t.id NOT IN(SELECT id FROM oct22_withdraw)) IS DISTINCT FROM (SELECT hash FROM oct22_profile_protected WHERE kind='other_teams')
 OR (SELECT md5(coalesce(jsonb_agg(to_jsonb(p) ORDER BY id)::text,'[]')) FROM public.team_kickoff_preferences p) IS DISTINCT FROM (SELECT hash FROM oct22_profile_protected WHERE kind='preferences')
 OR (SELECT md5(coalesce(jsonb_agg(to_jsonb(n) ORDER BY team_id)::text,'[]')) FROM public.team_fixture_notes n) IS DISTINCT FROM (SELECT hash FROM oct22_profile_protected WHERE kind='notes') THEN RAISE EXCEPTION 'Unrequested record changed'; END IF;
END $$;
COMMIT;
