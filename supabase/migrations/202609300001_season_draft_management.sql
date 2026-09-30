begin;

create table public.season_drafts (
  id uuid primary key default gen_random_uuid(),
  source_season_id uuid references public.seasons(id) on delete restrict,
  name text not null check (length(btrim(name)) > 0),
  starts_on date not null,
  ends_on date not null,
  status text not null default 'draft' check (status in ('draft','validated','activated','abandoned')),
  version integer not null default 1 check (version > 0),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  activated_season_id uuid references public.seasons(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  activated_at timestamptz,
  check (ends_on > starts_on)
);
create unique index season_drafts_name_open_unique on public.season_drafts(lower(btrim(name))) where status in ('draft','validated');

create table public.season_draft_competitions (
  id uuid primary key default gen_random_uuid(),
  season_draft_id uuid not null references public.season_drafts(id) on delete cascade,
  source_competition_season_id uuid references public.competition_seasons(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  location_id uuid not null references public.locations(id) on delete restrict,
  weekday smallint not null check (weekday between 1 and 7),
  division text not null check (length(btrim(division)) > 0),
  name text not null check (length(btrim(name)) > 0),
  retained boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_draft_id, category_id, location_id, weekday, division)
);

create table public.season_draft_teams (
  id uuid primary key default gen_random_uuid(),
  season_draft_id uuid not null references public.season_drafts(id) on delete cascade,
  draft_competition_id uuid not null references public.season_draft_competitions(id) on delete cascade,
  source_team_id uuid not null references public.teams(id) on delete restrict,
  selected boolean not null default true,
  name text not null check (length(btrim(name)) > 0),
  status text not null default 'active' check (status in ('active','inactive','withdrawn','replaced')),
  standings_eligible boolean not null default true,
  kit_colour text check (kit_colour ~ '^#[0-9A-Fa-f]{6}$'),
  copy_private_profile boolean not null default true,
  fixture_note text,
  preferences jsonb not null default '[]'::jsonb check (jsonb_typeof(preferences)='array'),
  source_fixture_note text,
  source_preferences jsonb not null default '[]'::jsonb check (jsonb_typeof(source_preferences)='array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_draft_id, source_team_id)
);
create unique index season_draft_team_name_unique on public.season_draft_teams(draft_competition_id,lower(btrim(name))) where selected;

alter table public.season_drafts enable row level security;
alter table public.season_draft_competitions enable row level security;
alter table public.season_draft_teams enable row level security;
create policy season_drafts_admin on public.season_drafts for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy season_draft_competitions_admin on public.season_draft_competitions for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy season_draft_teams_admin on public.season_draft_teams for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create trigger season_drafts_touch before update on public.season_drafts for each row execute function private.touch_updated_at();
create trigger season_draft_competitions_touch before update on public.season_draft_competitions for each row execute function private.touch_updated_at();
create trigger season_draft_teams_touch before update on public.season_draft_teams for each row execute function private.touch_updated_at();
create trigger season_drafts_audit after insert or update or delete on public.season_drafts for each row execute function private.audit_change();
create trigger season_draft_competitions_audit after insert or update or delete on public.season_draft_competitions for each row execute function private.audit_change();
create trigger season_draft_teams_audit after insert or update or delete on public.season_draft_teams for each row execute function private.audit_change();

create or replace function private.assert_season_draft_valid(p_draft_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare v_draft public.season_drafts%rowtype; v_invalid integer;
begin
  select d.* into v_draft from public.season_drafts d where d.id=p_draft_id for update;
  if not found then raise exception 'Season draft not found'; end if;
  if v_draft.status not in ('draft','validated') then raise exception 'Season draft is not editable'; end if;
  if length(btrim(v_draft.name))=0 or v_draft.ends_on<=v_draft.starts_on then raise exception 'Season metadata is invalid'; end if;
  if exists(select 1 from public.seasons s where lower(btrim(s.name))=lower(btrim(v_draft.name))) then raise exception 'Season name already exists'; end if;
  if not exists(select 1 from public.season_draft_competitions c where c.season_draft_id=p_draft_id and c.retained) then raise exception 'At least one competition is required'; end if;
  select count(*) into v_invalid from public.season_draft_teams t where t.season_draft_id=p_draft_id and t.selected and (length(btrim(t.name))=0 or jsonb_typeof(t.preferences)<>'array');
  if v_invalid>0 then raise exception 'A selected team profile is invalid'; end if;
  if exists(
    select 1 from public.season_draft_teams t
    cross join lateral jsonb_array_elements(t.preferences) p
    where t.season_draft_id=p_draft_id and t.selected and t.copy_private_profile
      and (p->>'classification' not in ('required','preferred','avoid')
        or coalesce(p->>'kickoff_time','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
  ) then raise exception 'A copied kick-off preference is invalid'; end if;
  if exists(
    select 1 from public.season_draft_teams t
    cross join lateral jsonb_array_elements(t.preferences) p
    where t.season_draft_id=p_draft_id and t.selected and t.copy_private_profile
    group by t.id,p->>'kickoff_time' having count(*)>1
  ) then raise exception 'A team has duplicate or conflicting kick-off preferences'; end if;
end $$;

create or replace function public.create_season_draft(p_name text,p_starts_on date,p_ends_on date,p_source_season_id uuid default null)
returns table(draft_id uuid,draft_version integer) language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_source uuid;
begin
  if not private.is_admin() then raise exception 'Administrator access is required'; end if;
  if p_ends_on<=p_starts_on or length(btrim(p_name))=0 then raise exception 'Valid season name and dates are required'; end if;
  v_source:=coalesce(p_source_season_id,(select cs.season_id from public.competition_seasons cs where cs.lifecycle='active' order by cs.updated_at desc limit 1));
  insert into public.season_drafts(source_season_id,name,starts_on,ends_on) values(v_source,btrim(p_name),p_starts_on,p_ends_on) returning id into v_id;
  insert into public.season_draft_competitions(season_draft_id,source_competition_season_id,category_id,location_id,weekday,division,name)
  select v_id,cs.id,c.category_id,c.location_id,c.weekday,c.division,c.name from public.competition_seasons cs join public.competitions c on c.id=cs.competition_id where cs.season_id=v_source and cs.lifecycle='active';
  insert into public.season_draft_teams(season_draft_id,draft_competition_id,source_team_id,name,status,standings_eligible,kit_colour,fixture_note,preferences,source_fixture_note,source_preferences)
  select v_id,dc.id,t.id,t.name,'active',t.standings_eligible,t.kit_colour,n.notes,
    coalesce(pref.preferences,'[]'::jsonb),n.notes,coalesce(pref.preferences,'[]'::jsonb)
  from public.season_draft_competitions dc
  join public.teams t on t.competition_season_id=dc.source_competition_season_id
  left join public.team_fixture_notes n on n.team_id=t.id
  left join lateral (
    select jsonb_agg(jsonb_build_object('kickoff_time',to_char(p.kickoff_time,'HH24:MI'),'classification',p.classification) order by p.kickoff_time) as preferences
    from public.team_kickoff_preferences p where p.team_id=t.id
  ) pref on true
  where dc.season_draft_id=v_id and t.status='active';
  return query select v_id,1;
end $$;

create or replace function public.save_season_draft(p_draft_id uuid,p_expected_version integer,p_name text,p_starts_on date,p_ends_on date,p_competitions jsonb,p_teams jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare v_version integer;
begin
  if not private.is_admin() then raise exception 'Administrator access is required'; end if;
  update public.season_drafts d set name=btrim(p_name),starts_on=p_starts_on,ends_on=p_ends_on,status='draft',version=d.version+1 where d.id=p_draft_id and d.version=p_expected_version and d.status in ('draft','validated') returning d.version into v_version;
  if v_version is null then raise exception using errcode='40001',message='Stale season draft: changed since the editor loaded it'; end if;
  delete from public.season_draft_teams t where t.season_draft_id=p_draft_id;
  delete from public.season_draft_competitions c where c.season_draft_id=p_draft_id;
  insert into public.season_draft_competitions(id,season_draft_id,source_competition_season_id,category_id,location_id,weekday,division,name,retained)
  select (x->>'id')::uuid,p_draft_id,nullif(x->>'source_competition_season_id','')::uuid,(x->>'category_id')::uuid,(x->>'location_id')::uuid,(x->>'weekday')::smallint,btrim(x->>'division'),btrim(x->>'name'),coalesce((x->>'retained')::boolean,true) from jsonb_array_elements(p_competitions)x;
  insert into public.season_draft_teams(id,season_draft_id,draft_competition_id,source_team_id,selected,name,status,standings_eligible,kit_colour,copy_private_profile,fixture_note,preferences,source_fixture_note,source_preferences)
  select (x->>'id')::uuid,p_draft_id,(x->>'draft_competition_id')::uuid,(x->>'source_team_id')::uuid,coalesce((x->>'selected')::boolean,true),btrim(x->>'name'),coalesce(x->>'status','active'),coalesce((x->>'standings_eligible')::boolean,true),nullif(x->>'kit_colour',''),coalesce((x->>'copy_private_profile')::boolean,true),nullif(x->>'fixture_note',''),coalesce(x->'preferences','[]'::jsonb),nullif(x->>'source_fixture_note',''),coalesce(x->'source_preferences','[]'::jsonb) from jsonb_array_elements(p_teams)x;
  perform private.assert_season_draft_valid(p_draft_id);
  return v_version;
end $$;

create or replace function public.validate_season_draft(p_draft_id uuid,p_expected_version integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_version integer; v_report jsonb;
begin
 if not private.is_admin() then raise exception 'Administrator access is required'; end if;
 perform private.assert_season_draft_valid(p_draft_id);
 update public.season_drafts d set status='validated',version=d.version+1 where d.id=p_draft_id and d.version=p_expected_version returning d.version into v_version;
 if v_version is null then raise exception using errcode='40001',message='Stale season draft: changed since the editor loaded it'; end if;
 select jsonb_build_object('valid',true,'version',v_version,'competitions',count(distinct c.id),'teams',count(t.id),'preferences',coalesce(sum(jsonb_array_length(case when t.copy_private_profile then t.preferences else '[]'::jsonb end)),0),'notes',count(t.fixture_note) filter(where t.copy_private_profile)) into v_report from public.season_draft_competitions c left join public.season_draft_teams t on t.draft_competition_id=c.id and t.selected where c.season_draft_id=p_draft_id and c.retained;
 return v_report;
end $$;

create or replace function public.abandon_season_draft(p_draft_id uuid,p_expected_version integer) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator access is required'; end if;
 update public.season_drafts d set status='abandoned',version=d.version+1 where d.id=p_draft_id and d.version=p_expected_version and d.status in ('draft','validated');
 if not found then raise exception using errcode='40001',message='Stale or unavailable season draft'; end if;
 return true;
end $$;

create or replace function public.activate_season_draft(p_draft_id uuid,p_expected_version integer,p_confirmation text)
returns table(season_id uuid,competition_count integer,team_count integer) language plpgsql security definer set search_path='' as $$
declare v_draft public.season_drafts%rowtype; v_season uuid; v_competitions integer:=0; v_teams integer:=0; v_c record; v_competition_id uuid; v_cs uuid; v_team record; v_new_team uuid; v_pref jsonb;
begin
 if not private.is_admin() then raise exception 'Administrator access is required'; end if;
 if p_confirmation<>'ACTIVATE' then raise exception 'Explicit activation confirmation is required'; end if;
 select d.* into v_draft from public.season_drafts d where d.id=p_draft_id and d.version=p_expected_version and d.status='validated' for update;
 if not found then raise exception using errcode='40001',message='Stale or unvalidated season draft'; end if;
 perform private.assert_season_draft_valid(p_draft_id);
 insert into public.seasons(name,starts_on,ends_on) values(v_draft.name,v_draft.starts_on,v_draft.ends_on) returning id into v_season;
 for v_c in select c.* from public.season_draft_competitions c where c.season_draft_id=p_draft_id and c.retained order by c.weekday,c.division loop
   insert into public.competitions(category_id,location_id,weekday,division,name) values(v_c.category_id,v_c.location_id,v_c.weekday,v_c.division,v_c.name)
   on conflict on constraint competitions_category_id_location_id_weekday_division_key do nothing;
   select c.id into v_competition_id from public.competitions c where c.category_id=v_c.category_id and c.location_id=v_c.location_id and c.weekday=v_c.weekday and c.division=v_c.division;
   update public.competition_seasons cs set lifecycle='archived' where cs.competition_id=v_competition_id and cs.lifecycle='active';
   insert into public.competition_seasons(competition_id,season_id,lifecycle,publication_state) values(v_competition_id,v_season,'active','published') returning id into v_cs;
   v_competitions:=v_competitions+1;
   for v_team in select t.* from public.season_draft_teams t where t.draft_competition_id=v_c.id and t.selected loop
     insert into public.teams(competition_season_id,name,status,standings_eligible,kit_colour) values(v_cs,v_team.name,v_team.status,v_team.standings_eligible,v_team.kit_colour) returning id into v_new_team;
     if v_team.copy_private_profile then
       if nullif(btrim(v_team.fixture_note),'') is not null then insert into public.team_fixture_notes(team_id,notes) values(v_new_team,btrim(v_team.fixture_note)); end if;
       for v_pref in select value from jsonb_array_elements(v_team.preferences) loop insert into public.team_kickoff_preferences(team_id,kickoff_time,classification) values(v_new_team,(v_pref->>'kickoff_time')::time,v_pref->>'classification'); end loop;
     end if;
     v_teams:=v_teams+1;
   end loop;
 end loop;
 update public.season_drafts d set status='activated',activated_season_id=v_season,activated_at=now(),version=d.version+1 where d.id=p_draft_id;
 return query select v_season,v_competitions,v_teams;
end $$;

revoke all on public.season_drafts,public.season_draft_competitions,public.season_draft_teams from public,anon;
grant select,insert,update,delete on public.season_drafts,public.season_draft_competitions,public.season_draft_teams to authenticated;
revoke all on function public.create_season_draft(text,date,date,uuid),public.save_season_draft(uuid,integer,text,date,date,jsonb,jsonb),public.validate_season_draft(uuid,integer),public.abandon_season_draft(uuid,integer),public.activate_season_draft(uuid,integer,text) from public,anon;
grant execute on function public.create_season_draft(text,date,date,uuid),public.save_season_draft(uuid,integer,text,date,date,jsonb,jsonb),public.validate_season_draft(uuid,integer),public.abandon_season_draft(uuid,integer),public.activate_season_draft(uuid,integer,text) to authenticated;

commit;
