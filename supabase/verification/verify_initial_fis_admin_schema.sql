-- Run only after applying the initial schema to a disposable Supabase database
-- and enrolling the confirmed administrator. Every data change is rolled back.
begin;

create temporary table _fis_verification_bootstrap (
  id integer
) on commit drop;

create function pg_temp.assert_true(value boolean, message text) returns void
language plpgsql as $$
begin
  if value is not true then
    raise exception 'Verification failed: %', message;
  end if;
end;
$$;
do $grant_temp_permissions$
declare
  temp_schema_name text;
begin
  select n.nspname
  into temp_schema_name
  from pg_catalog.pg_namespace n
  where n.oid = pg_catalog.pg_my_temp_schema();

  if temp_schema_name is null then
    raise exception 'Temporary schema was not initialised';
  end if;

  execute format(
    'grant usage on schema %I to anon, authenticated',
    temp_schema_name
  );

  execute format(
    'grant execute on function %I.assert_true(boolean, text) to anon, authenticated',
    temp_schema_name
  );
end;
$grant_temp_permissions$;

-- All Data API tables must have RLS enabled.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'seasons', 'categories', 'locations', 'competitions', 'competition_seasons',
    'teams', 'team_fixture_notes', 'team_kickoff_preferences', 'fixtures',
    'result_versions', 'standing_adjustments', 'admin_audit_log'
  ] loop
    if not exists (
      select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = table_name
        and c.relkind = 'r' and c.relrowsecurity
    ) then
      raise exception 'RLS is not enabled on public.%', table_name;
    end if;
  end loop;
end;
$$;

-- Check every named read/admin policy expected by this migration.
do $$
declare
  expected record;
begin
  for expected in
    select * from (values
      ('seasons', 'seasons_read'), ('seasons', 'admin_write'),
      ('categories', 'categories_read'), ('categories', 'admin_write'),
      ('locations', 'locations_read'), ('locations', 'admin_write'),
      ('competitions', 'competitions_read'), ('competitions', 'admin_write'),
      ('competition_seasons', 'competition_seasons_read'), ('competition_seasons', 'admin_write'),
      ('teams', 'teams_read'), ('teams', 'admin_write'),
      ('fixtures', 'fixtures_read'), ('fixtures', 'admin_write'),
      ('result_versions', 'results_read'), ('result_versions', 'admin_write'),
      ('standing_adjustments', 'adjustments_read'), ('standing_adjustments', 'admin_write'),
      ('team_fixture_notes', 'notes_admin'),
      ('team_kickoff_preferences', 'preferences_admin'),
      ('admin_audit_log', 'audit_admin_read')
    ) as policies(table_name, policy_name)
  loop
    if not exists (
      select 1 from pg_catalog.pg_policies p
      where p.schemaname = 'public' and p.tablename = expected.table_name
        and p.policyname = expected.policy_name
    ) then
      raise exception 'Missing policy %.% on public.%', expected.table_name,
        expected.policy_name, expected.table_name;
    end if;
  end loop;
end;
$$;

select pg_temp.assert_true(
  (select count(*) = 1 from private.admin_users),
  'exactly one configured administrator is required before verification'
);

-- Disposable reference data. Knockout fixtures here exist only to exercise
-- generic validation and are rolled back; current live finals are not imported.
insert into public.seasons(id, name, starts_on, ends_on) values
  ('00000000-0000-4000-8000-000000001001', 'Verification season', '2099-01-01', '2099-12-31'),
  ('00000000-0000-4000-8000-000000001002', 'Verification archive', '2098-01-01', '2098-12-31');
insert into public.categories(id, code, name) values
  ('00000000-0000-4000-8000-000000002001', 'verification', 'Verification');
insert into public.locations(id, name, active) values
  ('00000000-0000-4000-8000-000000003001', 'Verification venue', true);
insert into public.competitions(id, category_id, location_id, weekday, division, name) values
  ('00000000-0000-4000-8000-000000004001',
   '00000000-0000-4000-8000-000000002001',
   '00000000-0000-4000-8000-000000003001', 3, 'A', 'Verification Wednesday');
insert into public.competition_seasons(
  id, competition_id, season_id, lifecycle, publication_state
) values
  ('00000000-0000-4000-8000-000000005001',
   '00000000-0000-4000-8000-000000004001',
   '00000000-0000-4000-8000-000000001001', 'active', 'published'),
  ('00000000-0000-4000-8000-000000005002',
   '00000000-0000-4000-8000-000000004001',
   '00000000-0000-4000-8000-000000001002', 'planned', 'draft');

