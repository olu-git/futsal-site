-- Regular-season fixture proposals remain private until an entire reviewed set is published.
begin;

alter table public.fixtures
  add column schedule_status text not null default 'scheduled'
    check (schedule_status in ('scheduled', 'cancelled')),
  add column schedule_version bigint not null default 1 check (schedule_version > 0);

create function private.bump_fixture_schedule_version() returns trigger
language plpgsql set search_path = '' as $$
begin
  if row(new.competition_season_id, new.round_number, new.match_date, new.kickoff_time,
         new.court, new.home_team_id, new.away_team_id, new.stage,
         new.publication_state, new.schedule_status)
     is distinct from
     row(old.competition_season_id, old.round_number, old.match_date, old.kickoff_time,
         old.court, old.home_team_id, old.away_team_id, old.stage,
         old.publication_state, old.schedule_status) then
    new.schedule_version := old.schedule_version + 1;
  else
    new.schedule_version := old.schedule_version;
  end if;
  return new;
end;
$$;

create table public.fixture_change_sets (
  id uuid primary key default gen_random_uuid(),
  competition_season_id uuid not null references public.competition_seasons(id) on delete restrict,
  title text not null check (length(btrim(title)) > 0),
  overall_note text,
  source text not null check (source in ('manual', 'json_upload', 'system_import')),
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published', 'cancelled')),
  version bigint not null default 1 check (version > 0),
  validation_report jsonb not null default '{"messages":[]}'::jsonb,
  warnings_acknowledged_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  reviewed_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  published_at timestamptz
);
create index fixture_change_sets_competition_status on public.fixture_change_sets(competition_season_id, status, created_at desc);

create table public.fixture_change_items (
  id uuid primary key default gen_random_uuid(),
  change_set_id uuid not null references public.fixture_change_sets(id) on delete restrict,
  ordinal integer not null check (ordinal > 0),
  operation text not null check (operation in ('update', 'create', 'cancel')),
  fixture_id uuid references public.fixtures(id) on delete restrict,
  expected_schedule_version bigint check (expected_schedule_version > 0),
  original_fixture jsonb,
  reason text not null check (length(btrim(reason)) > 0),
  proposed_round_number integer check (proposed_round_number > 0),
  proposed_match_date date,
  proposed_kickoff_time time,
  proposed_court integer check (proposed_court > 0),
  proposed_home_team_id uuid references public.teams(id) on delete restrict,
  proposed_away_team_id uuid references public.teams(id) on delete restrict,
  proposed_publication_state text check (proposed_publication_state = 'published'),
  display_home_name text,
  display_away_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (change_set_id, ordinal),
  check (
    (operation = 'create' and fixture_id is null and expected_schedule_version is null and original_fixture is null)
    or (operation in ('update', 'cancel') and fixture_id is not null and expected_schedule_version is not null and original_fixture is not null)
  ),
  check (
    (operation = 'cancel' and proposed_round_number is null and proposed_match_date is null
      and proposed_kickoff_time is null and proposed_court is null and proposed_home_team_id is null
      and proposed_away_team_id is null and proposed_publication_state is null)
    or (operation in ('update', 'create') and proposed_round_number is not null and proposed_match_date is not null
      and proposed_kickoff_time is not null and proposed_court is not null and proposed_home_team_id is not null
      and proposed_away_team_id is not null and proposed_home_team_id <> proposed_away_team_id
      and proposed_publication_state is not null and proposed_publication_state = 'published')
  )
);
create unique index fixture_change_items_one_target on public.fixture_change_items(change_set_id, fixture_id)
  where fixture_id is not null;

create function private.fixture_change_message(
  p_severity text, p_code text, p_item_id uuid, p_fixture_id uuid, p_team_id uuid, p_message text
) returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object('severity', p_severity, 'code', p_code, 'itemId', p_item_id,
    'fixtureId', p_fixture_id, 'teamId', p_team_id, 'message', p_message);
$$;

create function private.fixture_change_report(p_change_set_id uuid) returns jsonb
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

create function private.fixture_report_has(p_report jsonb, p_severity text) returns boolean
language sql immutable set search_path = '' as $$
  select exists (select 1 from jsonb_array_elements(p_report->'messages') m where m->>'severity' = p_severity);
$$;

