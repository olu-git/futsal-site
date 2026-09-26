-- FIS admin schema. Auth users and season data are provisioned separately.
begin;

create schema if not exists private;

-- Membership plus a confirmed Auth email are both required for admin access.
-- The singleton index limits the initial installation to one administrator.
create table private.admin_users (
  user_id uuid primary key references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
create unique index admin_users_singleton on private.admin_users ((true));
alter table private.admin_users enable row level security;

create function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from private.admin_users a join auth.users u on u.id = a.user_id
    where a.user_id = (select auth.uid())
      and lower(u.email) = 'contact@futsalindoorsoccer.com.au'
      and u.email_confirmed_at is not null
  );
$$;

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(btrim(name)) > 0),
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (length(btrim(code)) > 0),
  name text not null check (length(btrim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(btrim(name)) > 0),
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ISO weekday puts night before division in the competition hierarchy.
create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  location_id uuid not null references public.locations(id) on delete restrict,
  weekday smallint not null check (weekday between 1 and 7),
  division text not null check (length(btrim(division)) > 0),
  name text not null check (length(btrim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, location_id, weekday, division)
);

-- Lifecycle belongs to a competition edition, not to a global season. This
-- permits Monday, Wednesday, and future competitions to run independently.
create table public.competition_seasons (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete restrict,
  season_id uuid not null references public.seasons(id) on delete restrict,
  lifecycle text not null default 'planned' check (lifecycle in ('planned', 'active', 'archived')),
  publication_state text not null default 'draft' check (publication_state in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, season_id)
);
create unique index competition_seasons_one_active_per_competition
  on public.competition_seasons(competition_id) where lifecycle = 'active';

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  competition_season_id uuid not null references public.competition_seasons(id) on delete restrict,
  legacy_id text,
  name text not null check (length(btrim(name)) > 0),
  status text not null default 'active' check (status in ('active', 'inactive', 'withdrawn', 'replaced')),
  standings_eligible boolean not null default true,
  kit_colour text check (kit_colour ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_season_id, id),
  unique (competition_season_id, legacy_id)
);
create unique index teams_name_unique_per_competition_season
  on public.teams(competition_season_id, lower(btrim(name)));

