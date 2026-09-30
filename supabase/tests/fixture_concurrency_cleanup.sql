-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Run only after collecting verification evidence. The marker is mandatory.
-- Ordinary cleanup preserves the disposable administrator, Auth user and marker.
-- Published history is immutable in normal use; this disposable-only cleanup
-- disables its guards transactionally and restores them before commit.
begin;
select fis_fixture_test.assert_disposable();

create temporary table _fixture_cleanup_ids (id uuid primary key) on commit drop;
insert into _fixture_cleanup_ids(id)
select id from public.seasons where id = '00000000-0000-4000-8000-0000000f1001'
union select id from public.categories where id = '00000000-0000-4000-8000-0000000f2001'
union select id from public.locations where id = '00000000-0000-4000-8000-0000000f3001'
union select id from public.competitions where id in
  ('00000000-0000-4000-8000-0000000f4001','00000000-0000-4000-8000-0000000f4002')
union select id from public.competition_seasons where id in
  ('00000000-0000-4000-8000-0000000f5001','00000000-0000-4000-8000-0000000f5002')
union select id from public.teams where competition_season_id in
  ('00000000-0000-4000-8000-0000000f5001','00000000-0000-4000-8000-0000000f5002')
union select id from public.fixtures where competition_season_id in
  ('00000000-0000-4000-8000-0000000f5001','00000000-0000-4000-8000-0000000f5002')
union select id from public.fixture_change_sets where id in
  ('00000000-0000-4000-8000-0000000f7001','00000000-0000-4000-8000-0000000f7002')
union select id from public.fixture_change_items where change_set_id in
  ('00000000-0000-4000-8000-0000000f7001','00000000-0000-4000-8000-0000000f7002')
union select id from public.fixture_change_history where change_set_id in
  ('00000000-0000-4000-8000-0000000f7001','00000000-0000-4000-8000-0000000f7002');

alter table public.fixture_change_history disable trigger guard_fixture_change_history;
alter table public.fixture_change_items disable trigger guard_fixture_change_items;
alter table public.fixture_change_sets disable trigger guard_fixture_change_sets;

delete from public.fixture_change_history where change_set_id in
  ('00000000-0000-4000-8000-0000000f7001','00000000-0000-4000-8000-0000000f7002');
delete from public.fixture_change_items where change_set_id in
  ('00000000-0000-4000-8000-0000000f7001','00000000-0000-4000-8000-0000000f7002');
delete from public.fixture_change_sets where id in
  ('00000000-0000-4000-8000-0000000f7001','00000000-0000-4000-8000-0000000f7002');

alter table public.fixture_change_history enable trigger guard_fixture_change_history;
alter table public.fixture_change_items enable trigger guard_fixture_change_items;
alter table public.fixture_change_sets enable trigger guard_fixture_change_sets;

delete from public.fixtures where competition_season_id in
  ('00000000-0000-4000-8000-0000000f5001','00000000-0000-4000-8000-0000000f5002');
delete from public.teams where competition_season_id in
  ('00000000-0000-4000-8000-0000000f5001','00000000-0000-4000-8000-0000000f5002');
delete from public.competition_seasons where id in
  ('00000000-0000-4000-8000-0000000f5001','00000000-0000-4000-8000-0000000f5002');
delete from public.competitions where id in
  ('00000000-0000-4000-8000-0000000f4001','00000000-0000-4000-8000-0000000f4002');
delete from public.locations where id = '00000000-0000-4000-8000-0000000f3001';
delete from public.categories where id = '00000000-0000-4000-8000-0000000f2001';
delete from public.seasons where id = '00000000-0000-4000-8000-0000000f1001';

delete from public.admin_audit_log where row_id in (select id from _fixture_cleanup_ids);
commit;

select 'DISPOSABLE CONCURRENCY RECORDS REMOVED' as result;
