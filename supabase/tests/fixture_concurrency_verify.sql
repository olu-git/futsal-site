-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Read-only outcome checks. Run after both session scripts have finished.
select fis_fixture_test.assert_disposable();

select id, title, status, version from public.fixture_change_sets
where id in ('00000000-0000-4000-8000-0000000f7001','00000000-0000-4000-8000-0000000f7002')
order by id;

select f.id, f.competition_season_id, f.match_date, f.kickoff_time, f.court,
  f.publication_state, f.schedule_status
from public.fixtures f
where f.competition_season_id in
  ('00000000-0000-4000-8000-0000000f5001','00000000-0000-4000-8000-0000000f5002')
order by f.competition_season_id;

select
  (select count(*) from public.fixture_change_sets where id = '00000000-0000-4000-8000-0000000f7001'
    and status = 'published') = 1 as a_published,
  (select count(*) from public.fixture_change_sets where id = '00000000-0000-4000-8000-0000000f7002'
    and status = 'pending_review') = 1 as b_remained_unpublished,
  (select count(*) from public.fixtures where competition_season_id in
    ('00000000-0000-4000-8000-0000000f5001','00000000-0000-4000-8000-0000000f5002')
    and match_date = '2099-06-01' and kickoff_time = '19:00' and court = 1
    and publication_state = 'published' and schedule_status = 'scheduled') = 1 as exactly_one_occupied_slot,
  (select count(*) from public.fixture_change_history where change_set_id = '00000000-0000-4000-8000-0000000f7001') = 1
    as a_has_complete_history,
  (select count(*) from public.fixture_change_history where change_set_id = '00000000-0000-4000-8000-0000000f7002') = 0
    as b_has_no_partial_history;