-- Private part of the team profile; public team queries never expose notes.
create table public.team_fixture_notes (
  team_id uuid primary key references public.teams(id) on delete cascade,
  notes text not null check (length(btrim(notes)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_kickoff_preferences (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  kickoff_time time not null,
  classification text not null check (classification in ('required', 'preferred', 'avoid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, kickoff_time)
);

-- Knockout/grading slots can remain unresolved until feeder games finish.
create table public.fixtures (
  id uuid primary key default gen_random_uuid(),
  competition_season_id uuid not null references public.competition_seasons(id) on delete restrict,
  legacy_id text,
  round_number integer not null check (round_number > 0),
  round_label text,
  match_date date not null,
  kickoff_time time not null,
  court integer not null check (court > 0),
  home_team_id uuid,
  away_team_id uuid,
  stage text not null default 'regular_season' check (stage in ('regular_season', 'knockout', 'grading')),
  publication_state text not null default 'draft' check (publication_state in ('draft', 'published')),
  public_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_season_id, legacy_id),
  foreign key (competition_season_id, home_team_id) references public.teams(competition_season_id, id) on delete restrict,
  foreign key (competition_season_id, away_team_id) references public.teams(competition_season_id, id) on delete restrict,
  check (home_team_id is null or away_team_id is null or home_team_id <> away_team_id),
  check (stage <> 'regular_season' or home_team_id is not null and away_team_id is not null)
);
create unique index fixtures_published_court_slot
  on public.fixtures(competition_season_id, match_date, kickoff_time, court)
  where publication_state = 'published';

-- A correction is a new version; the old published score stays visible during review.
create table public.result_versions (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures(id) on delete restrict,
  revision integer not null check (revision > 0),
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published', 'superseded')),
  home_score integer check (home_score >= 0),
  away_score integer check (away_score >= 0),
  forfeit_side text check (forfeit_side in ('home', 'away')),
  forfeit_exception_reason text,
  penalty_home_score integer check (penalty_home_score >= 0),
  penalty_away_score integer check (penalty_away_score >= 0),
  penalty_winner text check (penalty_winner in ('home', 'away')),
  supersedes_result_id uuid references public.result_versions(id) on delete restrict,
  correction_reason text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (fixture_id, revision),
  check (supersedes_result_id is null or coalesce(length(btrim(correction_reason)) > 0, false)),
  check (
    forfeit_side is null and forfeit_exception_reason is null
    or forfeit_side = 'home' and
      (home_score = 0 and away_score = 5 or coalesce(length(btrim(forfeit_exception_reason)) > 0, false))
    or forfeit_side = 'away' and
      (home_score = 5 and away_score = 0 or coalesce(length(btrim(forfeit_exception_reason)) > 0, false))
  )
);
create unique index result_versions_one_published on public.result_versions(fixture_id)
  where status = 'published';

-- Signed deltas preserve the existing JSON model. Every row needs a reason.
create table public.standing_adjustments (
  id uuid primary key default gen_random_uuid(),
  competition_season_id uuid not null references public.competition_seasons(id) on delete restrict,
  team_id uuid not null,
  legacy_id text,
  played_delta integer not null default 0,
  wins_delta integer not null default 0,
  draws_delta integer not null default 0,
  losses_delta integer not null default 0,
  goals_for_delta integer not null default 0,
  goals_against_delta integer not null default 0,
  points_delta integer not null default 0,
  reason text not null check (length(btrim(reason)) > 0),
  publication_state text not null default 'draft' check (publication_state in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_season_id, legacy_id),
  foreign key (competition_season_id, team_id) references public.teams(competition_season_id, id) on delete restrict
);

-- Audit row images can contain private notes; never grant public access.
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  table_schema text not null,
  table_name text not null,
  row_id uuid,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  old_row jsonb,
  new_row jsonb,
  actor_id uuid,
  actor_role text not null,
  changed_at timestamptz not null default now(),
  transaction_id bigint not null default txid_current()
);
create index admin_audit_log_changed_at on public.admin_audit_log(changed_at desc);

create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create function private.competition_season_is_archived(p_competition_season_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.competition_seasons cs
    where cs.id = p_competition_season_id and cs.lifecycle = 'archived'
  );
$$;

-- Archiving is one-way through ordinary admin access. Historical competition
-- editions and every row that contributes to them then become read-only.
create function private.protect_archived_competition_season() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.lifecycle = 'archived' then
    raise exception 'Archived competition seasons are read-only';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create function private.protect_archived_competition_data() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  old_competition_season_id uuid;
  new_competition_season_id uuid;
begin
  if tg_table_name in ('teams', 'fixtures', 'standing_adjustments') then
    if tg_op <> 'INSERT' then old_competition_season_id := old.competition_season_id; end if;
    if tg_op <> 'DELETE' then new_competition_season_id := new.competition_season_id; end if;
  elsif tg_table_name = 'result_versions' then
    if tg_op <> 'INSERT' then
      select f.competition_season_id into old_competition_season_id
      from public.fixtures f where f.id = old.fixture_id;
    end if;
    if tg_op <> 'DELETE' then
      select f.competition_season_id into new_competition_season_id
      from public.fixtures f where f.id = new.fixture_id;
    end if;
  elsif tg_table_name in ('team_fixture_notes', 'team_kickoff_preferences') then
    if tg_op <> 'INSERT' then
      select t.competition_season_id into old_competition_season_id
      from public.teams t where t.id = old.team_id;
    end if;
    if tg_op <> 'DELETE' then
      select t.competition_season_id into new_competition_season_id
      from public.teams t where t.id = new.team_id;
    end if;
  end if;

  if private.competition_season_is_archived(old_competition_season_id)
     or private.competition_season_is_archived(new_competition_season_id) then
    raise exception 'Archived competition data is read-only';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create function private.audit_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  before_row jsonb;
  after_row jsonb;
begin
  before_row := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  after_row := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  insert into public.admin_audit_log(table_schema, table_name, row_id, action, old_row, new_row, actor_id, actor_role)
  values (tg_table_schema, tg_table_name,
    (coalesce(coalesce(after_row, before_row)->>'id',
      coalesce(after_row, before_row)->>'user_id',
      coalesce(after_row, before_row)->>'team_id'))::uuid,
    tg_op, before_row, after_row, auth.uid(), coalesce(auth.role(), current_user));
  return coalesce(new, old);
end;
$$;

-- Published values are immutable; publish a correction draft instead.
create function private.validate_result_version() returns trigger
language plpgsql set search_path = '' as $$
declare
  match_stage text;
  old_fixture_id uuid;
  has_penalty_data boolean;
  has_complete_penalty_data boolean;
begin
  if tg_op = 'DELETE' then
    if old.status in ('published', 'superseded') then
      raise exception 'Published result history cannot be deleted';
    end if;
    return old;
  end if;
  if tg_op = 'INSERT' and new.status = 'superseded' then
    raise exception 'A new result cannot start as superseded';
  end if;
  select f.stage into match_stage from public.fixtures f where f.id = new.fixture_id;
  has_penalty_data := new.penalty_home_score is not null
    or new.penalty_away_score is not null
    or new.penalty_winner is not null;
  has_complete_penalty_data := new.penalty_home_score is not null
    and new.penalty_away_score is not null
    and new.penalty_winner is not null;

  if match_stage <> 'knockout' and has_penalty_data then
    raise exception 'Penalty shootouts are only valid for knockout fixtures';
  end if;
  if new.status = 'published' and not exists (
    select 1 from public.fixtures f where f.id = new.fixture_id
      and f.home_team_id is not null and f.away_team_id is not null
  ) then
    raise exception 'Published results require two resolved teams';
  end if;
  if new.status = 'published' then
    if new.home_score is null or new.away_score is null then
      raise exception 'Published results require complete regulation scores';
    end if;
    if match_stage = 'knockout' and new.home_score = new.away_score then
      if not has_complete_penalty_data then
        raise exception 'A tied published knockout result requires a complete penalty shootout';
      end if;
      if new.penalty_home_score = new.penalty_away_score then
        raise exception 'A published penalty shootout cannot remain tied';
      end if;
      if (new.penalty_winner = 'home' and new.penalty_home_score < new.penalty_away_score)
         or (new.penalty_winner = 'away' and new.penalty_away_score < new.penalty_home_score) then
        raise exception 'Penalty winner must match the penalty shootout score';
      end if;
    elsif has_penalty_data then
      raise exception 'Penalty shootouts require tied regulation scores in a knockout fixture';
    end if;
  end if;
  if new.supersedes_result_id is not null then
    select r.fixture_id into old_fixture_id from public.result_versions r where r.id = new.supersedes_result_id;
    if old_fixture_id is distinct from new.fixture_id then
      raise exception 'Correction must refer to the same fixture';
    end if;
  end if;
  if tg_op = 'UPDATE' then
    if new.fixture_id <> old.fixture_id or new.revision <> old.revision or
       new.created_at <> old.created_at or new.created_by is distinct from old.created_by then
      raise exception 'Result identity and authorship are immutable';
    end if;
    if old.status in ('published', 'superseded') and
       (new.status <> 'superseded' or
        (to_jsonb(new) - 'status' - 'updated_at') is distinct from
        (to_jsonb(old) - 'status' - 'updated_at')) then
      raise exception 'Published scores cannot be edited; create a correction draft';
    end if;
  end if;
  if tg_op = 'INSERT' and new.status = 'published' then
    new.published_at := now();
    new.published_by := auth.uid();
  elsif tg_op = 'UPDATE' and new.status = 'published' and old.status <> 'published' then
    new.published_at := now();
    new.published_by := auth.uid();
  end if;
  return new;
end;
$$;
create trigger validate_result_version before insert or update or delete on public.result_versions
  for each row execute function private.validate_result_version();

-- Invoker rights plus an admin check allow atomic review/publish and correction.
create function public.publish_result(p_result_id uuid) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  candidate public.result_versions%rowtype;
  current_result public.result_versions%rowtype;
begin
  if not (select private.is_admin()) then raise exception 'Administrator access required'; end if;
  select * into candidate from public.result_versions where id = p_result_id for update;
  if not found or candidate.status not in ('draft', 'pending_review') then
    raise exception 'A draft or pending review result is required';
  end if;
  perform 1 from public.fixtures where id = candidate.fixture_id for update;
  select * into current_result from public.result_versions
    where fixture_id = candidate.fixture_id and status = 'published' for update;
  if found then
    if candidate.supersedes_result_id is distinct from current_result.id then
      raise exception 'Correction must reference the current published result';
    end if;
    update public.result_versions set status = 'superseded' where id = current_result.id;
  elsif candidate.supersedes_result_id is not null then
    raise exception 'No published result exists to correct';
  end if;
  update public.result_versions set status = 'published' where id = p_result_id;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'seasons', 'categories', 'locations', 'competitions', 'competition_seasons', 'teams',
    'team_fixture_notes', 'team_kickoff_preferences', 'fixtures', 'result_versions', 'standing_adjustments'
  ] loop
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()', table_name);
    execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function private.audit_change()', table_name);
  end loop;
end;
$$;
create trigger protect_archived_competition_season
  before update or delete on public.competition_seasons
  for each row execute function private.protect_archived_competition_season();
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'teams', 'team_fixture_notes', 'team_kickoff_preferences',
    'fixtures', 'result_versions', 'standing_adjustments'
  ] loop
    execute format('create trigger protect_archived_data before insert or update or delete on public.%I for each row execute function private.protect_archived_competition_data()', table_name);
  end loop;
end;
$$;
create trigger audit_admin_users after insert or update or delete on private.admin_users
  for each row execute function private.audit_change();

create function private.is_public_competition_season(p_competition_season_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.competition_seasons cs
    where cs.id = p_competition_season_id and cs.publication_state = 'published'
  );
$$;

alter table public.seasons enable row level security;
alter table public.categories enable row level security;
alter table public.locations enable row level security;
alter table public.competitions enable row level security;
alter table public.competition_seasons enable row level security;
alter table public.teams enable row level security;
alter table public.team_fixture_notes enable row level security;
alter table public.team_kickoff_preferences enable row level security;
alter table public.fixtures enable row level security;
alter table public.result_versions enable row level security;
alter table public.standing_adjustments enable row level security;
alter table public.admin_audit_log enable row level security;

create policy seasons_read on public.seasons for select to anon, authenticated
  using (exists (select 1 from public.competition_seasons cs where cs.season_id = seasons.id
    and cs.publication_state = 'published') or (select private.is_admin()));
create policy categories_read on public.categories for select to anon, authenticated
  using (exists (select 1 from public.competitions c join public.competition_seasons cs
    on cs.competition_id = c.id where c.category_id = categories.id and cs.publication_state = 'published')
    or (select private.is_admin()));
create policy locations_read on public.locations for select to anon, authenticated
  using (exists (select 1 from public.competitions c join public.competition_seasons cs
    on cs.competition_id = c.id where c.location_id = locations.id and cs.publication_state = 'published')
    or (select private.is_admin()));
create policy competitions_read on public.competitions for select to anon, authenticated
  using (exists (select 1 from public.competition_seasons cs where cs.competition_id = competitions.id
    and cs.publication_state = 'published') or (select private.is_admin()));
create policy competition_seasons_read on public.competition_seasons for select to anon, authenticated
  using (publication_state = 'published' or (select private.is_admin()));
create policy teams_read on public.teams for select to anon, authenticated
  using ((select private.is_public_competition_season(competition_season_id)) or (select private.is_admin()));
create policy fixtures_read on public.fixtures for select to anon, authenticated
  using ((publication_state = 'published' and (select private.is_public_competition_season(competition_season_id)))
    or (select private.is_admin()));
create policy results_read on public.result_versions for select to anon, authenticated
  using ((status = 'published' and exists (
    select 1 from public.fixtures f where f.id = result_versions.fixture_id and f.publication_state = 'published'
      and (select private.is_public_competition_season(f.competition_season_id))))
    or (select private.is_admin()));
create policy adjustments_read on public.standing_adjustments for select to anon, authenticated
  using ((publication_state = 'published' and (select private.is_public_competition_season(competition_season_id)))
    or (select private.is_admin()));
create policy preferences_admin on public.team_kickoff_preferences for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy notes_admin on public.team_fixture_notes for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy audit_admin_read on public.admin_audit_log for select to authenticated
  using ((select private.is_admin()));

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'seasons', 'categories', 'locations', 'competitions', 'competition_seasons', 'teams',
    'fixtures', 'result_versions', 'standing_adjustments'
  ] loop
    execute format('create policy admin_write on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))', table_name);
  end loop;
