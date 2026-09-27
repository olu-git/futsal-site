-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Self-contained committed setup for the two-session test.
select fis_fixture_test.assert_disposable();
delete from public.team_fixture_notes n where n.team_id='00000000-0000-4000-8000-00000000c806';
delete from public.team_kickoff_preferences p where p.team_id='00000000-0000-4000-8000-00000000c806';
delete from public.teams t where t.id='00000000-0000-4000-8000-00000000c806';
delete from public.competition_seasons cs where cs.id='00000000-0000-4000-8000-00000000c805';
delete from public.competitions c where c.id='00000000-0000-4000-8000-00000000c804';
delete from public.seasons s where s.id='00000000-0000-4000-8000-00000000c801';
delete from public.categories c where c.id='00000000-0000-4000-8000-00000000c802';
delete from public.locations l where l.id='00000000-0000-4000-8000-00000000c803';
delete from public.admin_audit_log a where a.row_id in (
  '00000000-0000-4000-8000-00000000c801','00000000-0000-4000-8000-00000000c802','00000000-0000-4000-8000-00000000c803',
  '00000000-0000-4000-8000-00000000c804','00000000-0000-4000-8000-00000000c805','00000000-0000-4000-8000-00000000c806'
);
insert into public.seasons(id,name,starts_on,ends_on) values('00000000-0000-4000-8000-00000000c801','__FIS team concurrency season__','2099-01-01','2099-12-31');
insert into public.categories(id,code,name) values('00000000-0000-4000-8000-00000000c802','__fis_team_concurrency__','__FIS team concurrency category__');
insert into public.locations(id,name,address,active) values('00000000-0000-4000-8000-00000000c803','__FIS team concurrency location__','Disposable verification only',true);
insert into public.competitions(id,category_id,location_id,weekday,division,name) values(
  '00000000-0000-4000-8000-00000000c804','00000000-0000-4000-8000-00000000c802','00000000-0000-4000-8000-00000000c803',1,'VERIFY-CONCURRENCY','__FIS team concurrency competition__');
insert into public.competition_seasons(id,competition_id,season_id,lifecycle,publication_state) values(
  '00000000-0000-4000-8000-00000000c805','00000000-0000-4000-8000-00000000c804','00000000-0000-4000-8000-00000000c801','active','draft');
insert into public.teams(id,competition_season_id,name,status,standings_eligible,kit_colour) values(
  '00000000-0000-4000-8000-00000000c806','00000000-0000-4000-8000-00000000c805','__FIS team concurrency__','active',true,'#111111');
select t.id as concurrency_team_id,t.profile_version from public.teams t where t.id='00000000-0000-4000-8000-00000000c806';
