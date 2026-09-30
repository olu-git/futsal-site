-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Preserves marker, Auth user and administrator membership.
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
select
  exists(select 1 from private.admin_users) as administrator_membership_preserved,
  exists(select 1 from fis_fixture_test.project_marker m where m.disposable_admin_user_id is not null) as marker_admin_preserved,
  not exists(select 1 from public.teams t where t.id='00000000-0000-4000-8000-00000000c806')
    and not exists(select 1 from public.competition_seasons cs where cs.id='00000000-0000-4000-8000-00000000c805')
    and not exists(select 1 from public.competitions c where c.id='00000000-0000-4000-8000-00000000c804')
    and not exists(select 1 from public.seasons s where s.id='00000000-0000-4000-8000-00000000c801')
    and not exists(select 1 from public.categories c where c.id='00000000-0000-4000-8000-00000000c802')
    and not exists(select 1 from public.locations l where l.id='00000000-0000-4000-8000-00000000c803') as concurrency_records_removed;