end;
$$;

-- This view derives the public ladder from published regular-season scores.
-- security_invoker applies every source-table RLS policy to the caller.
create view public.standings with (security_invoker = true) as
with scored as (
  select f.competition_season_id, f.home_team_id as team_id, 1 as played,
    (r.home_score > r.away_score)::integer as wins,
    (r.home_score = r.away_score)::integer as draws,
    (r.home_score < r.away_score)::integer as losses,
    r.home_score as goals_for, r.away_score as goals_against,
    case when r.home_score > r.away_score then 3 when r.home_score = r.away_score then 1 else 0 end as points
  from public.fixtures f join public.result_versions r on r.fixture_id = f.id and r.status = 'published'
  where f.stage = 'regular_season' and f.publication_state = 'published'
  union all
  select f.competition_season_id, f.away_team_id, 1,
    (r.away_score > r.home_score)::integer,
    (r.home_score = r.away_score)::integer,
    (r.away_score < r.home_score)::integer,
    r.away_score, r.home_score,
    case when r.away_score > r.home_score then 3 when r.home_score = r.away_score then 1 else 0 end
  from public.fixtures f join public.result_versions r on r.fixture_id = f.id and r.status = 'published'
  where f.stage = 'regular_season' and f.publication_state = 'published'
), contributions as (
  select competition_season_id, team_id, played, wins, draws, losses, goals_for, goals_against, points from scored
  union all
  select competition_season_id, team_id, played_delta, wins_delta, draws_delta, losses_delta,
    goals_for_delta, goals_against_delta, points_delta
  from public.standing_adjustments where publication_state = 'published'
), totals as (
  select t.competition_season_id, t.id as team_id, t.name as team_name,
    coalesce(sum(c.played), 0)::integer as played,
    coalesce(sum(c.wins), 0)::integer as wins,
    coalesce(sum(c.draws), 0)::integer as draws,
    coalesce(sum(c.losses), 0)::integer as losses,
    coalesce(sum(c.goals_for), 0)::integer as goals_for,
    coalesce(sum(c.goals_against), 0)::integer as goals_against,
    coalesce(sum(c.points), 0)::integer as points
  from public.teams t left join contributions c on c.team_id = t.id and c.competition_season_id = t.competition_season_id
  where t.standings_eligible
  group by t.competition_season_id, t.id, t.name
)
select competition_season_id, team_id, team_name, played, wins, draws, losses, goals_for, goals_against,
  goals_for - goals_against as goal_difference, points,
  row_number() over (partition by competition_season_id order by points desc,
    goals_for - goals_against desc, goals_for desc, team_name asc) as position
