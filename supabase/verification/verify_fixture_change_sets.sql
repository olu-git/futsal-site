-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Run only after the fixture-change migration in the marked disposable project.
-- Requires the existing confirmed FIS administrator; never edits Auth membership.
begin;
select fis_fixture_test.assert_disposable();

-- This table exists only to initialise the session's real temporary schema.
-- Do not use ON COMMIT DROP: the Dashboard SQL Editor may introduce an
-- internal statement boundary while processing a pasted query. The outer
-- ROLLBACK below removes this transaction-local table and every test record.
create temporary table _fis_fixture_verification_bootstrap (id integer);
create function pg_temp.assert_true(value boolean, message text) returns void
language plpgsql as $$
begin
  if value is not true then raise exception 'Fixture verification failed: %', message; end if;
end;
$$;
do $$
declare temp_schema_name text;
begin
  select n.nspname into temp_schema_name from pg_catalog.pg_namespace n
    where n.oid = pg_catalog.pg_my_temp_schema();
  execute format('grant usage on schema %I to anon, authenticated', temp_schema_name);
  execute format('grant execute on function %I.assert_true(boolean, text) to anon, authenticated', temp_schema_name);
end;
$$;

select pg_temp.assert_true((select count(*) = 1 from private.admin_users), 'one enrolled administrator is required');

