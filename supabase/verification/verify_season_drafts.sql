begin;
select fis_fixture_test.assert_disposable();
create temporary table _fis_season_verification_bootstrap(id integer);
create function pg_temp.assert_true(value boolean,message text) returns void language plpgsql as $$begin if value is not true then raise exception 'Verification failed: %',message;end if;end$$;
do $$declare v_admin uuid;v_category uuid:='00000000-0000-4000-8000-00000000e901';v_location uuid:='00000000-0000-4000-8000-00000000e902';v_competition uuid:='00000000-0000-4000-8000-00000000e903';v_season uuid:='00000000-0000-4000-8000-00000000e904';v_cs uuid:='00000000-0000-4000-8000-00000000e905';v_team uuid:='00000000-0000-4000-8000-00000000e906';v_draft uuid;begin
 select m.disposable_admin_user_id into v_admin from fis_fixture_test.project_marker m where m.project_name='fis-fixture-test';
 perform pg_temp.assert_true(v_admin is not null,'enrolled disposable administrator is required');
 insert into public.categories(id,code,name)values(v_category,'verify-season','Verification Category');
 insert into public.locations(id,name)values(v_location,'Verification Venue');
 insert into public.competitions(id,category_id,location_id,weekday,division,name)values(v_competition,v_category,v_location,2,'V','Verification Night');
 insert into public.seasons(id,name,starts_on,ends_on)values(v_season,'Verification Source','2026-01-01','2026-03-01');
 insert into public.competition_seasons(id,competition_id,season_id,lifecycle,publication_state)values(v_cs,v_competition,v_season,'active','published');
 insert into public.teams(id,competition_season_id,name,kit_colour)values(v_team,v_cs,'Verification Team','#112233');
 insert into public.team_kickoff_preferences(team_id,kickoff_time,classification)values(v_team,'19:00','preferred');
 insert into public.team_fixture_notes(team_id,notes)values(v_team,'Verification private note');
 perform set_config('request.jwt.claim.sub',v_admin::text,true);perform set_config('request.jwt.claim.role','authenticated',true);set local role authenticated;
 select d.draft_id into v_draft from public.create_season_draft('Verification Target','2026-04-01','2026-06-01',v_season)d;
 reset role;
 perform pg_temp.assert_true((select count(*)=1 from public.season_drafts d where d.id=v_draft),'draft created');
 perform pg_temp.assert_true((select count(*)=1 from public.season_draft_teams t where t.season_draft_id=v_draft and t.source_team_id=v_team and t.kit_colour='#112233'),'new draft team profile copied');
 perform pg_temp.assert_true((select preferences->0->>'classification'='preferred' from public.season_draft_teams t where t.season_draft_id=v_draft),'preference strength copied');
 perform pg_temp.assert_true((select fixture_note='Verification private note' from public.season_draft_teams t where t.season_draft_id=v_draft),'private note copied');
 perform pg_temp.assert_true((select count(*)=0 from public.fixtures f where f.competition_season_id<>v_cs and f.home_team_id=v_team),'fixtures not copied');
end$$;
do $verify$
declare
  v_admin uuid;
  v_draft uuid;
  v_failure_draft uuid;
  v_source_fixture uuid := '00000000-0000-4000-8000-00000000e907';
  v_source_result uuid := '00000000-0000-4000-8000-00000000e908';
  v_source_adjustment uuid := '00000000-0000-4000-8000-00000000e909';
  v_target_season uuid;
  v_target_cs uuid;
  v_target_team uuid;