from totals;

-- Grants are explicit because automatic new-table exposure is disabled.
revoke all on private.admin_users from public, anon, authenticated;
revoke all on public.seasons, public.categories, public.locations, public.competitions, public.competition_seasons,
  public.teams, public.team_fixture_notes, public.team_kickoff_preferences, public.fixtures, public.result_versions,
  public.standing_adjustments, public.admin_audit_log, public.standings from public, anon, authenticated;
revoke all on function private.is_admin(), private.is_public_competition_season(uuid),
  private.competition_season_is_archived(uuid), private.protect_archived_competition_season(),
  private.protect_archived_competition_data(), private.touch_updated_at(), private.audit_change(), private.validate_result_version(),
  public.publish_result(uuid) from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant usage on schema private to anon, authenticated;
grant usage on schema public, private to service_role;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.is_public_competition_season(uuid) to anon, authenticated;
grant execute on function public.publish_result(uuid) to authenticated;
grant select on public.seasons, public.categories, public.locations, public.competitions, public.competition_seasons,
  public.fixtures, public.result_versions, public.standing_adjustments, public.standings to anon;
grant select on public.teams to anon;
grant select, insert, update, delete on public.seasons, public.categories, public.locations,
  public.competitions, public.competition_seasons, public.teams, public.team_fixture_notes, public.team_kickoff_preferences, public.fixtures,
  public.result_versions, public.standing_adjustments to authenticated;
grant select on public.admin_audit_log, public.standings to authenticated;
grant all on public.seasons, public.categories, public.locations, public.competitions,
  public.competition_seasons, public.teams, public.team_fixture_notes, public.team_kickoff_preferences, public.fixtures,
  public.result_versions, public.standing_adjustments, public.admin_audit_log to service_role;
grant select on public.standings to service_role;

commit;
