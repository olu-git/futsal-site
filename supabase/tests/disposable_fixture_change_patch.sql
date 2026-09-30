-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
begin;
select fis_fixture_test.assert_disposable();

create or replace function private.fixture_change_report(p_change_set_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_plan public.fixture_change_sets%rowtype;
  v_item public.fixture_change_items%rowtype;
  v_fixture public.fixtures%rowtype;
  v_team public.teams%rowtype;
  v_team_id uuid;
  v_location_id uuid;
  v_messages jsonb := '[]'::jsonb;
  v_projected_count integer;
begin
  select fcs.* into v_plan from public.fixture_change_sets fcs where fcs.id = p_change_set_id;
  if not found then raise exception 'Unknown fixture change set'; end if;
  select c.location_id into v_location_id from public.competition_seasons cs
    join public.competitions c on c.id = cs.competition_id
    where cs.id = v_plan.competition_season_id;
  if v_location_id is null then raise exception 'Competition location could not be resolved'; end if;
  if private.competition_season_is_archived(v_plan.competition_season_id) then
    v_messages := v_messages || jsonb_build_array(private.fixture_change_message('blocking', 'archived_season', null, null, null, 'Archived competition data is read-only'));
  end if;
  if not exists (select 1 from public.fixture_change_items fci where fci.change_set_id = p_change_set_id) then
    v_messages := v_messages || jsonb_build_array(private.fixture_change_message('blocking', 'empty_change_set', null, null, null, 'At least one change item is required'));
  end if;
  for v_item in select fci.* from public.fixture_change_items fci where fci.change_set_id = p_change_set_id order by fci.ordinal loop
    if v_item.operation <> 'create' then
      select f.* into v_fixture from public.fixtures f where f.id = v_item.fixture_id;
      if not found or v_fixture.competition_season_id is distinct from v_plan.competition_season_id or v_fixture.stage is distinct from 'regular_season' then
        v_messages := v_messages || jsonb_build_array(private.fixture_change_message('blocking', 'invalid_fixture', v_item.id, v_item.fixture_id, null, 'Fixture is missing, belongs to another competition or is not regular-season'));
      else
        if v_fixture.publication_state <> 'published' or v_fixture.schedule_status <> 'scheduled' then
          v_messages := v_messages || jsonb_build_array(private.fixture_change_message('blocking', 'fixture_not_current', v_item.id, v_item.fixture_id, null, 'Fixture is no longer published and scheduled'));
        end if;
        if v_fixture.schedule_version <> v_item.expected_schedule_version then
          v_messages := v_messages || jsonb_build_array(private.fixture_change_message('blocking', 'stale_fixture', v_item.id, v_item.fixture_id, null, 'Fixture changed since this plan was prepared'));
        end if;
        if exists (select 1 from public.result_versions r where r.fixture_id = v_item.fixture_id and r.status = 'published') then
          v_messages := v_messages || jsonb_build_array(private.fixture_change_message('blocking', 'completed_fixture', v_item.id, v_item.fixture_id, null, 'Published results block structural fixture changes'));
        end if;
        if v_fixture.match_date < current_date then
          v_messages := v_messages || jsonb_build_array(private.fixture_change_message('blocking', 'past_fixture', v_item.id, v_item.fixture_id, null, 'Past fixtures cannot be changed'));
        end if;
      end if;
    end if;
    if v_item.operation = 'cancel' then
      select count(*) into v_projected_count from (
        select f.id from public.fixtures f
        where f.competition_season_id = v_plan.competition_season_id and f.stage = 'regular_season'
          and f.publication_state = 'published' and f.schedule_status = 'scheduled'
          and f.round_number = v_fixture.round_number
          and not exists (select 1 from public.fixture_change_items x where x.change_set_id = p_change_set_id and x.fixture_id = f.id)
        union all
        select x.id from public.fixture_change_items x where x.change_set_id = p_change_set_id
          and x.operation in ('create', 'update') and x.proposed_round_number = v_fixture.round_number
      ) remaining;
      if v_projected_count % 2 = 1 then
        v_messages := v_messages || jsonb_build_array(private.fixture_change_message('warning', 'uneven_round', v_item.id, v_item.fixture_id, null, 'Cancellation leaves an odd number of fixtures in this round'));
      end if;
      continue;
    end if;
    if v_item.proposed_match_date < current_date then
      v_messages := v_messages || jsonb_build_array(private.fixture_change_message('blocking', 'past_schedule', v_item.id, v_item.fixture_id, null, 'Proposed fixture date must not be in the past'));
    end if;
    if v_item.operation = 'create' then
      v_messages := v_messages || jsonb_build_array(private.fixture_change_message('warning', 'new_slot', v_item.id, null, null, 'New fixture has no previous schedule slot'));
    end if;
    foreach v_team_id in array array[v_item.proposed_home_team_id, v_item.proposed_away_team_id] loop
      select t.* into v_team from public.teams t where t.id = v_team_id;
      if not found or v_team.competition_season_id is distinct from v_plan.competition_season_id then
        v_messages := v_messages || jsonb_build_array(private.fixture_change_message('blocking', 'cross_competition_team', v_item.id, v_item.fixture_id, v_team_id, 'Team is missing or belongs to another competition season'));
        continue;
      end if;
      if v_team.status <> 'active' then
        v_messages := v_messages || jsonb_build_array(private.fixture_change_message('warning', 'inactive_team', v_item.id, v_item.fixture_id, v_team_id, 'Team is not currently active'));
      end if;
      if (v_team_id = v_item.proposed_home_team_id and v_item.display_home_name is not null and lower(btrim(v_item.display_home_name)) <> lower(btrim(v_team.name)))
        or (v_team_id = v_item.proposed_away_team_id and v_item.display_away_name is not null and lower(btrim(v_item.display_away_name)) <> lower(btrim(v_team.name))) then
        v_messages := v_messages || jsonb_build_array(private.fixture_change_message('warning', 'name_id_mismatch', v_item.id, v_item.fixture_id, v_team_id, 'Display name differs from the team ID; the ID is authoritative'));
      end if;
      if exists (select 1 from public.team_fixture_notes n where n.team_id = v_team_id) then
        v_messages := v_messages || jsonb_build_array(private.fixture_change_message('warning', 'team_note', v_item.id, v_item.fixture_id, v_team_id, 'This team has a fixture note to review'));
      end if;
      if exists (select 1 from public.team_kickoff_preferences tkp where tkp.team_id = v_team_id and tkp.classification = 'required')
        and not exists (select 1 from public.team_kickoff_preferences tkp where tkp.team_id = v_team_id and tkp.classification = 'required' and tkp.kickoff_time = v_item.proposed_kickoff_time) then
        v_messages := v_messages || jsonb_build_array(private.fixture_change_message('warning', 'required_time', v_item.id, v_item.fixture_id, v_team_id, 'Required kick-off time is not met'));
      end if;
      if exists (select 1 from public.team_kickoff_preferences tkp where tkp.team_id = v_team_id and tkp.classification = 'avoid' and tkp.kickoff_time = v_item.proposed_kickoff_time) then
        v_messages := v_messages || jsonb_build_array(private.fixture_change_message('warning', 'avoid_time', v_item.id, v_item.fixture_id, v_team_id, 'Team prefers to avoid this kick-off time'));
      end if;
      if exists (select 1 from public.team_kickoff_preferences tkp where tkp.team_id = v_team_id and tkp.classification = 'preferred')
        and not exists (select 1 from public.team_kickoff_preferences tkp where tkp.team_id = v_team_id and tkp.classification = 'preferred' and tkp.kickoff_time = v_item.proposed_kickoff_time) then
        v_messages := v_messages || jsonb_build_array(private.fixture_change_message('warning', 'preferred_time', v_item.id, v_item.fixture_id, v_team_id, 'Preferred kick-off time is not met'));
      end if;
      if exists (
        select 1 from public.fixtures f where f.competition_season_id = v_plan.competition_season_id
          and f.stage = 'regular_season' and f.publication_state = 'published' and f.schedule_status = 'scheduled'
          and not exists (select 1 from public.fixture_change_items x where x.change_set_id = p_change_set_id and x.fixture_id = f.id)
          and (f.home_team_id = v_team_id or f.away_team_id = v_team_id)
          and f.match_date <> v_item.proposed_match_date and abs(f.match_date - v_item.proposed_match_date) < 7
      ) then
        v_messages := v_messages || jsonb_build_array(private.fixture_change_message('warning', 'short_turnaround', v_item.id, v_item.fixture_id, v_team_id, 'Team has another match within seven days'));
      end if;
      if exists (
        select 1 from public.fixture_change_items x where x.change_set_id = p_change_set_id and x.id <> v_item.id
          and x.operation in ('create', 'update')
          and (x.proposed_home_team_id = v_team_id or x.proposed_away_team_id = v_team_id)
          and x.proposed_match_date <> v_item.proposed_match_date
          and abs(x.proposed_match_date - v_item.proposed_match_date) < 7
      ) then
        v_messages := v_messages || jsonb_build_array(private.fixture_change_message('warning', 'short_turnaround', v_item.id, v_item.fixture_id, v_team_id, 'Team has another proposed match within seven days'));
      end if;
    end loop;
    if exists (
      select 1 from public.fixtures f
        join public.competition_seasons occupied_cs on occupied_cs.id = f.competition_season_id
        join public.competitions occupied_c on occupied_c.id = occupied_cs.competition_id
      where occupied_c.location_id = v_location_id and occupied_cs.lifecycle <> 'archived'
        and (occupied_cs.lifecycle = 'active' or occupied_cs.publication_state = 'published')
        and f.publication_state = 'published' and f.schedule_status = 'scheduled'
        and not exists (select 1 from public.fixture_change_items x where x.change_set_id = p_change_set_id and x.fixture_id = f.id)
        and f.match_date = v_item.proposed_match_date and f.kickoff_time = v_item.proposed_kickoff_time
        and f.court = v_item.proposed_court
    ) or exists (
      select 1 from public.fixture_change_items x where x.change_set_id = p_change_set_id and x.id <> v_item.id
        and x.operation in ('create', 'update') and x.proposed_match_date = v_item.proposed_match_date
        and x.proposed_kickoff_time = v_item.proposed_kickoff_time and x.proposed_court = v_item.proposed_court
    ) then
      v_messages := v_messages || jsonb_build_array(private.fixture_change_message('blocking', 'court_collision', v_item.id, v_item.fixture_id, null, 'Two fixtures occupy the same court, date and time'));
    end if;
    if exists (
      select 1 from public.fixtures f where f.competition_season_id = v_plan.competition_season_id
        and f.stage = 'regular_season' and f.publication_state = 'published' and f.schedule_status = 'scheduled'
        and not exists (select 1 from public.fixture_change_items x where x.change_set_id = p_change_set_id and x.fixture_id = f.id)
        and f.match_date = v_item.proposed_match_date and f.kickoff_time = v_item.proposed_kickoff_time
        and (f.home_team_id in (v_item.proposed_home_team_id, v_item.proposed_away_team_id)
          or f.away_team_id in (v_item.proposed_home_team_id, v_item.proposed_away_team_id))
    ) or exists (
      select 1 from public.fixture_change_items x where x.change_set_id = p_change_set_id and x.id <> v_item.id
        and x.operation in ('create', 'update') and x.proposed_match_date = v_item.proposed_match_date
        and x.proposed_kickoff_time = v_item.proposed_kickoff_time
        and (x.proposed_home_team_id in (v_item.proposed_home_team_id, v_item.proposed_away_team_id)
          or x.proposed_away_team_id in (v_item.proposed_home_team_id, v_item.proposed_away_team_id))
    ) then
      v_messages := v_messages || jsonb_build_array(private.fixture_change_message('blocking', 'team_time_collision', v_item.id, v_item.fixture_id, null, 'A team is scheduled in two matches at the same time'));
    end if;
  end loop;
  return jsonb_build_object('messages', v_messages);
end;
$$;

do $$
declare
  v_definition text;
begin
  perform fis_fixture_test.assert_disposable();
  select pg_get_functiondef('private.fixture_change_report(uuid)'::regprocedure) into v_definition;
  if v_definition is null then
    raise exception 'Corrected fixture_change_report(uuid) was not installed';
  end if;
  if v_definition ~ 'n\.team_id\s*=\s*team_id' then
    raise exception 'Known ambiguous team_id expression remains';
  end if;
  if v_definition !~ 'n\.team_id\s*=\s*v_team_id' then
    raise exception 'Corrected team-note comparison was not found';
  end if;
end;
$$;

commit;

select
  exists (select 1 from fis_fixture_test.project_marker pm where pm.project_name = 'fis-fixture-test')
    as disposable_marker_recognised,
  to_regprocedure('private.fixture_change_report(uuid)') is not null as corrected_function_exists,
  pg_get_functiondef('private.fixture_change_report(uuid)'::regprocedure) !~ 'n\.team_id\s*=\s*team_id'
    as known_ambiguous_expression_removed;
