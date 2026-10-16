-- APPLIED RECEIPT ONLY. Do not rerun. Organiser-requested result inheritance applied on 16 October 2026.
-- Organiser-authorised inheritance of Monday Buckle City's Round 1 loss by Imole United.
-- Existing fixture/result UUIDs and 5-0 score are preserved; no new result or points adjustment.
BEGIN;
SET LOCAL timezone='UTC'; SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='45s';
LOCK TABLE public.fixtures,public.teams,public.team_fixture_notes IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.result_versions,public.team_kickoff_preferences,public.standing_adjustments,public.competition_seasons,public.seasons IN SHARE MODE;
DO $$ BEGIN
 IF (select md5(jsonb_agg(to_jsonb(f) order by id)::text) from public.fixtures f)<>'ef259b455eee5be598021cb0c6b0e082' OR (select md5(jsonb_agg(to_jsonb(r) order by id)::text) from public.result_versions r)<>'fb8afcb4c1e8fe901add297074502ab0' THEN RAISE EXCEPTION 'Fixture/results baseline changed; stop'; END IF;
 IF NOT EXISTS(select 1 from public.fixtures where id='b6b1a297-478a-4e71-a674-4228f2f11107' and competition_season_id='62ce7ec9-459e-4acf-bec5-c6734a3199ef' and round_number=1 and match_date='2026-10-12' and kickoff_time='19:40' and court=1 and home_team_id='544ff92b-0753-4e4f-9feb-bdcdf9c74a98' and away_team_id='997291fd-33ff-40cc-9fd8-be732f6e07ca' and schedule_version=4 and publication_state='published') THEN RAISE EXCEPTION 'Round 1 attribution baseline changed'; END IF;
 IF NOT EXISTS(select 1 from public.result_versions where id='ee9f7b8d-64cc-4d4c-b9f1-af3c034efaef' and fixture_id='b6b1a297-478a-4e71-a674-4228f2f11107' and status='published' and home_score=5 and away_score=0) THEN RAISE EXCEPTION 'Expected 5-0 result is missing'; END IF;
 IF NOT EXISTS(select 1 from public.teams where id='aae18510-0f33-494b-8962-d7a5e86d0bf0' and name='Imole United' and legacy_id='mon-imole' and competition_season_id='62ce7ec9-459e-4acf-bec5-c6734a3199ef' and status='active' and standings_eligible and profile_version=2) THEN RAISE EXCEPTION 'Imole profile changed'; END IF;
 IF NOT EXISTS(select 1 from public.team_fixture_notes where team_id='aae18510-0f33-494b-8962-d7a5e86d0bf0' and notes like '%no completed results or points transferred.%') THEN RAISE EXCEPTION 'Private profile note changed; review'; END IF;
END $$;
CREATE TEMP TABLE imole_inheritance_protected ON COMMIT DROP AS
select 'other_fixtures'::text as kind,(select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(f) as row from public.fixtures f where id<>'b6b1a297-478a-4e71-a674-4228f2f11107') protected_rows) as hash
UNION ALL
select 'results'::text as kind,(select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(r) as row from public.result_versions r) protected_rows) as hash
UNION ALL
select 'other_teams'::text as kind,(select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(t) as row from public.teams t where id<>'aae18510-0f33-494b-8962-d7a5e86d0bf0') protected_rows) as hash
UNION ALL
select 'other_notes'::text as kind,(select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(n) as row from public.team_fixture_notes n where team_id<>'aae18510-0f33-494b-8962-d7a5e86d0bf0') protected_rows) as hash
UNION ALL
select 'preferences'::text as kind,(select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(p) as row from public.team_kickoff_preferences p) protected_rows) as hash
UNION ALL
select 'adjustments'::text as kind,(select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(a) as row from public.standing_adjustments a) protected_rows) as hash
UNION ALL
select 'editions'::text as kind,(select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(c) as row from public.competition_seasons c) protected_rows) as hash
UNION ALL
select 'seasons'::text as kind,(select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(s) as row from public.seasons s) protected_rows) as hash
UNION ALL
select 'old_audit'::text as kind,(select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(a) as row from public.admin_audit_log a where transaction_id<>txid_current()) protected_rows) as hash;
CREATE TEMP TABLE imole_inheritance_before ON COMMIT DROP AS select to_jsonb(f) as data from public.fixtures f where id='b6b1a297-478a-4e71-a674-4228f2f11107';
CREATE TEMP TABLE imole_inheritance_team_before ON COMMIT DROP AS select to_jsonb(t) as data from public.teams t where id='aae18510-0f33-494b-8962-d7a5e86d0bf0';
UPDATE public.fixtures SET away_team_id='aae18510-0f33-494b-8962-d7a5e86d0bf0' WHERE id='b6b1a297-478a-4e71-a674-4228f2f11107';
UPDATE public.teams SET profile_version=profile_version+1 WHERE id='aae18510-0f33-494b-8962-d7a5e86d0bf0';
UPDATE public.team_fixture_notes SET notes='Latest organiser correction, 16 October 2026: Imole United inherits Monday Buckle City''s Round 1 0-5 loss to Blue Dragons on 12 October. The existing result is attributed to mon-imole; do not duplicate it or add a standings adjustment. This supersedes the earlier no-transfer instruction. Name, black kit, unrestricted availability and future fixtures are unchanged.'||E'\n\nEarlier superseded context:\n'||notes WHERE team_id='aae18510-0f33-494b-8962-d7a5e86d0bf0';
DO $$ BEGIN
 IF (select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(f) as row from public.fixtures f where id<>'b6b1a297-478a-4e71-a674-4228f2f11107') protected_rows) IS DISTINCT FROM (select hash from imole_inheritance_protected where kind='other_fixtures') THEN RAISE EXCEPTION 'Protected other_fixtures changed; rollback'; END IF;