create function public.validate_fixture_change_set(p_change_set_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not (select private.is_admin()) then raise exception 'Administrator access required'; end if;
  return private.fixture_change_report(p_change_set_id);
end;
$$;
create trigger bump_fixture_schedule_version before update on public.fixtures
  for each row execute function private.bump_fixture_schedule_version();

-- One append-only before/after record per published item, including its reason.
create table public.fixture_change_history (
  id uuid primary key default gen_random_uuid(),
  change_set_id uuid not null references public.fixture_change_sets(id) on delete restrict,
  item_id uuid not null unique references public.fixture_change_items(id) on delete restrict,
  fixture_id uuid not null references public.fixtures(id) on delete restrict,
  operation text not null check (operation in ('update', 'create', 'cancel')),
  reason text not null,
  before_row jsonb,
  after_row jsonb not null,
  published_by uuid not null references auth.users(id) on delete restrict,
  published_at timestamptz not null default now()
);

create function private.bump_fixture_change_set_version() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.version := old.version + 1;
  return new;
end;
$$;
create trigger bump_fixture_change_set_version before update on public.fixture_change_sets
  for each row execute function private.bump_fixture_change_set_version();

create function private.guard_fixture_change_rows() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_parent_status text;
  v_competition_season_id uuid;
begin
  if tg_table_name = 'fixture_change_history' then
    if tg_op <> 'INSERT' then raise exception 'Published fixture history is immutable'; end if;
    select fcs.competition_season_id into v_competition_season_id
      from public.fixture_change_sets fcs where fcs.id = new.change_set_id;
  elsif tg_table_name = 'fixture_change_sets' then
    if tg_op = 'DELETE' then raise exception 'Fixture change sets cannot be deleted'; end if;
    if tg_op = 'UPDATE' and old.status in ('published', 'cancelled') then
      raise exception 'Published or cancelled change sets are immutable';
    end if;
    v_competition_season_id := case when tg_op = 'INSERT' then new.competition_season_id else old.competition_season_id end;
    if tg_op = 'UPDATE' and new.competition_season_id <> old.competition_season_id then
      raise exception 'A change set cannot move between competition seasons';
    end if;
  else
    select fcs.status, fcs.competition_season_id into v_parent_status, v_competition_season_id
      from public.fixture_change_sets fcs
      where fcs.id = case when tg_op = 'DELETE' then old.change_set_id else new.change_set_id end;
    if v_parent_status <> 'draft' then raise exception 'Only draft change items can be edited'; end if;
    if tg_op = 'UPDATE' and new.change_set_id <> old.change_set_id then
      raise exception 'A change item cannot move between change sets';
    end if;
  end if;
  if private.competition_season_is_archived(v_competition_season_id) then
    raise exception 'Archived competition data is read-only';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
create trigger guard_fixture_change_sets before insert or update or delete on public.fixture_change_sets
  for each row execute function private.guard_fixture_change_rows();
create trigger guard_fixture_change_items before insert or update or delete on public.fixture_change_items
  for each row execute function private.guard_fixture_change_rows();
create trigger guard_fixture_change_history before insert or update or delete on public.fixture_change_history
  for each row execute function private.guard_fixture_change_rows();

create trigger touch_fixture_change_sets before update on public.fixture_change_sets
  for each row execute function private.touch_updated_at();
create trigger touch_fixture_change_items before update on public.fixture_change_items
  for each row execute function private.touch_updated_at();
create trigger audit_fixture_change_sets after insert or update or delete on public.fixture_change_sets
  for each row execute function private.audit_change();
create trigger audit_fixture_change_items after insert or update or delete on public.fixture_change_items
  for each row execute function private.audit_change();
create trigger audit_fixture_change_history after insert or update or delete on public.fixture_change_history
  for each row execute function private.audit_change();

-- Only the owner-executed RPCs below may write fixtures or change-set tables.
revoke insert, update, delete on public.fixtures from authenticated;
alter table public.fixture_change_sets enable row level security;
alter table public.fixture_change_items enable row level security;
alter table public.fixture_change_history enable row level security;
create policy fixture_change_sets_admin_read on public.fixture_change_sets for select to authenticated
  using ((select private.is_admin()));
create policy fixture_change_items_admin_read on public.fixture_change_items for select to authenticated
  using ((select private.is_admin()));
create policy fixture_change_history_admin_read on public.fixture_change_history for select to authenticated
  using ((select private.is_admin()));
revoke all on public.fixture_change_sets, public.fixture_change_items, public.fixture_change_history from public, anon, authenticated;
grant select on public.fixture_change_sets, public.fixture_change_items, public.fixture_change_history to authenticated;
grant all on public.fixture_change_sets, public.fixture_change_items, public.fixture_change_history to service_role;

create function public.create_fixture_change_set(
  p_competition_season_id uuid, p_title text, p_source text, p_overall_note text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_new_id uuid;
begin
  if not (select private.is_admin()) then raise exception 'Administrator access required'; end if;
  if not exists (select 1 from public.competition_seasons cs where cs.id = p_competition_season_id and cs.lifecycle <> 'archived') then
    raise exception 'Unknown or archived competition season';
  end if;
  insert into public.fixture_change_sets as fcs(competition_season_id, title, source, overall_note, created_by)
  values (p_competition_season_id, p_title, p_source, p_overall_note, auth.uid())
  returning fcs.id into v_new_id;
  return v_new_id;
end;
$$;

create function public.replace_fixture_change_items(
  p_change_set_id uuid, p_expected_version bigint, p_items jsonb
) returns bigint language plpgsql security definer set search_path = '' as $$
declare
  v_plan public.fixture_change_sets%rowtype;
  v_entry jsonb;
  v_proposal jsonb;
  v_source_fixture public.fixtures%rowtype;
  v_operation text;
  v_fixture_id uuid;
  v_item_number integer := 0;
begin
  if not (select private.is_admin()) then raise exception 'Administrator access required'; end if;
  select fcs.* into v_plan from public.fixture_change_sets fcs where fcs.id = p_change_set_id for update;
  if not found or v_plan.status <> 'draft' then raise exception 'An editable draft change set is required'; end if;
  if v_plan.version <> p_expected_version then raise exception 'Change set is stale'; end if;
  if private.competition_season_is_archived(v_plan.competition_season_id) then raise exception 'Archived competition data is read-only'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one change item is required';
  end if;
  delete from public.fixture_change_items fci where fci.change_set_id = p_change_set_id;
  for v_entry in select element.value from jsonb_array_elements(p_items) element(value) loop
    v_item_number := v_item_number + 1;
    v_operation := v_entry->>'operation';
    if v_operation not in ('update', 'create', 'cancel') or nullif(btrim(v_entry->>'reason'), '') is null then
      raise exception 'Item % needs a valid operation and reason', v_item_number;
    end if;
    v_fixture_id := null;
    v_source_fixture := null;
    if v_operation <> 'create' then
      v_fixture_id := (v_entry->>'fixtureId')::uuid;
      select f.* into v_source_fixture from public.fixtures f where f.id = v_fixture_id for update;
      if not found then raise exception 'Unknown fixture in item %', v_item_number; end if;
      if v_source_fixture.competition_season_id <> v_plan.competition_season_id or v_source_fixture.stage <> 'regular_season' then
        raise exception 'Cross-competition or non-regular fixture in item %', v_item_number;
      end if;
    elsif v_entry ? 'fixtureId' then
      raise exception 'Create item cannot name an existing fixture';
    end if;
    v_proposal := v_entry->'proposed';
    if v_operation = 'cancel' and v_proposal is not null then raise exception 'Cancellation cannot include a proposal'; end if;
    if v_operation <> 'cancel' and jsonb_typeof(v_proposal) <> 'object' then raise exception 'Proposed fixture is required'; end if;
    insert into public.fixture_change_items(
      change_set_id, ordinal, operation, fixture_id, expected_schedule_version, original_fixture, reason,
      proposed_round_number, proposed_match_date, proposed_kickoff_time, proposed_court,
      proposed_home_team_id, proposed_away_team_id, proposed_publication_state, display_home_name, display_away_name
    ) values (
      p_change_set_id, v_item_number, v_operation, v_fixture_id,
      case when v_fixture_id is null then null else (v_entry->>'expectedFixtureVersion')::bigint end,
      case when v_fixture_id is null then null else to_jsonb(v_source_fixture) end, v_entry->>'reason',
      case when v_operation = 'cancel' then null else (v_proposal->>'roundNumber')::integer end,
      case when v_operation = 'cancel' then null else (v_proposal->>'date')::date end,
      case when v_operation = 'cancel' then null else (v_proposal->>'kickoffTime')::time end,
      case when v_operation = 'cancel' then null else (v_proposal->>'court')::integer end,
      case when v_operation = 'cancel' then null else (v_proposal->>'homeTeamId')::uuid end,
      case when v_operation = 'cancel' then null else (v_proposal->>'awayTeamId')::uuid end,
      case when v_operation = 'cancel' then null else v_proposal->>'publicationState' end,
      v_entry->>'homeTeamName', v_entry->>'awayTeamName'
    );
  end loop;
  update public.fixture_change_sets fcs set validation_report = '{"messages":[]}'::jsonb,
    warnings_acknowledged_at = null where fcs.id = p_change_set_id returning fcs.version into v_plan.version;
  return v_plan.version;
end;
$$;

create function public.transition_fixture_change_set(
  p_change_set_id uuid, p_expected_version bigint, p_action text, p_acknowledge_warnings boolean default false
) returns bigint language plpgsql security definer set search_path = '' as $$
declare
  v_plan public.fixture_change_sets%rowtype;
  v_report jsonb;
  v_new_version bigint;
begin
  if not (select private.is_admin()) then raise exception 'Administrator access required'; end if;
  select fcs.* into v_plan from public.fixture_change_sets fcs where fcs.id = p_change_set_id for update;
  if not found then raise exception 'Unknown fixture change set'; end if;
  if v_plan.version <> p_expected_version then raise exception 'Change set is stale'; end if;
  if private.competition_season_is_archived(v_plan.competition_season_id) then raise exception 'Archived competition data is read-only'; end if;
  if p_action = 'submit' and v_plan.status = 'draft' then
    v_report := private.fixture_change_report(p_change_set_id);
    if private.fixture_report_has(v_report, 'blocking') then raise exception 'Blocking fixture validation errors'; end if;
    if private.fixture_report_has(v_report, 'warning') and not p_acknowledge_warnings then
      raise exception 'Fixture warnings require explicit acknowledgement';
    end if;
    update public.fixture_change_sets fcs set status = 'pending_review', validation_report = v_report,
      warnings_acknowledged_at = case when private.fixture_report_has(v_report, 'warning') then now() else null end,
      reviewed_by = auth.uid(), reviewed_at = now()
      where fcs.id = p_change_set_id returning fcs.version into v_new_version;
  elsif p_action = 'return' and v_plan.status = 'pending_review' then
    update public.fixture_change_sets fcs set status = 'draft', validation_report = '{"messages":[]}'::jsonb,
      warnings_acknowledged_at = null, reviewed_by = null, reviewed_at = null
      where fcs.id = p_change_set_id returning fcs.version into v_new_version;
  elsif p_action = 'cancel' and v_plan.status in ('draft', 'pending_review') then
    update public.fixture_change_sets fcs set status = 'cancelled' where fcs.id = p_change_set_id
      returning fcs.version into v_new_version;
  else
    raise exception 'Invalid fixture change-set transition';
  end if;
  return v_new_version;
end;
$$;

-- A function call is one PostgreSQL transaction. The physical-location row
-- serializes publications from every competition/division at that venue.
-- The temporary unpublish phase frees slots for swaps.
-- MVCC keeps the old published fixtures visible until the entire call commits.
create function public.publish_fixture_change_set(p_change_set_id uuid, p_expected_version bigint) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_plan public.fixture_change_sets%rowtype;
  v_item public.fixture_change_items%rowtype;
  v_fixture public.fixtures%rowtype;
  v_report jsonb;
  v_before_rows jsonb;
  v_before_row jsonb;
  v_new_fixture_id uuid;
begin
  if not (select private.is_admin()) then raise exception 'Administrator access required'; end if;
  select fcs.* into v_plan from public.fixture_change_sets fcs where fcs.id = p_change_set_id;
  if not found then raise exception 'Unknown fixture change set'; end if;
  perform 1 from public.locations l
    join public.competitions c on c.location_id = l.id
    join public.competition_seasons cs on cs.competition_id = c.id
    where cs.id = v_plan.competition_season_id for update of l;
  if not found then raise exception 'Competition location could not be resolved'; end if;
  perform 1 from public.competition_seasons cs where cs.id = v_plan.competition_season_id for update;
  select fcs.* into v_plan from public.fixture_change_sets fcs where fcs.id = p_change_set_id for update;
  if v_plan.status <> 'pending_review' then raise exception 'A pending-review change set is required'; end if;
  if v_plan.version <> p_expected_version then raise exception 'Change set is stale'; end if;
  if private.competition_season_is_archived(v_plan.competition_season_id) then raise exception 'Archived competition data is read-only'; end if;
  perform 1 from public.fixtures f where f.id in (
    select x.fixture_id from public.fixture_change_items x where x.change_set_id = p_change_set_id and x.fixture_id is not null
  ) order by f.id for update;
  v_report := private.fixture_change_report(p_change_set_id);
  if private.fixture_report_has(v_report, 'blocking') then raise exception 'Blocking fixture validation errors'; end if;
  if v_report is distinct from v_plan.validation_report then raise exception 'Fixture validation changed; return the plan to draft and review again'; end if;
  if private.fixture_report_has(v_report, 'warning') and v_plan.warnings_acknowledged_at is null then
    raise exception 'Fixture warnings have not been acknowledged';
  end if;
  select coalesce(jsonb_object_agg(f.id::text, to_jsonb(f)), '{}'::jsonb) into v_before_rows
    from public.fixtures f join public.fixture_change_items x on x.fixture_id = f.id
    where x.change_set_id = p_change_set_id;
  update public.fixtures f set publication_state = 'draft'
    where f.id in (select fci.fixture_id from public.fixture_change_items fci
      where fci.change_set_id = p_change_set_id and fci.fixture_id is not null);
  for v_item in select fci.* from public.fixture_change_items fci where fci.change_set_id = p_change_set_id order by fci.ordinal loop
    v_before_row := case when v_item.fixture_id is null then null else v_before_rows->(v_item.fixture_id::text) end;
    if v_item.operation = 'create' then
      v_new_fixture_id := gen_random_uuid();
      insert into public.fixtures as f(id, competition_season_id, legacy_id, round_number, match_date,
        kickoff_time, court, home_team_id, away_team_id, stage, publication_state, schedule_status)
      values (v_new_fixture_id, v_plan.competition_season_id, v_new_fixture_id::text, v_item.proposed_round_number,
        v_item.proposed_match_date, v_item.proposed_kickoff_time, v_item.proposed_court,
        v_item.proposed_home_team_id, v_item.proposed_away_team_id, 'regular_season', 'published', 'scheduled')
      returning f.* into v_fixture;
    elsif v_item.operation = 'cancel' then
      update public.fixtures f set schedule_status = 'cancelled', publication_state = 'draft'
        where f.id = v_item.fixture_id returning f.* into v_fixture;
    else
      update public.fixtures f set round_number = v_item.proposed_round_number,
        match_date = v_item.proposed_match_date, kickoff_time = v_item.proposed_kickoff_time,
        court = v_item.proposed_court, home_team_id = v_item.proposed_home_team_id,
        away_team_id = v_item.proposed_away_team_id, schedule_status = 'scheduled', publication_state = 'published'
        where f.id = v_item.fixture_id returning f.* into v_fixture;
    end if;
    insert into public.fixture_change_history(change_set_id, item_id, fixture_id, operation,
      reason, before_row, after_row, published_by)
    values (p_change_set_id, v_item.id, v_fixture.id, v_item.operation, v_item.reason,
      v_before_row, to_jsonb(v_fixture), auth.uid());
  end loop;
  update public.fixture_change_sets fcs set status = 'published', published_by = auth.uid(),
    published_at = now(), validation_report = v_report where fcs.id = p_change_set_id;
end;
$$;

-- Only authenticated administrators may invoke the narrow workflow RPCs.
revoke all on function public.create_fixture_change_set(uuid, text, text, text),
  public.replace_fixture_change_items(uuid, bigint, jsonb),
  public.transition_fixture_change_set(uuid, bigint, text, boolean),
  public.validate_fixture_change_set(uuid), public.publish_fixture_change_set(uuid, bigint)
  from public, anon, authenticated;
revoke all on function private.bump_fixture_schedule_version(), private.fixture_change_message(text, text, uuid, uuid, uuid, text),
  private.fixture_change_report(uuid), private.fixture_report_has(jsonb, text),
  private.bump_fixture_change_set_version(), private.guard_fixture_change_rows()
  from public, anon, authenticated;
grant execute on function public.create_fixture_change_set(uuid, text, text, text),
  public.replace_fixture_change_items(uuid, bigint, jsonb),
  public.transition_fixture_change_set(uuid, bigint, text, boolean),
  public.validate_fixture_change_set(uuid), public.publish_fixture_change_set(uuid, bigint)
  to authenticated;

commit;
