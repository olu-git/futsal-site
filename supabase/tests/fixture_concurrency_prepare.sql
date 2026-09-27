-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Persistent test records. Run once after the marker, migrations and admin enrolment.
begin;
select fis_fixture_test.assert_disposable();

do $$
begin
  if (select count(*) from private.admin_users) <> 1 then
    raise exception 'Enrol exactly one disposable administrator first';
  end if;
  if exists (select 1 from public.seasons) then
    raise exception 'Concurrency preparation requires an empty disposable season dataset';
  end if;
end;
$$;

insert into public.seasons(id, name, starts_on, ends_on) values
  ('00000000-0000-4000-8000-0000000f1001', 'Disposable fixture lock season', '2099-01-01', '2099-12-31');
insert into public.categories(id, code, name) values
  ('00000000-0000-4000-8000-0000000f2001', 'fixture-lock-test', 'Disposable fixture lock category');
insert into public.locations(id, name) values
  ('00000000-0000-4000-8000-0000000f3001', 'Disposable fixture lock venue');
insert into public.competitions(id, category_id, location_id, weekday, division, name) values
  ('00000000-0000-4000-8000-0000000f4001', '00000000-0000-4000-8000-0000000f2001',
    '00000000-0000-4000-8000-0000000f3001', 1, 'A', 'Disposable Monday A'),
  ('00000000-0000-4000-8000-0000000f4002', '00000000-0000-4000-8000-0000000f2001',
    '00000000-0000-4000-8000-0000000f3001', 1, 'B', 'Disposable Monday B');
insert into public.competition_seasons(id, competition_id, season_id, lifecycle, publication_state) values
  ('00000000-0000-4000-8000-0000000f5001', '00000000-0000-4000-8000-0000000f4001',
    '00000000-0000-4000-8000-0000000f1001', 'active', 'published'),
  ('00000000-0000-4000-8000-0000000f5002', '00000000-0000-4000-8000-0000000f4002',
    '00000000-0000-4000-8000-0000000f1001', 'active', 'published');
insert into public.teams(id, competition_season_id, name) values
  ('00000000-0000-4000-8000-0000000f6001', '00000000-0000-4000-8000-0000000f5001', 'Disposable A home'),
  ('00000000-0000-4000-8000-0000000f6002', '00000000-0000-4000-8000-0000000f5001', 'Disposable A away'),
  ('00000000-0000-4000-8000-0000000f6003', '00000000-0000-4000-8000-0000000f5002', 'Disposable B home'),
  ('00000000-0000-4000-8000-0000000f6004', '00000000-0000-4000-8000-0000000f5002', 'Disposable B away');

-- Fixed test-only plan IDs let both SQL Editor tabs use unchanged scripts.
insert into public.fixture_change_sets(id, competition_season_id, title, source, created_by) values
  ('00000000-0000-4000-8000-0000000f7001', '00000000-0000-4000-8000-0000000f5001',
    'Concurrent Court 1 claim A', 'manual', (select user_id from private.admin_users)),
  ('00000000-0000-4000-8000-0000000f7002', '00000000-0000-4000-8000-0000000f5002',
    'Concurrent Court 1 claim B', 'manual', (select user_id from private.admin_users));

select set_config('request.jwt.claim.sub', (select user_id::text from private.admin_users), true);
set local role authenticated;
select public.replace_fixture_change_items('00000000-0000-4000-8000-0000000f7001', 1,
  jsonb_build_array(jsonb_build_object('operation','create','reason','Division A scheduling request',
    'proposed',jsonb_build_object('roundNumber',1,'date','2099-06-01','kickoffTime','19:00','court',1,
      'homeTeamId','00000000-0000-4000-8000-0000000f6001',
      'awayTeamId','00000000-0000-4000-8000-0000000f6002','publicationState','published')))) as plan_a_draft_version;
select public.replace_fixture_change_items('00000000-0000-4000-8000-0000000f7002', 1,
  jsonb_build_array(jsonb_build_object('operation','create','reason','Division B scheduling request',
    'proposed',jsonb_build_object('roundNumber',1,'date','2099-06-01','kickoffTime','19:00','court',1,
      'homeTeamId','00000000-0000-4000-8000-0000000f6003',
      'awayTeamId','00000000-0000-4000-8000-0000000f6004','publicationState','published')))) as plan_b_draft_version;
select public.transition_fixture_change_set('00000000-0000-4000-8000-0000000f7001', 2, 'submit', true) as plan_a_review_version;
select public.transition_fixture_change_set('00000000-0000-4000-8000-0000000f7002', 2, 'submit', true) as plan_b_review_version;
reset role;

do $$
begin
  if (select count(*) from public.fixture_change_sets where id in
    ('00000000-0000-4000-8000-0000000f7001','00000000-0000-4000-8000-0000000f7002')
    and status = 'pending_review' and version = 3 and warnings_acknowledged_at is not null) <> 2 then
    raise exception 'Both disposable plans must be reviewed at version 3';
  end if;
  if exists (select 1 from public.fixtures where competition_season_id in
    ('00000000-0000-4000-8000-0000000f5001','00000000-0000-4000-8000-0000000f5002')) then
    raise exception 'Preparation must not publish fixtures';
  end if;
end;
$$;
commit;

select id, status, version, warnings_acknowledged_at is not null as warnings_acknowledged
from public.fixture_change_sets
where id in ('00000000-0000-4000-8000-0000000f7001','00000000-0000-4000-8000-0000000f7002')
order by id;