IF (select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(r) as row from public.result_versions r) protected_rows) IS DISTINCT FROM (select hash from imole_inheritance_protected where kind='results') THEN RAISE EXCEPTION 'Protected results changed; rollback'; END IF;
IF (select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(t) as row from public.teams t where id<>'aae18510-0f33-494b-8962-d7a5e86d0bf0') protected_rows) IS DISTINCT FROM (select hash from imole_inheritance_protected where kind='other_teams') THEN RAISE EXCEPTION 'Protected other_teams changed; rollback'; END IF;
IF (select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(n) as row from public.team_fixture_notes n where team_id<>'aae18510-0f33-494b-8962-d7a5e86d0bf0') protected_rows) IS DISTINCT FROM (select hash from imole_inheritance_protected where kind='other_notes') THEN RAISE EXCEPTION 'Protected other_notes changed; rollback'; END IF;
IF (select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(p) as row from public.team_kickoff_preferences p) protected_rows) IS DISTINCT FROM (select hash from imole_inheritance_protected where kind='preferences') THEN RAISE EXCEPTION 'Protected preferences changed; rollback'; END IF;
IF (select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(a) as row from public.standing_adjustments a) protected_rows) IS DISTINCT FROM (select hash from imole_inheritance_protected where kind='adjustments') THEN RAISE EXCEPTION 'Protected adjustments changed; rollback'; END IF;
IF (select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(c) as row from public.competition_seasons c) protected_rows) IS DISTINCT FROM (select hash from imole_inheritance_protected where kind='editions') THEN RAISE EXCEPTION 'Protected editions changed; rollback'; END IF;
IF (select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(s) as row from public.seasons s) protected_rows) IS DISTINCT FROM (select hash from imole_inheritance_protected where kind='seasons') THEN RAISE EXCEPTION 'Protected seasons changed; rollback'; END IF;
IF (select md5(coalesce(jsonb_agg(row order by row::text)::text,'[]')) from (select to_jsonb(a) as row from public.admin_audit_log a where transaction_id<>txid_current()) protected_rows) IS DISTINCT FROM (select hash from imole_inheritance_protected where kind='old_audit') THEN RAISE EXCEPTION 'Protected old_audit changed; rollback'; END IF;
 IF (select to_jsonb(f)-'away_team_id'-'schedule_version'-'updated_at' from public.fixtures f where id='b6b1a297-478a-4e71-a674-4228f2f11107') IS DISTINCT FROM (select data-'away_team_id'-'schedule_version'-'updated_at' from imole_inheritance_before) THEN RAISE EXCEPTION 'Unrequested fixture change'; END IF;
 IF (select to_jsonb(t)-'profile_version'-'updated_at' from public.teams t where id='aae18510-0f33-494b-8962-d7a5e86d0bf0') IS DISTINCT FROM (select data-'profile_version'-'updated_at' from imole_inheritance_team_before) THEN RAISE EXCEPTION 'Imole identity/profile changed'; END IF;
 IF NOT EXISTS(select 1 from public.fixtures where id='b6b1a297-478a-4e71-a674-4228f2f11107' and away_team_id='aae18510-0f33-494b-8962-d7a5e86d0bf0' and schedule_version=5) THEN RAISE EXCEPTION 'Wrong correction outcome'; END IF;
 IF (select count(*) from public.fixtures where home_team_id='aae18510-0f33-494b-8962-d7a5e86d0bf0' or away_team_id='aae18510-0f33-494b-8962-d7a5e86d0bf0')<>30 THEN RAISE EXCEPTION 'Expected 30 Imole games including inherited Round 1'; END IF;
END $$;
COMMIT;
SELECT f.id,f.round_number,f.match_date,h.name home_team,a.name away_team,r.home_score,r.away_score,r.id result_id
 FROM public.fixtures f JOIN public.teams h ON h.id=f.home_team_id JOIN public.teams a ON a.id=f.away_team_id JOIN public.result_versions r ON r.fixture_id=f.id AND r.status='published' WHERE f.id='b6b1a297-478a-4e71-a674-4228f2f11107';