insert into public.teams(
  id, competition_season_id, legacy_id, name, status, standings_eligible
) values
  ('00000000-0000-4000-8000-000000006001',
   '00000000-0000-4000-8000-000000005001', 'verify-dwell', 'Dwell History', 'inactive', true),
  ('00000000-0000-4000-8000-000000006002',
   '00000000-0000-4000-8000-000000005001', 'verify-top-up', 'Knockout Replacement', 'active', false),
  ('00000000-0000-4000-8000-000000006003',
   '00000000-0000-4000-8000-000000005001', 'verify-opponent', 'Verification Opponent', 'active', true),
  ('00000000-0000-4000-8000-000000006004',
   '00000000-0000-4000-8000-000000005002', 'verify-draft', 'Draft Team', 'active', true);

do $$
declare
  blocked boolean := false;
begin
  begin
    insert into public.teams(
      id, competition_season_id, legacy_id, name, status, standings_eligible
    ) values (
      '00000000-0000-4000-8000-000000006099',
      '00000000-0000-4000-8000-000000005001', 'verify-duplicate-name',
      '  dWeLl HiStOrY  ', 'inactive', true
    );
  exception when unique_violation then
    blocked := true;
  end;
  if not blocked then
    raise exception 'Case-insensitive trimmed team-name uniqueness was not enforced';
  end if;
end;
$$;

insert into public.fixtures(
  id, competition_season_id, legacy_id, round_number, match_date, kickoff_time,
  court, home_team_id, away_team_id, stage, publication_state
) values
  ('00000000-0000-4000-8000-000000007001',
   '00000000-0000-4000-8000-000000005001', 'verify-regular', 1, '2099-01-07', '19:00',
   1, '00000000-0000-4000-8000-000000006001', '00000000-0000-4000-8000-000000006003',
   'regular_season', 'published'),
  ('00000000-0000-4000-8000-000000007002',
   '00000000-0000-4000-8000-000000005001', 'verify-knockout-draft', 2, '2099-01-14', '19:00',
   1, '00000000-0000-4000-8000-000000006002', '00000000-0000-4000-8000-000000006003',
   'knockout', 'published'),
  ('00000000-0000-4000-8000-000000007003',
   '00000000-0000-4000-8000-000000005001', 'verify-knockout-published', 2, '2099-01-14', '19:00',
   2, '00000000-0000-4000-8000-000000006002', '00000000-0000-4000-8000-000000006003',
   'knockout', 'published'),
  ('00000000-0000-4000-8000-000000007004',
   '00000000-0000-4000-8000-000000005001', 'verify-hidden-draft', 3, '2099-01-21', '19:00',
   1, '00000000-0000-4000-8000-000000006001', '00000000-0000-4000-8000-000000006003',
   'regular_season', 'draft');

insert into public.result_versions(
  id, fixture_id, revision, status, home_score, away_score
) values
  ('00000000-0000-4000-8000-000000008001',
   '00000000-0000-4000-8000-000000007001', 1, 'published', 5, 2);

-- Knockout drafts may be incomplete while an administrator is editing them.
insert into public.result_versions(
  id, fixture_id, revision, status, home_score, away_score, penalty_home_score
) values
  ('00000000-0000-4000-8000-000000008002',
   '00000000-0000-4000-8000-000000007002', 1, 'draft', null, null, 1);

do $$
declare
  blocked boolean := false;
begin
  begin
    insert into public.result_versions(
      id, fixture_id, revision, status, home_score, away_score, penalty_home_score
    ) values (
      '00000000-0000-4000-8000-000000008003',
      '00000000-0000-4000-8000-000000007001', 2, 'draft', 1, 1, 1
    );
  exception when raise_exception then
    blocked := sqlerrm = 'Penalty shootouts are only valid for knockout fixtures';
  end;
  if not blocked then
    raise exception 'Non-knockout penalty data was not rejected';
  end if;
end;
$$;

do $$
declare
  blocked boolean := false;
begin
  begin
    insert into public.result_versions(
      id, fixture_id, revision, status, home_score, away_score
    ) values (
      '00000000-0000-4000-8000-000000008004',
      '00000000-0000-4000-8000-000000007003', 1, 'published', 2, 2
    );
  exception when raise_exception then
    blocked := sqlerrm = 'A tied published knockout result requires a complete penalty shootout';
  end;
  if not blocked then
    raise exception 'Published tied knockout result without penalties was not rejected';
  end if;
