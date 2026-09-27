-- Atomically save an administrator-managed team profile and scheduling preferences.
begin;

alter table public.teams
  add column profile_version bigint not null default 1 check (profile_version > 0);

create function public.save_team_profile(
  p_team_id uuid,
  p_expected_profile_version bigint,
  p_name text,
  p_status text,
  p_competition_season_id uuid,
  p_kit_colour text,
  p_preferences jsonb,
  p_fixture_note text,
  p_administrative_reason text default null
) returns table(team_id uuid, profile_version bigint, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_team public.teams%rowtype;
  v_destination public.competition_seasons%rowtype;
  v_has_history boolean;
  v_is_consequential boolean;
  v_old_profile jsonb;
  v_new_profile jsonb;
begin
  if not (select private.is_admin()) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if p_team_id is null or p_expected_profile_version is null then
    raise exception 'Team ID and expected profile version are required';
  end if;
  if p_name is null or length(btrim(p_name)) = 0 then
    raise exception 'Team name is required';
  end if;
  if p_status is null or p_status not in ('active', 'inactive', 'withdrawn', 'replaced') then
    raise exception 'Invalid team status';
  end if;
  if p_kit_colour is not null and btrim(p_kit_colour) !~ '^#[0-9A-Fa-f]{6}$' then
    raise exception 'Kit colour must be a six-digit hex value';
  end if;
  if p_preferences is null or jsonb_typeof(p_preferences) <> 'array' then
    raise exception 'Kick-off preferences must be a JSON array';
  end if;

  select t.* into v_team
  from public.teams t
  where t.id = p_team_id
  for update;
  if not found then raise exception 'Unknown team'; end if;
  if v_team.profile_version <> p_expected_profile_version then
    raise exception 'Stale team profile: changed since the editor loaded it' using errcode = '40001';
  end if;
  if private.competition_season_is_archived(v_team.competition_season_id) then
    raise exception 'Archived competition data is read-only';
  end if;

  select cs.* into v_destination
  from public.competition_seasons cs
  where cs.id = p_competition_season_id;
  if not found then raise exception 'Invalid destination competition season'; end if;
  if v_destination.lifecycle = 'archived' then
    raise exception 'Archived destination competition seasons are read-only';
  end if;
  if exists (
    select 1 from public.teams t
    where t.competition_season_id = p_competition_season_id
      and t.id <> p_team_id
      and lower(btrim(t.name)) = lower(btrim(p_name))
  ) then
    raise exception 'Duplicate team name in destination competition season';
  end if;

  select exists (
    select 1 from public.fixtures f where f.home_team_id = p_team_id or f.away_team_id = p_team_id
  ) or exists (
    select 1 from public.standing_adjustments sa where sa.team_id = p_team_id
  ) into v_has_history;
  if v_has_history and v_team.competition_season_id <> p_competition_season_id then
    raise exception 'Historical teams cannot be moved to another competition season';
  end if;

  if exists (
    select 1 from jsonb_to_recordset(p_preferences) as p(kickoff_time text, classification text)
    where p.kickoff_time is null or p.kickoff_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
  ) then raise exception 'Invalid kick-off preference time'; end if;
  if exists (
    select 1 from jsonb_to_recordset(p_preferences) as p(kickoff_time text, classification text)
    where p.classification is null or p.classification not in ('required', 'preferred', 'avoid')
  ) then raise exception 'Invalid preference strength'; end if;
  if exists (
    select 1 from jsonb_to_recordset(p_preferences) as p(kickoff_time text, classification text)
    group by p.kickoff_time, p.classification having count(*) > 1
  ) then raise exception 'Duplicate kick-off preference'; end if;
  if exists (
    select 1 from jsonb_to_recordset(p_preferences) as p(kickoff_time text, classification text)
    group by p.kickoff_time having count(distinct p.classification) > 1
  ) then raise exception 'Conflicting strengths for the same kick-off time'; end if;

  v_is_consequential := v_team.name is distinct from btrim(p_name)
    or v_team.status is distinct from p_status
    or v_team.competition_season_id is distinct from p_competition_season_id;
  if v_is_consequential and coalesce(length(btrim(p_administrative_reason)), 0) = 0 then
    raise exception 'An administrative reason is required for consequential changes';
  end if;

  select jsonb_build_object(
    'team', to_jsonb(v_team),
    'preferences', coalesce(jsonb_agg(to_jsonb(tkp) order by tkp.kickoff_time), '[]'::jsonb),
    'fixtureNote', (select tfn.notes from public.team_fixture_notes tfn where tfn.team_id = p_team_id)
  ) into v_old_profile
  from public.team_kickoff_preferences tkp
  where tkp.team_id = p_team_id;

  update public.teams t set
    name = btrim(p_name),
    status = p_status,
    competition_season_id = p_competition_season_id,
    kit_colour = nullif(upper(btrim(p_kit_colour)), ''),
    profile_version = t.profile_version + 1
  where t.id = p_team_id
  returning t.* into v_team;

  delete from public.team_kickoff_preferences tkp where tkp.team_id = p_team_id;
  insert into public.team_kickoff_preferences(team_id, kickoff_time, classification)
  select p_team_id, p.kickoff_time::time, p.classification
  from jsonb_to_recordset(p_preferences) as p(kickoff_time text, classification text);

  if coalesce(length(btrim(p_fixture_note)), 0) = 0 then
    delete from public.team_fixture_notes tfn where tfn.team_id = p_team_id;
  else
    insert into public.team_fixture_notes(team_id, notes)
    values (p_team_id, btrim(p_fixture_note))
    on conflict on constraint team_fixture_notes_pkey do update set notes = excluded.notes;
  end if;

  select jsonb_build_object(
    'team', to_jsonb(v_team),
    'preferences', coalesce(jsonb_agg(to_jsonb(tkp) order by tkp.kickoff_time), '[]'::jsonb),
    'fixtureNote', (select tfn.notes from public.team_fixture_notes tfn where tfn.team_id = p_team_id),
    'administrativeReason', nullif(btrim(p_administrative_reason), '')
  ) into v_new_profile
  from public.team_kickoff_preferences tkp
  where tkp.team_id = p_team_id;

  insert into public.admin_audit_log(table_schema, table_name, row_id, action, old_row, new_row, actor_id, actor_role)
  values ('public', 'team_profile', p_team_id, 'UPDATE', v_old_profile, v_new_profile,
    auth.uid(), coalesce(auth.role(), current_user));

  return query select v_team.id, v_team.profile_version, v_team.updated_at;
end;
$$;

revoke all on function public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)
  from public, anon, authenticated;
grant execute on function public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)
  to authenticated;

commit;
