-- APPLIED RECEIPT ONLY. Do not rerun. Applied through the authorised production connector on 16 October 2026.
-- Imole organiser correction: keep the fresh UUID/readable ID; update display name, provisional black kit and confirmed availability note.
BEGIN;
SET LOCAL lock_timeout='5s';
LOCK TABLE public.teams,public.team_fixture_notes IN SHARE ROW EXCLUSIVE MODE;
CREATE TEMP TABLE imole_profile_protected ON COMMIT DROP AS
 select 'fixtures'::text as kind,md5(jsonb_agg(to_jsonb(f) order by id)::text) as hash from public.fixtures f
 UNION ALL select 'results',md5(jsonb_agg(to_jsonb(r) order by id)::text) from public.result_versions r
 UNION ALL select 'preferences',md5(coalesce(jsonb_agg(to_jsonb(p) order by id)::text,'[]')) from public.team_kickoff_preferences p;
DO $$ BEGIN
 IF NOT EXISTS(select 1 from public.teams where id='aae18510-0f33-494b-8962-d7a5e86d0bf0' and competition_season_id='62ce7ec9-459e-4acf-bec5-c6734a3199ef' and name='Imole' and legacy_id='mon-imole' and status='active' and kit_colour is null and profile_version=1) THEN RAISE EXCEPTION 'Imole profile changed; review required'; END IF;
 IF EXISTS(select 1 from public.team_fixture_notes where team_id='aae18510-0f33-494b-8962-d7a5e86d0bf0') OR EXISTS(select 1 from public.team_kickoff_preferences where team_id='aae18510-0f33-494b-8962-d7a5e86d0bf0') THEN RAISE EXCEPTION 'Unexpected existing Imole preferences'; END IF;
 IF EXISTS(select 1 from public.teams where competition_season_id='62ce7ec9-459e-4acf-bec5-c6734a3199ef' and lower(btrim(name))='imole united') THEN RAISE EXCEPTION 'Imole United name collision'; END IF;
END $$;
UPDATE public.teams SET name='Imole United',kit_colour='#111111',profile_version=profile_version+1 WHERE id='aae18510-0f33-494b-8962-d7a5e86d0bf0';
INSERT INTO public.team_fixture_notes(team_id,notes) VALUES('aae18510-0f33-494b-8962-d7a5e86d0bf0','Organiser-confirmed 16 October 2026: team name Imole United; currently no kickoff restrictions (19:00, 19:40, 20:20 and 21:00 all available). Black shirts for now. Distinct new team replacing Monday Buckle City from Round 2; no completed results or points transferred.');
DO $$ BEGIN
 IF (select md5(jsonb_agg(to_jsonb(f) order by id)::text) from public.fixtures f) IS DISTINCT FROM (select hash from imole_profile_protected where kind='fixtures') OR (select md5(jsonb_agg(to_jsonb(r) order by id)::text) from public.result_versions r) IS DISTINCT FROM (select hash from imole_profile_protected where kind='results') OR (select md5(coalesce(jsonb_agg(to_jsonb(p) order by id)::text,'[]')) from public.team_kickoff_preferences p) IS DISTINCT FROM (select hash from imole_profile_protected where kind='preferences') THEN RAISE EXCEPTION 'Fixtures/results/preferences changed; rollback'; END IF;
END $$;
COMMIT;
SELECT id,legacy_id,name,kit_colour,profile_version FROM public.teams WHERE id='aae18510-0f33-494b-8962-d7a5e86d0bf0';

