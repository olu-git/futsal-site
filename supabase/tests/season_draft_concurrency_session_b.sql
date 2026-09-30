-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
begin;
select fis_fixture_test.assert_disposable();
select set_config('request.jwt.claim.sub',(select m.disposable_admin_user_id::text from fis_fixture_test.project_marker m where m.project_name='fis-fixture-test'),true);
select set_config('request.jwt.claim.role','authenticated',true);
select * from public.activate_season_draft((select d.id from public.season_drafts d where d.name='__FIS season concurrency target__'),2,'ACTIVATE');
rollback;
