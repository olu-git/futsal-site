-- FIS PRODUCTION FIXTURE CHANGE MIGRATION PREFLIGHT — READ ONLY
-- Run before 202609270001_fixture_change_sets.sql. Save every result set.

with prerequisites as (
  select
    to_regnamespace('public') is not null as public_schema_exists,
    to_regnamespace('private') is not null as private_schema_exists,
    to_regclass('public.fixtures') is not null as fixtures_table_exists,
    to_regclass('public.teams') is not null as teams_table_exists,
    to_regclass('public.competition_seasons') is not null as competition_seasons_table_exists,
    to_regclass('public.result_versions') is not null as results_table_exists,
    to_regclass('public.standing_adjustments') is not null as adjustments_table_exists,
    to_regprocedure('private.is_admin()') is not null as private_admin_check_exists,
    to_regprocedure('public.is_fis_admin()') is not null as public_admin_check_exists,
    (select count(*) from private.admin_users) = 1 as exactly_one_administrator
), migration_objects as (
  select
    to_regclass('public.fixture_change_sets') is not null as change_sets_exists,
    to_regclass('public.fixture_change_items') is not null as change_items_exists,
    to_regclass('public.fixture_change_history') is not null as change_history_exists,
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'fixtures' and column_name = 'schedule_status') as schedule_status_exists,
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'fixtures' and column_name = 'schedule_version') as schedule_version_exists,
    to_regprocedure('public.create_fixture_change_set(uuid,text,text,text)') is not null as create_rpc_exists,
    to_regprocedure('public.publish_fixture_change_set(uuid,bigint)') is not null as publish_rpc_exists
), state as (
  select p.*, m.*,
    case when not (m.change_sets_exists or m.change_items_exists or m.change_history_exists or m.schedule_status_exists
      or m.schedule_version_exists or m.create_rpc_exists or m.publish_rpc_exists) then 'absent'
      when m.change_sets_exists and m.change_items_exists and m.change_history_exists and m.schedule_status_exists
        and m.schedule_version_exists and m.create_rpc_exists and m.publish_rpc_exists then 'installed'
      else 'partial' end as migration_state
  from prerequisites p cross join migration_objects m
)
select s.*, (s.public_schema_exists and s.private_schema_exists and s.fixtures_table_exists and s.teams_table_exists
  and s.competition_seasons_table_exists and s.results_table_exists and s.adjustments_table_exists
  and s.private_admin_check_exists and s.public_admin_check_exists and s.exactly_one_administrator
  and s.migration_state = 'absent') as prerequisite_checks_passed
from state s;

select c.name as competition, cs.id as competition_season_id, count(distinct t.id) as team_count,
  count(distinct f.id) as fixture_count,
  count(distinct rv.id) filter (where rv.status = 'published') as published_result_count,
  count(distinct sa.id) as adjustment_count
from public.competition_seasons cs join public.competitions c on c.id = cs.competition_id
left join public.teams t on t.competition_season_id = cs.id
left join public.fixtures f on f.competition_season_id = cs.id
left join public.result_versions rv on rv.fixture_id = f.id
left join public.standing_adjustments sa on sa.team_id = t.id
group by c.name, cs.id order by c.name, cs.id;

select f.stage, f.publication_state, count(*) as fixture_count
from public.fixtures f group by f.stage, f.publication_state order by f.stage, f.publication_state;

select count(*) as location_date_time_court_collisions from (
  select c.location_id, f.match_date, f.kickoff_time, f.court
  from public.fixtures f join public.competition_seasons cs on cs.id = f.competition_season_id
  join public.competitions c on c.id = cs.competition_id where f.publication_state = 'published'
  group by c.location_id, f.match_date, f.kickoff_time, f.court having count(*) > 1
) collisions;

select count(*) as team_date_time_collisions from (
  select x.team_id, x.match_date, x.kickoff_time from (
    select f.home_team_id as team_id, f.match_date, f.kickoff_time from public.fixtures f where f.publication_state = 'published'
    union all select f.away_team_id, f.match_date, f.kickoff_time from public.fixtures f where f.publication_state = 'published'
  ) x where x.team_id is not null group by x.team_id, x.match_date, x.kickoff_time having count(*) > 1
) collisions;

select count(distinct f.id) filter (where rv.status = 'published') as fixtures_with_published_results,
  (select count(*) from public.competition_seasons cs where cs.lifecycle = 'archived') as archived_competition_seasons
from public.fixtures f left join public.result_versions rv on rv.fixture_id = f.id;

with state as (
  select (select count(*) from private.admin_users) = 1 as admin_ok,
    to_regprocedure('public.is_fis_admin()') is not null as admin_rpc_ok,
    not exists (select 1 from public.fixtures where stage not in ('regular_season','knockout','grading')) as stages_ok,
    not exists (select 1 from public.fixtures where publication_state not in ('draft','published')) as publication_states_ok,
    not exists (select 1 from public.fixtures f join public.competition_seasons cs on cs.id=f.competition_season_id
      join public.competitions c on c.id=cs.competition_id where f.publication_state='published'
      group by c.location_id,f.match_date,f.kickoff_time,f.court having count(*)>1) as court_slots_ok,
    not exists (select 1 from (select f.home_team_id team_id,f.match_date,f.kickoff_time from public.fixtures f where f.publication_state='published'
      union all select f.away_team_id,f.match_date,f.kickoff_time from public.fixtures f where f.publication_state='published') x
      where x.team_id is not null group by x.team_id,x.match_date,x.kickoff_time having count(*)>1) as team_slots_ok,
    not (to_regclass('public.fixture_change_sets') is not null or to_regclass('public.fixture_change_items') is not null
      or to_regclass('public.fixture_change_history') is not null or exists (select 1 from information_schema.columns
        where table_schema='public' and table_name='fixtures' and column_name in ('schedule_status','schedule_version'))
      or to_regprocedure('public.create_fixture_change_set(uuid,text,text,text)') is not null
      or to_regprocedure('public.publish_fixture_change_set(uuid,bigint)') is not null) as migration_absent
)
select s.*, (s.admin_ok and s.admin_rpc_ok and s.stages_ok and s.publication_states_ok
  and s.court_slots_ok and s.team_slots_ok and s.migration_absent) as fixture_change_migration_ready from state s;