-- Migrations own permanent schema. This verifier only confirms the installed
-- fixture scheduling columns before creating rollback-only test data.
select pg_temp.assert_true((
  select count(*) = 1
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = 'fixtures'
    and c.column_name = 'schedule_status' and c.data_type = 'text'
    and c.is_nullable = 'NO' and c.column_default = '''scheduled''::text'
), 'fixtures.schedule_status must be text not null default scheduled');
select pg_temp.assert_true((
  select count(*) = 1
  from pg_catalog.pg_constraint con
  join pg_catalog.pg_class rel on rel.oid = con.conrelid
  join pg_catalog.pg_namespace n on n.oid = rel.relnamespace
  where n.nspname = 'public' and rel.relname = 'fixtures' and con.contype = 'c'
    and pg_get_constraintdef(con.oid) =
      'CHECK ((schedule_status = ANY (ARRAY[''scheduled''::text, ''cancelled''::text])))'
), 'fixtures.schedule_status must allow exactly scheduled and cancelled');
select pg_temp.assert_true((
  select count(*) = 1
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = 'fixtures'
    and c.column_name = 'schedule_version' and c.data_type = 'bigint'
    and c.is_nullable = 'NO' and c.column_default = '1'
), 'fixtures.schedule_version must be bigint not null default 1');

do $$
declare expected record;
begin
  for expected in select * from (values
    ('fixture_change_sets', 'fixture_change_sets_admin_read'),
    ('fixture_change_items', 'fixture_change_items_admin_read'),
    ('fixture_change_history', 'fixture_change_history_admin_read')
  ) as x(table_name, policy_name) loop
    if not exists (select 1 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = expected.table_name and c.relrowsecurity)
      or not exists (select 1 from pg_catalog.pg_policies p where p.schemaname = 'public'
        and p.tablename = expected.table_name and p.policyname = expected.policy_name) then
      raise exception 'Missing RLS or admin policy for %', expected.table_name;
    end if;
  end loop;
end;
$$;

insert into public.seasons(id, name, starts_on, ends_on) values
  ('00000000-0000-4000-8000-000000011101', 'Fixture verification season', '2099-01-01', '2099-12-31'),
  ('00000000-0000-4000-8000-000000011102', 'Fixture verification archived season', '2098-01-01', '2098-12-31');
insert into public.categories(id, code, name) values
  ('00000000-0000-4000-8000-000000012101', 'fixture-verification', 'Fixture Verification');
insert into public.locations(id, name) values
  ('00000000-0000-4000-8000-000000013101', 'Fixture verification venue'),
  ('00000000-0000-4000-8000-000000013102', 'Fixture verification second venue');
insert into public.competitions(id, category_id, location_id, weekday, division, name) values
  ('00000000-0000-4000-8000-000000014101', '00000000-0000-4000-8000-000000012101', '00000000-0000-4000-8000-000000013101', 1, 'A', 'Fixture verification Monday'),
  ('00000000-0000-4000-8000-000000014102', '00000000-0000-4000-8000-000000012101', '00000000-0000-4000-8000-000000013101', 3, 'A', 'Fixture verification Wednesday'),
  ('00000000-0000-4000-8000-000000014103', '00000000-0000-4000-8000-000000012101', '00000000-0000-4000-8000-000000013101', 1, 'B', 'Fixture verification Monday B'),
  ('00000000-0000-4000-8000-000000014104', '00000000-0000-4000-8000-000000012101', '00000000-0000-4000-8000-000000013102', 1, 'A', 'Fixture verification other venue');
insert into public.competition_seasons(id, competition_id, season_id, lifecycle, publication_state) values
  ('00000000-0000-4000-8000-000000015101', '00000000-0000-4000-8000-000000014101', '00000000-0000-4000-8000-000000011101', 'active', 'published'),
  ('00000000-0000-4000-8000-000000015102', '00000000-0000-4000-8000-000000014102', '00000000-0000-4000-8000-000000011101', 'active', 'published'),
  ('00000000-0000-4000-8000-000000015103', '00000000-0000-4000-8000-000000014101', '00000000-0000-4000-8000-000000011102', 'archived', 'published'),
  ('00000000-0000-4000-8000-000000015104', '00000000-0000-4000-8000-000000014103', '00000000-0000-4000-8000-000000011101', 'active', 'published'),
  ('00000000-0000-4000-8000-000000015105', '00000000-0000-4000-8000-000000014104', '00000000-0000-4000-8000-000000011101', 'active', 'published');
insert into public.teams(id, competition_season_id, name) values
  ('00000000-0000-4000-8000-000000016101', '00000000-0000-4000-8000-000000015101', 'Verify Monday A'),
  ('00000000-0000-4000-8000-000000016102', '00000000-0000-4000-8000-000000015101', 'Verify Monday B'),
  ('00000000-0000-4000-8000-000000016103', '00000000-0000-4000-8000-000000015101', 'Verify Monday C'),
  ('00000000-0000-4000-8000-000000016104', '00000000-0000-4000-8000-000000015101', 'Verify Monday D'),
  ('00000000-0000-4000-8000-000000016105', '00000000-0000-4000-8000-000000015102', 'Verify Wednesday A'),
  ('00000000-0000-4000-8000-000000016106', '00000000-0000-4000-8000-000000015102', 'Verify Wednesday B'),
  ('00000000-0000-4000-8000-000000016107', '00000000-0000-4000-8000-000000015104', 'Verify Division B home'),
  ('00000000-0000-4000-8000-000000016108', '00000000-0000-4000-8000-000000015104', 'Verify Division B away'),
  ('00000000-0000-4000-8000-000000016109', '00000000-0000-4000-8000-000000015105', 'Verify other venue home'),
  ('00000000-0000-4000-8000-000000016110', '00000000-0000-4000-8000-000000015105', 'Verify other venue away');
insert into public.team_kickoff_preferences(team_id, kickoff_time, classification) values
  ('00000000-0000-4000-8000-000000016101', '19:00', 'required'),
  ('00000000-0000-4000-8000-000000016101', '20:20', 'avoid');
insert into public.team_fixture_notes(team_id, notes) values
  ('00000000-0000-4000-8000-000000016102', 'Confirm travel before a late game');
insert into public.fixtures(id, competition_season_id, round_number, match_date, kickoff_time, court,
  home_team_id, away_team_id, stage, publication_state) values
  ('00000000-0000-4000-8000-000000017101', '00000000-0000-4000-8000-000000015101', 12, '2099-03-16', '19:00', 1, '00000000-0000-4000-8000-000000016101', '00000000-0000-4000-8000-000000016102', 'regular_season', 'published'),
  ('00000000-0000-4000-8000-000000017102', '00000000-0000-4000-8000-000000015101', 12, '2099-03-16', '19:00', 2, '00000000-0000-4000-8000-000000016103', '00000000-0000-4000-8000-000000016104', 'regular_season', 'published'),
  ('00000000-0000-4000-8000-000000017103', '00000000-0000-4000-8000-000000015101', 13, '2099-03-23', '19:00', 1, '00000000-0000-4000-8000-000000016101', '00000000-0000-4000-8000-000000016103', 'regular_season', 'published'),
  ('00000000-0000-4000-8000-000000017104', '00000000-0000-4000-8000-000000015101', 13, '2099-03-23', '19:00', 2, '00000000-0000-4000-8000-000000016102', '00000000-0000-4000-8000-000000016104', 'regular_season', 'published'),
  ('00000000-0000-4000-8000-000000017105', '00000000-0000-4000-8000-000000015102', 12, '2099-03-18', '19:00', 1, '00000000-0000-4000-8000-000000016105', '00000000-0000-4000-8000-000000016106', 'regular_season', 'published'),
  ('00000000-0000-4000-8000-000000017106', '00000000-0000-4000-8000-000000015101', 14, '2099-03-30', '19:00', 1, '00000000-0000-4000-8000-000000016101', '00000000-0000-4000-8000-000000016103', 'knockout', 'published'),
  ('00000000-0000-4000-8000-000000017107', '00000000-0000-4000-8000-000000015101', 15, '2099-04-06', '19:00', 1, '00000000-0000-4000-8000-000000016101', '00000000-0000-4000-8000-000000016102', 'regular_season', 'published'),
  ('00000000-0000-4000-8000-000000017108', '00000000-0000-4000-8000-000000015101', 15, '2099-04-06', '19:00', 2, '00000000-0000-4000-8000-000000016103', '00000000-0000-4000-8000-000000016104', 'regular_season', 'published'),
  ('00000000-0000-4000-8000-000000017109', '00000000-0000-4000-8000-000000015101', 18, '2099-04-27', '19:00', 1, '00000000-0000-4000-8000-000000016101', '00000000-0000-4000-8000-000000016102', 'regular_season', 'published'),
  ('00000000-0000-4000-8000-000000017110', '00000000-0000-4000-8000-000000015104', 16, '2099-04-13', '19:00', 1, '00000000-0000-4000-8000-000000016107', '00000000-0000-4000-8000-000000016108', 'regular_season', 'published'),
  ('00000000-0000-4000-8000-000000017111', '00000000-0000-4000-8000-000000015105', 17, '2099-04-20', '19:00', 1, '00000000-0000-4000-8000-000000016109', '00000000-0000-4000-8000-000000016110', 'regular_season', 'published');
insert into public.result_versions(fixture_id, revision, status, home_score, away_score) values
  ('00000000-0000-4000-8000-000000017104', 1, 'published', 5, 1);
insert into public.fixture_change_sets(id, competition_season_id, title, source, created_by) values
  ('00000000-0000-4000-8000-000000018101', '00000000-0000-4000-8000-000000015101',
   'RLS visibility probe', 'manual', (select user_id from private.admin_users limit 1));

-- No visitor or non-admin may read plans or invoke write RPCs.
set local role anon;
do $$ declare denied boolean := false;
begin
  begin perform count(*) from public.fixture_change_sets;
  exception when insufficient_privilege then denied := true; end;
  perform pg_temp.assert_true(denied, 'anonymous plan read was allowed');
  denied := false;
  begin perform public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'bad', 'manual');
  exception when insufficient_privilege then denied := true; end;
  perform pg_temp.assert_true(denied, 'anonymous plan creation was allowed');
end; $$;
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000a001', true);
set local role authenticated;
do $$ declare denied boolean := false;
begin
  perform pg_temp.assert_true((select count(*) = 0 from public.fixture_change_sets), 'non-admin saw plans');
  begin perform public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'bad', 'manual');
  exception when raise_exception then denied := sqlerrm = 'Administrator access required'; end;
  perform pg_temp.assert_true(denied, 'non-admin created a plan');
end; $$;
reset role;
select set_config('request.jwt.claim.sub', (select user_id::text from private.admin_users limit 1), true);
set local role authenticated;

do $$
declare
  plan_id uuid;
  plan_version bigint;
  report jsonb;
  blocked boolean;
begin
  perform pg_temp.assert_true((select count(*) = 1 from public.fixture_change_sets), 'administrator could not read the existing plan');
  plan_id := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Two changes in round 12', 'manual', 'Two team requests');
  plan_version := public.replace_fixture_change_items(plan_id, 1, jsonb_build_array(
    jsonb_build_object('operation','update','fixtureId','00000000-0000-4000-8000-000000017101','expectedFixtureVersion',1,'reason','Team request',
      'proposed',jsonb_build_object('roundNumber',12,'date','2099-03-16','kickoffTime','20:20','court',1,
        'homeTeamId','00000000-0000-4000-8000-000000016101','awayTeamId','00000000-0000-4000-8000-000000016102','publicationState','published')),
    jsonb_build_object('operation','update','fixtureId','00000000-0000-4000-8000-000000017102','expectedFixtureVersion',1,'reason','Venue correction',
      'proposed',jsonb_build_object('roundNumber',12,'date','2099-03-16','kickoffTime','20:20','court',2,
        'homeTeamId','00000000-0000-4000-8000-000000016103','awayTeamId','00000000-0000-4000-8000-000000016104','publicationState','published'))
  ));
  perform pg_temp.assert_true((select count(*) = 2 from public.fixture_change_items where change_set_id = plan_id), 'multi-item round was lost');
  perform pg_temp.assert_true((select kickoff_time = '19:00' from public.fixtures where id = '00000000-0000-4000-8000-000000017101'), 'draft changed the public fixture');
  report := public.validate_fixture_change_set(plan_id);
  perform pg_temp.assert_true(exists (select 1 from jsonb_array_elements(report->'messages') m where m->>'code' = 'required_time'), 'required-time warning missing');
  blocked := false;
  begin perform public.transition_fixture_change_set(plan_id, plan_version, 'submit', false);
  exception when raise_exception then blocked := sqlerrm = 'Fixture warnings require explicit acknowledgement'; end;
  perform pg_temp.assert_true(blocked, 'warnings were silently ignored');
  plan_version := public.transition_fixture_change_set(plan_id, plan_version, 'submit', true);
  perform pg_temp.assert_true((select warnings_acknowledged_at is not null from public.fixture_change_sets where id = plan_id), 'warning acknowledgement was not retained');
  perform pg_temp.assert_true((select kickoff_time = '19:00' from public.fixtures where id = '00000000-0000-4000-8000-000000017101'), 'review exposed a proposed schedule');
  perform public.publish_fixture_change_set(plan_id, plan_version);
  perform pg_temp.assert_true((select count(*) = 2 from public.fixtures where id in ('00000000-0000-4000-8000-000000017101','00000000-0000-4000-8000-000000017102') and kickoff_time = '20:20' and publication_state = 'published'), 'atomic publication did not apply both changes');
  perform pg_temp.assert_true((select count(*) = 2 from public.fixture_change_history where change_set_id = plan_id and before_row->>'kickoff_time' = '19:00:00' and after_row->>'kickoff_time' = '20:20:00'), 'before/after audit history missing');
  perform pg_temp.assert_true((select count(distinct reason) = 2 from public.fixture_change_history where change_set_id = plan_id), 'item reasons were lost');
  perform pg_temp.assert_true((select count(*) >= 2 from public.admin_audit_log
    where table_name = 'fixtures' and row_id in ('00000000-0000-4000-8000-000000017101', '00000000-0000-4000-8000-000000017102')
      and action = 'UPDATE' and old_row is not null and new_row is not null), 'fixture before/after audit rows missing');
  blocked := false;
  begin perform public.transition_fixture_change_set(plan_id, plan_version + 1, 'return', false);
  exception when raise_exception then blocked := sqlerrm = 'Invalid fixture change-set transition'; end;
  perform pg_temp.assert_true(blocked, 'published change set was mutable');
end; $$;

-- Database permissions keep direct published-fixture writes outside the admin API.
do $$ declare denied boolean := false;
begin
  begin update public.fixtures set court = 3 where id = '00000000-0000-4000-8000-000000017101';
  exception when insufficient_privilege then denied := true; end;
  perform pg_temp.assert_true(denied, 'admin could bypass change sets with a direct fixture edit');
end; $$;

-- Rejected plans test hard validation, stale versions, cross-night, knockout,
-- published-result and archive protections without touching the public fixture.
do $$
declare p uuid; v bigint; blocked boolean;
begin
  p := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Collision', 'json_upload');
  v := public.replace_fixture_change_items(p, 1, jsonb_build_array(jsonb_build_object('operation','update',
    'fixtureId','00000000-0000-4000-8000-000000017101','expectedFixtureVersion',3,'reason','Invalid court',
    'proposed',jsonb_build_object('roundNumber',12,'date','2099-03-16','kickoffTime','20:20','court',2,
      'homeTeamId','00000000-0000-4000-8000-000000016101','awayTeamId','00000000-0000-4000-8000-000000016102','publicationState','published'))));
  blocked := false;
  begin perform public.transition_fixture_change_set(p, v, 'submit', true);
  exception when raise_exception then blocked := sqlerrm = 'Blocking fixture validation errors'; end;
  perform pg_temp.assert_true(blocked, 'court collision was publishable');
  p := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Cross-night', 'manual');
  blocked := false;
  begin perform public.replace_fixture_change_items(p, 1, jsonb_build_array(jsonb_build_object('operation','cancel',
    'fixtureId','00000000-0000-4000-8000-000000017105','expectedFixtureVersion',1,'reason','Wrong night')));
  exception when raise_exception then blocked := sqlerrm like 'Cross-competition%'; end;
  perform pg_temp.assert_true(blocked, 'Wednesday fixture entered a Monday plan');
  p := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Knockout', 'manual');
  blocked := false;
  begin perform public.replace_fixture_change_items(p, 1, jsonb_build_array(jsonb_build_object('operation','cancel',
    'fixtureId','00000000-0000-4000-8000-000000017106','expectedFixtureVersion',1,'reason','Wrong stage')));
  exception when raise_exception then blocked := sqlerrm like 'Cross-competition%'; end;
  perform pg_temp.assert_true(blocked, 'knockout fixture entered a regular-season plan');
  p := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Completed', 'manual');
  v := public.replace_fixture_change_items(p, 1, jsonb_build_array(jsonb_build_object('operation','cancel',
    'fixtureId','00000000-0000-4000-8000-000000017104','expectedFixtureVersion',1,'reason','Must block completed')));
  perform pg_temp.assert_true(exists (select 1 from jsonb_array_elements(public.validate_fixture_change_set(p)->'messages') m where m->>'code' = 'completed_fixture'), 'published result protection missing');
  p := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Stale', 'manual');
  v := public.replace_fixture_change_items(p, 1, jsonb_build_array(jsonb_build_object('operation','cancel',
    'fixtureId','00000000-0000-4000-8000-000000017101','expectedFixtureVersion',1,'reason','Old version')));
  perform pg_temp.assert_true(exists (select 1 from jsonb_array_elements(public.validate_fixture_change_set(p)->'messages') m where m->>'code' = 'stale_fixture'), 'stale version protection missing');
  blocked := false;
  begin perform public.create_fixture_change_set('00000000-0000-4000-8000-000000015103', 'Archived', 'manual');
  exception when raise_exception then blocked := sqlerrm = 'Unknown or archived competition season'; end;
  perform pg_temp.assert_true(blocked, 'archived edition accepted a plan');
end; $$;

-- Court occupancy is physical-location-wide, but only the final projected
-- schedule counts: affected originals are removed before proposals are added.
do $$
declare p uuid; v bigint; report jsonb; replacement_id uuid;
begin
  p := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Cross-division collision', 'manual');
  v := public.replace_fixture_change_items(p, 1, jsonb_build_array(jsonb_build_object('operation','create',
    'reason','Extra match', 'proposed',jsonb_build_object('roundNumber',16,'date','2099-04-13','kickoffTime','19:00','court',1,
      'homeTeamId','00000000-0000-4000-8000-000000016101','awayTeamId','00000000-0000-4000-8000-000000016102','publicationState','published'))));
  report := public.validate_fixture_change_set(p);
  perform pg_temp.assert_true(exists (select 1 from jsonb_array_elements(report->'messages') m where m->>'code' = 'court_collision'),
    'another division at the same location did not block the court');

  p := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Cross-competition move', 'manual');
  v := public.replace_fixture_change_items(p, 1, jsonb_build_array(jsonb_build_object('operation','update',
    'fixtureId','00000000-0000-4000-8000-000000017107','expectedFixtureVersion',1,'reason','Proposed move',
    'proposed',jsonb_build_object('roundNumber',16,'date','2099-04-13','kickoffTime','19:00','court',1,
      'homeTeamId','00000000-0000-4000-8000-000000016101','awayTeamId','00000000-0000-4000-8000-000000016102','publicationState','published'))));
  perform pg_temp.assert_true(exists (select 1 from jsonb_array_elements(public.validate_fixture_change_set(p)->'messages') m
    where m->>'code' = 'court_collision'), 'moving into another competition court was allowed');

  p := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Two proposed fixtures collide', 'manual');
  v := public.replace_fixture_change_items(p, 1, jsonb_build_array(
    jsonb_build_object('operation','create','reason','Extra A','proposed',jsonb_build_object('roundNumber',17,
      'date','2099-04-20','kickoffTime','20:20','court',2,'homeTeamId','00000000-0000-4000-8000-000000016101',
      'awayTeamId','00000000-0000-4000-8000-000000016102','publicationState','published')),
    jsonb_build_object('operation','create','reason','Extra B','proposed',jsonb_build_object('roundNumber',17,
      'date','2099-04-20','kickoffTime','20:20','court',2,'homeTeamId','00000000-0000-4000-8000-000000016103',
      'awayTeamId','00000000-0000-4000-8000-000000016104','publicationState','published'))));
  perform pg_temp.assert_true(exists (select 1 from jsonb_array_elements(public.validate_fixture_change_set(p)->'messages') m
    where m->>'code' = 'court_collision'), 'two proposed items claimed one slot');

  p := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Separate courts and locations', 'manual');
  v := public.replace_fixture_change_items(p, 1, jsonb_build_array(
    jsonb_build_object('operation','create','reason','Different court','proposed',jsonb_build_object('roundNumber',16,
      'date','2099-04-13','kickoffTime','19:00','court',2,'homeTeamId','00000000-0000-4000-8000-000000016101',
      'awayTeamId','00000000-0000-4000-8000-000000016102','publicationState','published')),
    jsonb_build_object('operation','create','reason','Other venue same slot','proposed',jsonb_build_object('roundNumber',17,
      'date','2099-04-20','kickoffTime','19:00','court',1,'homeTeamId','00000000-0000-4000-8000-000000016103',
      'awayTeamId','00000000-0000-4000-8000-000000016104','publicationState','published')),
    jsonb_build_object('operation','create','reason','Same court on another date','proposed',jsonb_build_object('roundNumber',19,
      'date','2099-05-04','kickoffTime','19:00','court',1,'homeTeamId','00000000-0000-4000-8000-000000016101',
      'awayTeamId','00000000-0000-4000-8000-000000016102','publicationState','published'))));
  report := public.validate_fixture_change_set(p);
  perform pg_temp.assert_true(not exists (select 1 from jsonb_array_elements(report->'messages') m where m->>'severity' = 'blocking'),
    'different court or different physical location was blocked');
  v := public.transition_fixture_change_set(p, v, 'submit', true);
  perform public.publish_fixture_change_set(p, v);
  perform pg_temp.assert_true((select count(*) = 3 from public.fixture_change_history where change_set_id = p),
    'separate valid slots did not publish');

  p := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Atomic slot swap', 'manual');
  v := public.replace_fixture_change_items(p, 1, jsonb_build_array(
    jsonb_build_object('operation','update','fixtureId','00000000-0000-4000-8000-000000017107',
      'expectedFixtureVersion',1,'reason','Swap to Court 2','proposed',jsonb_build_object('roundNumber',15,
      'date','2099-04-06','kickoffTime','19:00','court',2,'homeTeamId','00000000-0000-4000-8000-000000016101',
      'awayTeamId','00000000-0000-4000-8000-000000016102','publicationState','published')),
    jsonb_build_object('operation','update','fixtureId','00000000-0000-4000-8000-000000017108',
      'expectedFixtureVersion',1,'reason','Swap to Court 1','proposed',jsonb_build_object('roundNumber',15,
      'date','2099-04-06','kickoffTime','19:00','court',1,'homeTeamId','00000000-0000-4000-8000-000000016103',
      'awayTeamId','00000000-0000-4000-8000-000000016104','publicationState','published'))));
  report := public.validate_fixture_change_set(p);
  perform pg_temp.assert_true(not exists (select 1 from jsonb_array_elements(report->'messages') m where m->>'severity' = 'blocking'),
    'atomic swap was treated as a pre-change collision');
  v := public.transition_fixture_change_set(p, v, 'submit', true);
  perform public.publish_fixture_change_set(p, v);
  perform pg_temp.assert_true((select court = 2 from public.fixtures where id = '00000000-0000-4000-8000-000000017107')
    and (select court = 1 from public.fixtures where id = '00000000-0000-4000-8000-000000017108'),
    'atomic court swap failed');

  p := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Cancel and reuse slot', 'manual');
  v := public.replace_fixture_change_items(p, 1, jsonb_build_array(
    jsonb_build_object('operation','cancel','fixtureId','00000000-0000-4000-8000-000000017109',
      'expectedFixtureVersion',1,'reason','Replace fixture'),
    jsonb_build_object('operation','create','reason','Replacement fixture','proposed',jsonb_build_object('roundNumber',18,
      'date','2099-04-27','kickoffTime','19:00','court',1,'homeTeamId','00000000-0000-4000-8000-000000016101',
      'awayTeamId','00000000-0000-4000-8000-000000016102','publicationState','published'))));
  report := public.validate_fixture_change_set(p);
  perform pg_temp.assert_true(not exists (select 1 from jsonb_array_elements(report->'messages') m where m->>'severity' = 'blocking'),
    'cancelled original still occupied its slot');
  v := public.transition_fixture_change_set(p, v, 'submit', true);
  perform public.publish_fixture_change_set(p, v);
  select fixture_id into replacement_id from public.fixture_change_history where change_set_id = p and operation = 'create';
  perform pg_temp.assert_true((select publication_state = 'draft' and schedule_status = 'cancelled' from public.fixtures
    where id = '00000000-0000-4000-8000-000000017109') and
    (select publication_state = 'published' from public.fixtures where id = replacement_id),
    'cancellation did not release the slot atomically');
  perform pg_temp.assert_true(position('for update of l' in lower(pg_get_functiondef(
    'public.publish_fixture_change_set(uuid,bigint)'::regprocedure))) > 0,
    'publication lost its physical-location concurrency lock');
end; $$;

reset role;
-- This temporary test trigger forces the second fixture update to fail after
-- the first was attempted. The function call's subtransaction must undo both.
create function pg_temp._verify_fixture_second_failure() returns trigger language plpgsql as $$
begin
  if new.id = '00000000-0000-4000-8000-000000017102' and new.publication_state = 'published' then
    raise exception 'forced verification failure';
  end if;
  return new;
end;
$$;
create trigger verify_fixture_second_failure before update on public.fixtures
  for each row execute function pg_temp._verify_fixture_second_failure();
set local role authenticated;
do $$
declare p uuid; v bigint; blocked boolean := false;
begin
  p := public.create_fixture_change_set('00000000-0000-4000-8000-000000015101', 'Atomic rollback', 'manual');
  v := public.replace_fixture_change_items(p, 1, jsonb_build_array(
    jsonb_build_object('operation','update','fixtureId','00000000-0000-4000-8000-000000017101','expectedFixtureVersion',3,'reason','First move',
      'proposed',jsonb_build_object('roundNumber',12,'date','2099-03-16','kickoffTime','21:00','court',1,
        'homeTeamId','00000000-0000-4000-8000-000000016101','awayTeamId','00000000-0000-4000-8000-000000016102','publicationState','published')),
    jsonb_build_object('operation','update','fixtureId','00000000-0000-4000-8000-000000017102','expectedFixtureVersion',3,'reason','Second move',
      'proposed',jsonb_build_object('roundNumber',13,'date','2099-03-23','kickoffTime','21:00','court',2,
        'homeTeamId','00000000-0000-4000-8000-000000016103','awayTeamId','00000000-0000-4000-8000-000000016104','publicationState','published'))
  ));
  v := public.transition_fixture_change_set(p, v, 'submit', true);
  begin perform public.publish_fixture_change_set(p, v);
  exception when raise_exception then blocked := sqlerrm = 'forced verification failure'; end;
  perform pg_temp.assert_true(blocked, 'second-item failure was not reached');
  perform pg_temp.assert_true((select count(*) = 2 from public.fixtures where id in ('00000000-0000-4000-8000-000000017101','00000000-0000-4000-8000-000000017102') and kickoff_time = '20:20' and publication_state = 'published'), 'first item escaped a failed publication');
  perform pg_temp.assert_true((select count(*) = 0 from public.fixture_change_history where change_set_id = p), 'failed publication left audit history');
  perform pg_temp.assert_true((select status = 'pending_review' from public.fixture_change_sets where id = p), 'failed publication changed status');
end; $$;
reset role;

select true as fixture_change_verification_passed;

rollback;