begin
  select m.disposable_admin_user_id into v_admin from fis_fixture_test.project_marker m where m.project_name='fis-fixture-test';
  select d.id into v_draft from public.season_drafts d where d.name='Verification Target';
  insert into public.teams(id,competition_season_id,name,status,standings_eligible,kit_colour) values('00000000-0000-4000-8000-00000000e90a','00000000-0000-4000-8000-00000000e905','Verification Opponent','inactive',true,'#445566');
  insert into public.fixtures(id,competition_season_id,legacy_id,round_number,match_date,kickoff_time,court,home_team_id,away_team_id,stage,publication_state)
  values(v_source_fixture,'00000000-0000-4000-8000-00000000e905','verify-season-fixture',1,'2026-02-01','19:00',1,'00000000-0000-4000-8000-00000000e906','00000000-0000-4000-8000-00000000e90a','knockout','published');
  insert into public.result_versions(id,fixture_id,revision,status,home_score,away_score) values(v_source_result,v_source_fixture,1,'published',1,0);
  insert into public.standing_adjustments(id,competition_season_id,team_id,legacy_id,points_delta,reason,publication_state) values(v_source_adjustment,'00000000-0000-4000-8000-00000000e905','00000000-0000-4000-8000-00000000e906','verify-season-adjustment',1,'Verification source adjustment','published');

  perform set_config('request.jwt.claim.sub','',true);
  begin perform public.activate_season_draft(v_draft,1,'ACTIVATE'); raise exception 'anonymous activation accepted'; exception when others then perform pg_temp.assert_true(sqlerrm like '%Administrator access%','anonymous caller is rejected'); end;
  perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-00000000efff',true);
  begin perform public.activate_season_draft(v_draft,1,'ACTIVATE'); raise exception 'non-admin activation accepted'; exception when others then perform pg_temp.assert_true(sqlerrm like '%Administrator access%','non-admin caller is rejected'); end;
  perform set_config('request.jwt.claim.sub',v_admin::text,true);

  select d.draft_id into v_failure_draft from public.create_season_draft('Verification Forced Failure','2026-07-01','2026-09-01','00000000-0000-4000-8000-00000000e904') d;
  update public.season_draft_competitions c set retained=false where c.season_draft_id=v_failure_draft;
  begin perform public.validate_season_draft(v_failure_draft,1); raise exception 'incomplete draft validated'; exception when others then perform pg_temp.assert_true(sqlerrm like '%At least one competition%','incomplete draft cannot validate'); end;
  update public.season_draft_competitions c set retained=true where c.season_draft_id=v_failure_draft;
  perform public.validate_season_draft(v_failure_draft,1);
  begin perform public.activate_season_draft(v_failure_draft,1,'ACTIVATE'); raise exception 'stale draft activated'; exception when serialization_failure then null; end;

  execute $ddl$create function pg_temp.reject_verification_team() returns trigger language plpgsql as $body$begin if new.name='Verification Team' then raise exception 'forced activation failure'; end if; return new; end$body$$ddl$;
  create trigger season_verification_forced_failure before insert on public.teams for each row execute function pg_temp.reject_verification_team();
  begin perform public.activate_season_draft(v_failure_draft,2,'ACTIVATE'); raise exception 'forced failure did not fire'; exception when others then perform pg_temp.assert_true(sqlerrm like '%forced activation failure%','forced mid-activation failure surfaced'); end;
  drop trigger season_verification_forced_failure on public.teams;
  perform pg_temp.assert_true(not exists(select 1 from public.seasons s where s.name='Verification Forced Failure'),'failed activation rolled back season');
  perform pg_temp.assert_true((select cs.lifecycle='active' from public.competition_seasons cs where cs.id='00000000-0000-4000-8000-00000000e905'),'failed activation preserved prior active edition');

  update public.season_draft_teams t set fixture_note='Edited private note',preferences='[{"kickoff_time":"20:00","classification":"avoid"}]'::jsonb where t.season_draft_id=v_draft;
  insert into public.season_draft_teams(id,season_draft_id,draft_competition_id,source_team_id,selected,name,status,standings_eligible,kit_colour,copy_private_profile,fixture_note,preferences,source_fixture_note,source_preferences)
  select '00000000-0000-4000-8000-00000000e90b',v_draft,c.id,'00000000-0000-4000-8000-00000000e90a',true,'Verification Opt Out','active',true,'#445566',false,'Must not copy','[{"kickoff_time":"21:00","classification":"avoid"}]'::jsonb,'Must not copy','[{"kickoff_time":"21:00","classification":"avoid"}]'::jsonb
  from public.season_draft_competitions c where c.season_draft_id=v_draft limit 1;
  perform public.validate_season_draft(v_draft,1);
  select a.season_id into v_target_season from public.activate_season_draft(v_draft,2,'ACTIVATE') a;
  select cs.id into v_target_cs from public.competition_seasons cs where cs.season_id=v_target_season;
  select t.id into v_target_team from public.teams t where t.competition_season_id=v_target_cs and t.name='Verification Team';
  perform pg_temp.assert_true(v_target_team<>'00000000-0000-4000-8000-00000000e906','activation creates a new season-specific team id');
  perform pg_temp.assert_true((select n.notes='Edited private note' from public.team_fixture_notes n where n.team_id=v_target_team),'edited note copied to new team');
  perform pg_temp.assert_true((select p.kickoff_time='20:00'::time and p.classification='avoid' from public.team_kickoff_preferences p where p.team_id=v_target_team),'edited preference copied to new team');
  perform pg_temp.assert_true(not exists(select 1 from public.team_fixture_notes n join public.teams t on t.id=n.team_id where t.competition_season_id=v_target_cs and t.name='Verification Opt Out'),'opted-out note was excluded');
  perform pg_temp.assert_true(not exists(select 1 from public.team_kickoff_preferences p join public.teams t on t.id=p.team_id where t.competition_season_id=v_target_cs and t.name='Verification Opt Out'),'opted-out preferences were excluded');
  perform pg_temp.assert_true(not exists(select 1 from public.fixtures f where f.competition_season_id=v_target_cs),'fixtures were not copied');
  perform pg_temp.assert_true(not exists(select 1 from public.result_versions r join public.fixtures f on f.id=r.fixture_id where f.competition_season_id=v_target_cs),'results were not copied');
  perform pg_temp.assert_true(not exists(select 1 from public.standing_adjustments a where a.competition_season_id=v_target_cs),'adjustments were not copied');
  perform pg_temp.assert_true((select t.name='Verification Team' and t.kit_colour='#112233' from public.teams t where t.id='00000000-0000-4000-8000-00000000e906'),'historical source team remains unchanged');
  begin update public.teams t set name='Illegal archived edit' where t.id='00000000-0000-4000-8000-00000000e906';raise exception 'archived history was editable';exception when sqlstate '55000' then null;end;
end
$verify$;
select not has_table_privilege('anon','public.season_drafts','select') as anonymous_has_no_draft_grant,
 not has_function_privilege('anon','public.activate_season_draft(uuid,integer,text)','execute') as anonymous_cannot_execute_activation;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-00000000efff',true);
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;
select count(*)=0 as non_admin_cannot_read_drafts from public.season_drafts;
reset role;
select true as season_draft_verification_passed;
rollback;
