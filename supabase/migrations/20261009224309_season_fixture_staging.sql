-- Local review preparation. Apply only through a separately authorised migration release.
begin;
alter table public.season_draft_teams alter column source_team_id drop not null;
alter table public.season_draft_teams add column readable_id text;
alter table public.season_draft_teams add column availability_confirmed boolean not null default false;
alter table public.season_draft_competitions add column venue_confirmed boolean not null default false;
alter table public.season_draft_competitions add column fixture_rules jsonb;
alter table public.season_drafts add column staged_season_id uuid references public.seasons(id) on delete restrict;
alter table public.season_drafts add column validated_fixture_versions jsonb;
create unique index season_draft_readable_id_unique on public.season_draft_teams(draft_competition_id,readable_id) where selected and readable_id is not null;
create or replace function private.assert_season_draft_valid(p_draft_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare v_draft public.season_drafts%rowtype; v_invalid integer;
begin
  select d.* into v_draft from public.season_drafts d where d.id=p_draft_id for update;
  if not found then raise exception 'Season draft not found'; end if;
  if v_draft.status not in ('draft','validated') then raise exception 'Season draft is not editable'; end if;
  if length(btrim(v_draft.name))=0 or v_draft.ends_on<=v_draft.starts_on then raise exception 'Season metadata is invalid'; end if;
  if exists(select 1 from public.seasons s where lower(btrim(s.name))=lower(btrim(v_draft.name)) and s.id is distinct from v_draft.staged_season_id) then raise exception 'Season name already exists'; end if;
  if not exists(select 1 from public.season_draft_competitions c where c.season_draft_id=p_draft_id and c.retained) then raise exception 'At least one competition is required'; end if;
  select count(*) into v_invalid from public.season_draft_teams t where t.season_draft_id=p_draft_id and t.selected and (length(btrim(t.name))=0 or jsonb_typeof(t.preferences)<>'array');
  if v_invalid>0 then raise exception 'A selected team profile is invalid'; end if;
  if exists(select 1 from public.season_draft_teams t join public.season_draft_competitions c on c.id=t.draft_competition_id where t.season_draft_id=p_draft_id and c.season_draft_id<>p_draft_id) then raise exception 'Cross-draft team destination'; end if;
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

create or replace function public.save_season_draft(p_draft_id uuid,p_expected_version integer,p_name text,p_starts_on date,p_ends_on date,p_competitions jsonb,p_teams jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare v_version integer;
begin
  if not private.is_admin() then raise exception 'Administrator access is required'; end if;
  if exists(select 1 from public.season_drafts where id=p_draft_id and staged_season_id is not null) then raise exception 'Staged season structure is frozen; fixture plans remain editable'; end if;
  update public.season_drafts d set name=btrim(p_name),starts_on=p_starts_on,ends_on=p_ends_on,status='draft',version=d.version+1 where d.id=p_draft_id and d.version=p_expected_version and d.status in ('draft','validated') returning d.version into v_version;
  if v_version is null then raise exception using errcode='40001',message='Stale season draft: changed since the editor loaded it'; end if;
  delete from public.season_draft_teams t where t.season_draft_id=p_draft_id;
  delete from public.season_draft_competitions c where c.season_draft_id=p_draft_id;
  insert into public.season_draft_competitions(id,season_draft_id,source_competition_season_id,category_id,location_id,weekday,division,name,retained,venue_confirmed)
  select (x->>'id')::uuid,p_draft_id,nullif(x->>'source_competition_season_id','')::uuid,(x->>'category_id')::uuid,(x->>'location_id')::uuid,(x->>'weekday')::smallint,btrim(x->>'division'),btrim(x->>'name'),coalesce((x->>'retained')::boolean,true),coalesce((x->>'venue_confirmed')::boolean,false) from jsonb_array_elements(p_competitions)x;
  insert into public.season_draft_teams(id,season_draft_id,draft_competition_id,source_team_id,selected,name,status,standings_eligible,kit_colour,copy_private_profile,fixture_note,preferences,source_fixture_note,source_preferences,readable_id,availability_confirmed)
  select (x->>'id')::uuid,p_draft_id,(x->>'draft_competition_id')::uuid,(x->>'source_team_id')::uuid,coalesce((x->>'selected')::boolean,true),btrim(x->>'name'),coalesce(x->>'status','active'),coalesce((x->>'standings_eligible')::boolean,true),nullif(x->>'kit_colour',''),coalesce((x->>'copy_private_profile')::boolean,true),nullif(x->>'fixture_note',''),coalesce(x->'preferences','[]'::jsonb),nullif(x->>'source_fixture_note',''),coalesce(x->'source_preferences','[]'::jsonb),nullif(btrim(x->>'readable_id'),''),coalesce((x->>'availability_confirmed')::boolean,false) from jsonb_array_elements(p_teams)x;
  perform private.assert_season_draft_valid(p_draft_id);
  return v_version;
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
  insert into public.season_draft_teams(season_draft_id,draft_competition_id,source_team_id,name,status,standings_eligible,kit_colour,fixture_note,preferences,source_fixture_note,source_preferences,readable_id)
  select v_id,dc.id,t.id,t.name,'active',t.standings_eligible,t.kit_colour,n.notes,
    coalesce(pref.preferences,'[]'::jsonb),n.notes,coalesce(pref.preferences,'[]'::jsonb),t.legacy_id
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


-- Recheck and lock copied source profiles at staging, validation and activation.
-- Parent locks serialize the normal team-profile RPC and new FK-linked profile rows;
-- child locks also protect existing note/preference rows from direct concurrent edits.
-- Organiser correction, 10 October 2026: accidental Monday King ADL preference.
-- Exact accidental record and stale source snapshots only; future preferences remain editable.
create function private.assert_king_adl_preference_corrected(p_source uuid,p_source_preferences jsonb) returns void
language plpgsql security definer set search_path='' as $$
begin
 if p_source='04ebec43-f537-52b4-bbae-ffe3449b7826'::uuid and (
  exists(select 1 from public.team_kickoff_preferences p where p.team_id=p_source and p.id='a04c3160-7c38-4dd9-b0d2-73bb4d73f649'::uuid)
  or coalesce(p_source_preferences,'[]'::jsonb) is distinct from coalesce((select jsonb_agg(jsonb_build_object('kickoff_time',to_char(p.kickoff_time,'HH24:MI'),'classification',p.classification) order by p.kickoff_time) from public.team_kickoff_preferences p where p.team_id=p_source),'[]'::jsonb)) then
  raise exception 'Monday King ADL accidental 19:00 preference must be corrected before copying or validating this season';
 end if;
end $$;
revoke all on function private.assert_king_adl_preference_corrected(uuid,jsonb) from public,anon,authenticated;
create function private.guard_king_adl_draft_preference() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 perform private.assert_king_adl_preference_corrected(new.source_team_id,new.source_preferences);
 return new;
end $$;
revoke all on function private.guard_king_adl_draft_preference() from public,anon,authenticated;
create trigger guard_king_adl_draft_preference before insert or update on public.season_draft_teams
for each row execute function private.guard_king_adl_draft_preference();

create function private.assert_season_source_profiles_current(p_draft_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.teams t join public.season_draft_teams dt on dt.source_team_id=t.id where dt.season_draft_id=p_draft_id and dt.selected order by t.id for update of t;
 perform private.assert_king_adl_preference_corrected(dt.source_team_id,dt.source_preferences) from public.season_draft_teams dt where dt.season_draft_id=p_draft_id and dt.selected;
 perform 1 from public.team_fixture_notes n join public.season_draft_teams dt on dt.source_team_id=n.team_id where dt.season_draft_id=p_draft_id and dt.selected order by n.team_id for share of n;
 perform 1 from public.team_kickoff_preferences p join public.season_draft_teams dt on dt.source_team_id=p.team_id where dt.season_draft_id=p_draft_id and dt.selected order by p.team_id,p.kickoff_time for share of p;
 if exists(select 1 from public.season_draft_teams dt left join public.team_fixture_notes sn on sn.team_id=dt.source_team_id where dt.season_draft_id=p_draft_id and dt.selected and dt.source_team_id is not null and (coalesce(dt.source_fixture_note,'')<>coalesce(sn.notes,'') or dt.source_preferences is distinct from coalesce((select jsonb_agg(jsonb_build_object('kickoff_time',to_char(sp.kickoff_time,'HH24:MI'),'classification',sp.classification) order by sp.kickoff_time) from public.team_kickoff_preferences sp where sp.team_id=dt.source_team_id),'[]'::jsonb))) then raise exception 'Source availability profile changed; recreate or reload the draft and review current information'; end if;
end $$;
revoke all on function private.assert_season_source_profiles_current(uuid) from public,anon,authenticated;

create function public.stage_season_draft(p_draft_id uuid,p_expected_version integer) returns uuid
language plpgsql security definer set search_path='' as $$
declare d public.season_drafts%rowtype; v_comp record; v_team record; season_id uuid; competition_id uuid; pref jsonb;
begin
 if not private.is_admin() then raise exception 'Administrator access is required'; end if;
 select * into d from public.season_drafts where id=p_draft_id for update;
 if d.version is distinct from p_expected_version or d.status<>'validated' then raise exception using errcode='40001',message='Stale or unvalidated season draft'; end if;
 if d.staged_season_id is not null then return d.staged_season_id; end if;
 perform private.assert_season_draft_valid(d.id);
 perform private.assert_season_source_profiles_current(d.id);
 if exists(select 1 from public.season_draft_competitions where season_draft_id=d.id and retained and not venue_confirmed and not(location_id='ce7becb1-0bbc-5cb4-8aa9-d708aaeaebce'::uuid and weekday in(1,3)))
 or exists(select 1 from public.season_draft_teams where season_draft_id=d.id and selected and not availability_confirmed) then raise exception 'Confirm every availability profile and venue calendar before staging'; end if;
 if exists(select 1 from public.season_draft_competitions c where c.season_draft_id=d.id and c.retained and (select count(*) from public.season_draft_teams t where t.draft_competition_id=c.id and t.selected and t.status='active')<2) then raise exception 'Each competition needs at least two active teams'; end if;
 if exists(select 1 from public.season_draft_competitions dc where dc.season_draft_id=d.id and dc.retained and (dc.weekday not in(1,3) or (select count(*) from public.season_draft_teams dt where dt.draft_competition_id=dc.id and dt.selected)%2<>0 or (select count(*) from public.season_draft_teams dt where dt.draft_competition_id=dc.id and dt.selected)>16)) then raise exception 'Staging supports Monday/Wednesday even rosters up to sixteen teams'; end if;

 if exists(select 1 from public.season_draft_teams where season_draft_id=d.id and selected and (status<>'active' or readable_id is null or readable_id !~ '^(mon|wed)-[a-z0-9-]+$')) then raise exception 'Selected teams need active status and explicit readable IDs'; end if;
 insert into public.seasons(name,starts_on,ends_on) values(d.name,d.starts_on,d.ends_on) returning id into season_id;
 for v_comp in select * from public.season_draft_competitions where season_draft_id=d.id and retained order by weekday,division,id loop
  insert into public.competitions(category_id,location_id,weekday,division,name) values(v_comp.category_id,v_comp.location_id,v_comp.weekday,v_comp.division,v_comp.name) on conflict(category_id,location_id,weekday,division) do nothing;
  select id into competition_id from public.competitions pc where pc.category_id=v_comp.category_id and pc.location_id=v_comp.location_id and pc.weekday=v_comp.weekday and pc.division=v_comp.division;
  insert into public.competition_seasons(id,competition_id,season_id,lifecycle,publication_state) values(v_comp.id,competition_id,season_id,'planned','draft');
  for v_team in select * from public.season_draft_teams where draft_competition_id=v_comp.id and selected loop
   if v_team.readable_id not like (case v_comp.weekday when 1 then 'mon-%' when 3 then 'wed-%' else '' end) then raise exception 'Readable ID must match competition night'; end if;
   insert into public.teams(id,competition_season_id,legacy_id,name,status,standings_eligible,kit_colour) values(v_team.id,v_comp.id,v_team.readable_id,v_team.name,v_team.status,v_team.standings_eligible,v_team.kit_colour);
   if v_team.copy_private_profile then
    if nullif(btrim(v_team.fixture_note),'') is not null then insert into public.team_fixture_notes(team_id,notes) values(v_team.id,btrim(v_team.fixture_note)); end if;
    for pref in select value from jsonb_array_elements(v_team.preferences) loop insert into public.team_kickoff_preferences(team_id,kickoff_time,classification) values(v_team.id,(pref->>'kickoff_time')::time,pref->>'classification'); end loop;
   end if;
  end loop;
 end loop;
 update public.season_drafts set staged_season_id=season_id,status='draft',version=version+1 where id=d.id;
 return season_id;
end $$;

-- Reuse existing item/venue/staleness checks; add complete-season rules for staged editions.
alter function private.fixture_change_report(uuid) rename to fixture_change_report_before_staging;
create function private.fixture_change_report(p_change_set_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare report jsonb; rules jsonb; edition uuid; n integer; rounds integer; problem boolean; message jsonb; messages jsonb:='[]'::jsonb;
begin
 report:=private.fixture_change_report_before_staging(p_change_set_id);
 select competition_season_id into edition from public.fixture_change_sets where id=p_change_set_id;
 select fixture_rules into rules from public.season_draft_competitions where id=edition;
 if not exists(select 1 from public.competition_seasons where id=edition and lifecycle='planned') then return report; end if;
 -- A rules document is mandatory: unconfigured plans cannot be published by bypassing the UI.
 if rules is null then return jsonb_build_object('messages',report->'messages'||jsonb_build_array(private.fixture_change_message('blocking','season_rules_missing',null,null,null,'Import a complete season schedule with its reviewed constraints'))); end if;
 n:=jsonb_array_length(rules->'roster'); rounds:=jsonb_array_length(rules->'dates');
 -- Standing bookings do not override the organiser's new-season calendar exceptions.
 if exists(select 1 from public.fixture_change_items i join public.competition_seasons cs on cs.id=edition join public.competitions c on c.id=cs.competition_id where i.change_set_id=p_change_set_id and c.location_id='ce7becb1-0bbc-5cb4-8aa9-d708aaeaebce'::uuid and (i.proposed_match_date in('2026-10-28','2027-03-08','2027-03-29') or (i.proposed_match_date>'2026-12-23' and i.proposed_match_date<'2027-01-11'))) then
  messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_calendar_exception',null,null,null,'Standing venue booking excludes closure, Christmas break, Labour Day and Easter Monday')); end if;
 for message in select value from jsonb_array_elements(report->'messages') loop
  if message->>'code'='required_time' then
   -- Only an explicitly recorded opponent/time exception can override a required profile.
   if exists(select 1 from public.fixture_change_items i join public.teams t on t.id=(message->>'teamId')::uuid
     join public.teams opponent on opponent.id=case when i.proposed_home_team_id=t.id then i.proposed_away_team_id else i.proposed_home_team_id end
     cross join lateral jsonb_array_elements(rules->'exceptions') e
     where i.id=(message->>'itemId')::uuid and e->>'team'=t.legacy_id and e->>'opponent'=opponent.legacy_id and e->>'time'=to_char(i.proposed_kickoff_time,'HH24:MI')) then continue; end if;
   message:=jsonb_set(message,'{severity}','"blocking"');
  end if;
  messages:=messages||jsonb_build_array(message);
 end loop;
 select count(*)<>rounds*n/2 or bool_or(operation<>'create') into problem from public.fixture_change_items where change_set_id=p_change_set_id;
 if problem or n<2 or n%2<>0 or rounds<1 or rounds%2<>0 then messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_size',null,null,null,'Complete even-team season required with the configured number of rounds')); end if;
 if exists(select 1 from public.fixture_change_items i join public.competition_seasons cs on cs.id=edition join public.competitions c on c.id=cs.competition_id join public.seasons s on s.id=cs.season_id
  where i.change_set_id=p_change_set_id and (i.proposed_round_number<1 or i.proposed_round_number>rounds or i.proposed_match_date::text is distinct from rules->'dates'->>(i.proposed_round_number-1) or extract(isodow from i.proposed_match_date)<>c.weekday or i.proposed_match_date<s.starts_on or i.proposed_match_date>s.ends_on or i.proposed_court not in(1,2) or i.proposed_kickoff_time not in('19:00','19:40','20:20','21:00'))) then
  messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_calendar',null,null,null,'Round dates, weekday, season window or court/time slots differ from the reviewed calendar')); end if;
 if exists(select 1 from generate_series(1,rounds) r cross join public.teams t where t.competition_season_id=edition and (select count(*) from public.fixture_change_items i where i.change_set_id=p_change_set_id and i.proposed_round_number=r and t.id in(i.proposed_home_team_id,i.proposed_away_team_id))<>1) then
  messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_round',null,null,null,'Every team must play exactly once in every round')); end if;
 if exists(select 1 from public.teams t where t.competition_season_id=edition and ((select count(*) from public.fixture_change_items i where i.change_set_id=p_change_set_id and i.proposed_home_team_id=t.id)<>rounds/2 or (select count(*) from public.fixture_change_items i where i.change_set_id=p_change_set_id and i.proposed_away_team_id=t.id)<>rounds/2)) then
  messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_home_away',null,null,null,'Home and away totals must be equal')); end if;
 if exists(select 1 from jsonb_array_elements(rules->'pairs') p where (select count(*) from public.fixture_change_items i join public.teams h on h.id=i.proposed_home_team_id join public.teams a on a.id=i.proposed_away_team_id where i.change_set_id=p_change_set_id and least(h.legacy_id,a.legacy_id)=least(p->>'a',p->>'b') and greatest(h.legacy_id,a.legacy_id)=greatest(p->>'a',p->>'b'))<>(p->>'count')::integer) then
  messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_opponents',null,null,null,'Opponent counts differ from the approved matrix')); end if;
 if exists(select 1 from public.fixture_change_items i join public.teams t on t.id in(i.proposed_home_team_id,i.proposed_away_team_id) join public.teams opponent on opponent.id=case when t.id=i.proposed_home_team_id then i.proposed_away_team_id else i.proposed_home_team_id end where i.change_set_id=p_change_set_id
  and not (rules->'allowedKickoffs'->t.legacy_id ? to_char(i.proposed_kickoff_time,'HH24:MI'))
  and not exists(select 1 from jsonb_array_elements(rules->'exceptions') e where e->>'team'=t.legacy_id and e->>'opponent'=opponent.legacy_id and e->>'time'=to_char(i.proposed_kickoff_time,'HH24:MI'))) then
  messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_availability',null,null,null,'Hard availability is not met')); end if;
 if exists(select 1 from jsonb_array_elements(rules->'sharedPlayers') pair join public.teams ta on ta.competition_season_id=edition and ta.legacy_id=pair->>0 join public.teams tb on tb.competition_season_id=edition and tb.legacy_id=pair->>1 join public.fixture_change_items a on a.change_set_id=p_change_set_id and ta.id in(a.proposed_home_team_id,a.proposed_away_team_id) join public.fixture_change_items b on b.change_set_id=p_change_set_id and tb.id in(b.proposed_home_team_id,b.proposed_away_team_id) where a.id<>b.id and a.proposed_match_date=b.proposed_match_date and a.proposed_kickoff_time=b.proposed_kickoff_time) then
  messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_shared_players',null,null,null,'Shared-player teams cannot kick off simultaneously')); end if;
 if exists(select 1 from (select i.proposed_round_number-lag(i.proposed_round_number) over(partition by least(i.proposed_home_team_id,i.proposed_away_team_id),greatest(i.proposed_home_team_id,i.proposed_away_team_id) order by i.proposed_round_number) gap from public.fixture_change_items i where i.change_set_id=p_change_set_id) gaps where gap<(rules->>'minimumRepeatGap')::integer) then
  messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_repeat_gap',null,null,null,'Repeat meetings are too close')); end if;
 if exists(select 1 from (select team,home, count(*) streak from (select team,home,row_number() over(partition by team order by round)-row_number() over(partition by team,home order by round) grp from (select proposed_home_team_id team,true home,proposed_round_number round from public.fixture_change_items where change_set_id=p_change_set_id union all select proposed_away_team_id,false,proposed_round_number from public.fixture_change_items where change_set_id=p_change_set_id) sides) runs group by team,home,grp) streaks where streak>(rules->>'maximumHomeAwayRun')::integer) then
  messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_home_away_run',null,null,null,'Consecutive home/away streak exceeds the reviewed limit')); end if;
 if exists(select 1 from generate_series(1,rounds) r where (select count(*) from public.fixture_change_items where change_set_id=p_change_set_id and proposed_round_number=r and proposed_kickoff_time='21:00')<>greatest(0,n/2-6)) then
  messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_late_slots',null,null,null,'Use the minimum necessary late slots')); end if;
 if exists(select 1 from public.fixture_change_items i where i.change_set_id=p_change_set_id group by least(i.proposed_home_team_id,i.proposed_away_team_id),greatest(i.proposed_home_team_id,i.proposed_away_team_id) having count(*)=2 and (count(distinct i.proposed_home_team_id)<>2 or count(*) filter(where i.proposed_round_number<=rounds/2)<>1)) then
  messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_pair_homes',null,null,null,'Double meetings need opposite homes and one meeting in each half')); end if;
 if exists(select 1 from jsonb_array_elements(rules->'weekOnePairs') pair where not exists(select 1 from public.fixture_change_items i join public.teams h on h.id=i.proposed_home_team_id join public.teams a on a.id=i.proposed_away_team_id where i.change_set_id=p_change_set_id and i.proposed_round_number=1 and least(h.legacy_id,a.legacy_id)=least(pair->>0,pair->>1) and greatest(h.legacy_id,a.legacy_id)=greatest(pair->>0,pair->>1))) then
  messages:=messages||jsonb_build_array(private.fixture_change_message('blocking','season_week_one',null,null,null,'Required Week 1 pairing is missing')); end if;
 return jsonb_build_object('messages',messages);
end $$;

create function public.import_season_schedule(p_draft_id uuid,p_expected_version integer,p_competition_id uuid,p_schedule jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare d public.season_drafts%rowtype; c public.season_draft_competitions%rowtype; plan uuid; rules jsonb; items jsonb; report jsonb;
begin
 if not private.is_admin() then raise exception 'Administrator access is required'; end if;
 -- Match activation/publisher lock ordering: venue, edition, draft, plan.
 perform 1 from public.locations l join public.competitions pc on pc.location_id=l.id join public.competition_seasons cs on cs.competition_id=pc.id where cs.id=p_competition_id for update of l;
 perform 1 from public.competition_seasons cs where cs.id=p_competition_id for update;
 select * into d from public.season_drafts where id=p_draft_id for update;
 if d.version is distinct from p_expected_version or d.staged_season_id is null or d.status not in('draft','validated') then raise exception using errcode='40001',message='Stale or unstaged season draft'; end if;
 select * into c from public.season_draft_competitions where id=p_competition_id and season_draft_id=d.id and retained for update;
 if not found then raise exception 'Invalid draft competition'; end if;
 if p_schedule->>'publication' is distinct from 'local-review-only' or p_schedule->>'night' is distinct from (case c.weekday when 1 then 'monday' when 3 then 'wednesday' end) then raise exception 'Schedule night or review format mismatch'; end if;
 rules:=p_schedule->'constraints';
 if jsonb_typeof(rules) is distinct from 'object' or jsonb_typeof(rules->'roster') is distinct from 'array' or jsonb_typeof(rules->'dates') is distinct from 'array' or jsonb_typeof(rules->'pairs') is distinct from 'array' or jsonb_typeof(rules->'allowedKickoffs') is distinct from 'object'
 or jsonb_typeof(rules->'exceptions') is distinct from 'array' or jsonb_typeof(rules->'sharedPlayers') is distinct from 'array' or jsonb_typeof(rules->'weekOnePairs') is distinct from 'array' or (rules->>'minimumRepeatGap')::integer is distinct from 4 or (rules->>'maximumHomeAwayRun')::integer is distinct from 3 then raise exception 'Complete reviewed schedule constraints required'; end if;
 if (select array_agg(value order by value) from jsonb_array_elements_text(rules->'roster')) is distinct from (select array_agg(legacy_id order by legacy_id) from public.teams where competition_season_id=c.id) then raise exception 'Schedule roster does not match staged identities'; end if;
 if jsonb_array_length(rules->'pairs')<>jsonb_array_length(rules->'roster')*(jsonb_array_length(rules->'roster')-1)/2 or exists(select 1 from jsonb_array_elements(rules->'pairs') p where p->>'a'=p->>'b' or not rules->'roster' ? (p->>'a') or not rules->'roster' ? (p->>'b') or (p->>'count')::integer not between 0 and 3) or (select count(distinct least(p->>'a',p->>'b')||'|'||greatest(p->>'a',p->>'b')) from jsonb_array_elements(rules->'pairs') p)<>jsonb_array_length(rules->'pairs') then raise exception 'Opponent matrix must cover every pair exactly once'; end if;
 if exists(select 1 from jsonb_array_elements_text(rules->'roster') t where jsonb_typeof(rules->'allowedKickoffs'->t) is distinct from 'array') then raise exception 'Each team needs explicit availability'; end if;
 if exists(select 1 from public.fixture_change_sets where competition_season_id=c.id and status<>'cancelled') then raise exception 'Cancel the existing plan before importing a replacement'; end if;
 update public.season_draft_competitions set fixture_rules=rules where id=c.id;
 select jsonb_agg(jsonb_build_object('operation','create','reason','Reviewed new-season draft','proposed',jsonb_build_object('roundNumber',(x->>'round')::integer,'date',x->>'date','kickoffTime',x->>'time','court',(x->>'court')::integer,'homeTeamId',h.id,'awayTeamId',a.id,'publicationState','published')) order by (x->>'round')::integer,x->>'time',(x->>'court')::integer) into items from jsonb_array_elements(p_schedule->'fixtures') x left join public.teams h on h.competition_season_id=c.id and h.legacy_id=x->>'home' left join public.teams a on a.competition_season_id=c.id and a.legacy_id=x->>'away';
 plan:=public.create_fixture_change_set(c.id,'New season - '||c.name,'json_upload','Local draft imported for private review');
 perform public.replace_fixture_change_items(plan,1,items);
 report:=private.fixture_change_report(plan);
 if private.fixture_report_has(report,'blocking') then raise exception 'Blocking season schedule validation: %',report; end if;
 update public.fixture_change_sets set validation_report=report where id=plan;
 update public.season_drafts set status='draft',version=version+1 where id=d.id;
 return plan;
end $$;

create function private.assert_staged_season_reviewed(p_draft_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare c record; plan public.fixture_change_sets%rowtype; report jsonb;
begin
 for c in select * from public.season_draft_competitions where season_draft_id=p_draft_id and retained order by id loop
  if (select count(*) from public.fixture_change_sets where competition_season_id=c.id and status<>'cancelled')<>1 then raise exception 'Exactly one complete reviewed fixture plan is required per competition'; end if;
  select * into plan from public.fixture_change_sets where competition_season_id=c.id and status<>'cancelled' for update;
  if plan.status<>'pending_review' then raise exception 'All fixture plans must be pending review'; end if;
  report:=private.fixture_change_report(plan.id);
  if private.fixture_report_has(report,'blocking') or report is distinct from plan.validation_report then raise exception 'Fixture validation changed; return the plan to draft and review again'; end if;
  if private.fixture_report_has(report,'warning') and plan.warnings_acknowledged_at is null then raise exception 'Acknowledge all fixture warnings'; end if;
 end loop;
end $$;
create or replace function public.validate_season_draft(p_draft_id uuid,p_expected_version integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_version integer; v_report jsonb;
begin
 if not private.is_admin() then raise exception 'Administrator access is required'; end if;
 perform private.assert_season_draft_valid(p_draft_id);
 perform private.assert_season_source_profiles_current(p_draft_id);
 if exists(select 1 from public.season_drafts where id=p_draft_id and staged_season_id is not null) then perform private.assert_staged_season_reviewed(p_draft_id); end if;
 update public.season_drafts d set status='validated',validated_fixture_versions=(select jsonb_object_agg(s.id::text,s.version) from public.fixture_change_sets s join public.season_draft_competitions c on c.id=s.competition_season_id where c.season_draft_id=p_draft_id and c.retained and s.status='pending_review'),version=d.version+1 where d.id=p_draft_id and d.version=p_expected_version returning d.version into v_version;
 if v_version is null then raise exception using errcode='40001',message='Stale season draft: changed since the editor loaded it'; end if;
 select jsonb_build_object('valid',true,'version',v_version,'competitions',count(distinct c.id),'teams',count(t.id),'preferences',coalesce(sum(jsonb_array_length(case when t.copy_private_profile then t.preferences else '[]'::jsonb end)),0),'notes',count(t.fixture_note) filter(where t.copy_private_profile)) into v_report from public.season_draft_competitions c left join public.season_draft_teams t on t.draft_competition_id=c.id and t.selected where c.season_draft_id=p_draft_id and c.retained;
 return v_report;
end $$;


create or replace function public.abandon_season_draft(p_draft_id uuid,p_expected_version integer) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator access is required'; end if;
 update public.season_drafts d set status='abandoned',version=d.version+1 where d.id=p_draft_id and d.version=p_expected_version and d.status in ('draft','validated') and d.staged_season_id is null;
 if not found then raise exception using errcode='40001',message='Stale, staged or unavailable season draft'; end if;
 return true;
end $$;


-- Planned editions cannot publish through the ordinary fixture RPC.
create function private.guard_staged_fixture_publication() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.publication_state='published' and exists(select 1 from public.competition_seasons where id=new.competition_season_id and lifecycle='planned')
 and not exists(select 1 from public.season_draft_competitions c join public.season_drafts d on d.id=c.season_draft_id where c.id=new.competition_season_id and d.id::text=current_setting('fis.season_activation',true)) then raise exception 'Planned fixtures publish only during reviewed season activation'; end if;
 return new;
end $$;
create trigger guard_staged_fixture_publication before insert or update on public.fixtures for each row execute function private.guard_staged_fixture_publication();

create or replace function public.activate_season_draft(p_draft_id uuid,p_expected_version integer,p_confirmation text)
returns table(season_id uuid,competition_count integer,team_count integer) language plpgsql security definer set search_path='' as $$
declare d public.season_drafts%rowtype; v_comp record; plan record;
begin
 if not private.is_admin() then raise exception 'Administrator access is required'; end if;
 if p_confirmation is distinct from 'ACTIVATE' then raise exception 'Explicit activation confirmation is required'; end if;
 -- Lock venue first, then editions and plans, matching the fixture publisher's ordering.
 perform 1 from public.locations l where l.id in(select location_id from public.season_draft_competitions where season_draft_id=p_draft_id and retained) order by l.id for update;
 perform 1 from public.competition_seasons cs where cs.id in(select id from public.season_draft_competitions where season_draft_id=p_draft_id and retained) order by cs.id for update;
 select * into d from public.season_drafts where id=p_draft_id for update;
 if d.version is distinct from p_expected_version or d.status<>'validated' or d.staged_season_id is null then raise exception using errcode='40001',message='Stale, unstaged or unvalidated season draft'; end if;
 perform private.assert_season_draft_valid(d.id);
 perform private.assert_season_source_profiles_current(d.id);
 if exists(select 1 from public.competition_seasons cs where cs.season_id=d.staged_season_id and (cs.lifecycle<>'planned' or cs.publication_state<>'draft')) then raise exception 'Staged hierarchy changed'; end if;
 perform private.assert_staged_season_reviewed(d.id);
 if d.validated_fixture_versions is distinct from (select jsonb_object_agg(s.id::text,s.version) from public.fixture_change_sets s join public.season_draft_competitions c on c.id=s.competition_season_id where c.season_draft_id=d.id and c.retained and s.status='pending_review') then raise exception 'Fixture review changed; validate the persisted season again'; end if;
 perform set_config('fis.season_activation',d.id::text,true);
 -- Publish inside unpublished editions first; any error rolls back all nights.
 for plan in select s.id,s.version from public.fixture_change_sets s join public.season_draft_competitions c on c.id=s.competition_season_id where c.season_draft_id=d.id and c.retained and s.status='pending_review' order by s.competition_season_id,s.id loop
  perform public.publish_fixture_change_set(plan.id,plan.version);
 end loop;
 for v_comp in select cs.id,cs.competition_id from public.competition_seasons cs where cs.season_id=d.staged_season_id order by cs.id loop
  update public.competition_seasons set lifecycle='archived' where competition_id=v_comp.competition_id and lifecycle='active';
  update public.competition_seasons set lifecycle='active',publication_state='published' where id=v_comp.id;
 end loop;
 update public.season_drafts set status='activated',activated_season_id=d.staged_season_id,activated_at=now(),version=version+1 where id=d.id;
 perform set_config('fis.season_activation','',true);
 return query select d.staged_season_id,(select count(*)::integer from public.competition_seasons cs where cs.season_id=d.staged_season_id),(select count(*)::integer from public.teams t join public.competition_seasons cs on cs.id=t.competition_season_id where cs.season_id=d.staged_season_id);
end $$;

create function private.guard_staged_season_structure() returns trigger
language plpgsql security definer set search_path='' as $$
declare parent uuid;
begin
 parent:=case when tg_op='INSERT' then new.season_draft_id else old.season_draft_id end;
 if exists(select 1 from public.season_drafts where id=parent and staged_season_id is not null) then
  if tg_table_name='season_draft_teams' or tg_op<>'UPDATE' or (to_jsonb(new)-'fixture_rules'-'updated_at') is distinct from (to_jsonb(old)-'fixture_rules'-'updated_at') then raise exception 'Staged season structure is frozen'; end if;
 end if;
 return case when tg_op='DELETE' then old else new end;
end $$;
create trigger guard_staged_draft_teams before insert or update or delete on public.season_draft_teams for each row execute function private.guard_staged_season_structure();
create trigger guard_staged_draft_competitions before insert or update or delete on public.season_draft_competitions for each row execute function private.guard_staged_season_structure();
revoke all on function private.assert_season_draft_valid(uuid),private.guard_staged_season_structure() from public,anon,authenticated;
create function private.guard_staged_season_header() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if old.staged_season_id is not null then
  if tg_op='DELETE' then raise exception 'Staged season cannot be deleted'; end if;
  if new.staged_season_id is distinct from old.staged_season_id or new.source_season_id is distinct from old.source_season_id or new.name<>old.name or new.starts_on<>old.starts_on or new.ends_on<>old.ends_on or new.created_by<>old.created_by or new.status='abandoned' then raise exception 'Staged season metadata is frozen'; end if;
 end if;
 return case when tg_op='DELETE' then old else new end;
end $$;
create trigger guard_staged_season_header before update or delete on public.season_drafts for each row execute function private.guard_staged_season_header();
revoke all on function private.guard_staged_season_header() from public,anon,authenticated;
-- No new public tables or policies: all new fields inherit existing admin-only RLS.
-- Hosted default privileges include operations that row policies do not govern.
-- Draft clients need DML only, never table-wide TRUNCATE or trigger/reference grants.
revoke truncate,references,trigger on public.season_drafts,public.season_draft_competitions,public.season_draft_teams from public,anon,authenticated;
revoke all on function public.stage_season_draft(uuid,integer),public.import_season_schedule(uuid,integer,uuid,jsonb) from public,anon;
grant execute on function public.stage_season_draft(uuid,integer),public.import_season_schedule(uuid,integer,uuid,jsonb) to authenticated;
revoke all on function private.fixture_change_report_before_staging(uuid),private.fixture_change_report(uuid),private.assert_staged_season_reviewed(uuid),private.guard_staged_fixture_publication() from public,anon,authenticated;
commit;