end;
$$;

insert into public.result_versions(
  id, fixture_id, revision, status, home_score, away_score,
  penalty_home_score, penalty_away_score, penalty_winner
) values (
  '00000000-0000-4000-8000-000000008005',
  '00000000-0000-4000-8000-000000007003', 2, 'published', 2, 2, 3, 2, 'home'
);

insert into public.standing_adjustments(
  id, competition_season_id, team_id, legacy_id, played_delta, points_delta,
  reason, publication_state
) values (
  '00000000-0000-4000-8000-000000009001',
  '00000000-0000-4000-8000-000000005001',
  '00000000-0000-4000-8000-000000006001', 'verify-history', 1, 1,
  'Verification adjustment', 'published'
);

-- Anonymous users can see published rows, including inactive history, but not drafts.
set local role anon;
select pg_temp.assert_true(
  exists (select 1 from public.competition_seasons where id = '00000000-0000-4000-8000-000000005001'),
  'anonymous user cannot read published competition season'
);
select pg_temp.assert_true(
  not exists (select 1 from public.competition_seasons where id = '00000000-0000-4000-8000-000000005002'),
  'anonymous user can read draft competition season'
);
select pg_temp.assert_true(
  exists (select 1 from public.teams where id = '00000000-0000-4000-8000-000000006001'),
  'inactive historical team is not publicly readable'
);
select pg_temp.assert_true(
  not exists (select 1 from public.teams where id = '00000000-0000-4000-8000-000000006004'),
  'team from a draft competition season is publicly readable'
);
select pg_temp.assert_true(
  not exists (select 1 from public.fixtures where id = '00000000-0000-4000-8000-000000007004'),
  'draft fixture is publicly readable'
);
select pg_temp.assert_true(
  exists (select 1 from public.result_versions where id = '00000000-0000-4000-8000-000000008001'),
  'published result is not publicly readable'
);
select pg_temp.assert_true(
  not exists (select 1 from public.result_versions where id = '00000000-0000-4000-8000-000000008002'),
  'draft result is publicly readable'
);
select pg_temp.assert_true(
  exists (select 1 from public.standings where team_id = '00000000-0000-4000-8000-000000006001'),
  'standings-eligible inactive historical team is absent from standings'
);
select pg_temp.assert_true(
  not exists (select 1 from public.standings where team_id = '00000000-0000-4000-8000-000000006002'),
  'standings-ineligible knockout replacement appears in standings'
);
select pg_temp.assert_true(
  (select count(*) = 2 from public.teams where status = 'active'),
  'active team count does not follow team status'
);
reset role;

-- A non-admin authenticated identity cannot write through an admin policy.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000a001', true);
set local role authenticated;
do $$
declare
  affected integer;
begin
  update public.teams set kit_colour = '#123456'
  where id = '00000000-0000-4000-8000-000000006003';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'Non-admin authenticated user was allowed to write';
  end if;
end;
$$;
reset role;

-- The configured administrator can write.
select set_config(
  'request.jwt.claim.sub',
  (select user_id::text from private.admin_users limit 1),
  true
);
set local role authenticated;
update public.teams set kit_colour = '#123456'
where id = '00000000-0000-4000-8000-000000006003';
select pg_temp.assert_true(
  (select kit_colour = '#123456' from public.teams where id = '00000000-0000-4000-8000-000000006003'),
  'configured administrator could not write'
);

-- Archived competition-season data is immutable, even to the administrator.
update public.competition_seasons set lifecycle = 'archived'
where id = '00000000-0000-4000-8000-000000005002';
do $$
declare
  blocked boolean := false;
begin
  begin
    update public.teams set name = 'Changed archived team'
    where id = '00000000-0000-4000-8000-000000006004';
  exception when raise_exception then
    blocked := sqlerrm = 'Archived competition data is read-only';
  end;
  if not blocked then
    raise exception 'Archived competition-season data was allowed to change';
  end if;
end;
$$;
reset role;

-- The partial unique index must reject a second published version.
do $$
declare
  blocked boolean := false;
begin
  begin
    insert into public.result_versions(
      id, fixture_id, revision, status, home_score, away_score
    ) values (
      '00000000-0000-4000-8000-000000008006',
      '00000000-0000-4000-8000-000000007001', 3, 'published', 4, 1
    );
  exception when unique_violation then
    blocked := true;
  end;
  if not blocked then
    raise exception 'Fixture accepted more than one published result version';
  end if;
end;
$$;

rollback;
