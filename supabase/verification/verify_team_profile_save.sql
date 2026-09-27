-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Self-contained rollback-only verification. Paste and run as one query.
begin;
select fis_fixture_test.assert_disposable();
create temporary table _fis_team_profile_bootstrap(id integer);
create function pg_temp.assert_true(p_value boolean, p_message text) returns void language plpgsql as $$
begin if p_value is not true then raise exception 'Verification failed: %', p_message; end if; end; $$;
create function pg_temp.fail_team_note_write() returns trigger language plpgsql as $$
begin raise exception 'Injected nested team-note failure'; end; $$;

select set_config('request.jwt.claim.sub', (select au.user_id::text from private.admin_users au limit 1), true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select pg_temp.assert_true(auth.uid() is not null and (select private.is_admin()), 'enrolled disposable administrator is required');

insert into public.seasons(id,name,starts_on,ends_on) values
  ('00000000-0000-4000-8000-00000000b801','__FIS team profile verification season__','2099-01-01','2099-12-31'),
  ('00000000-0000-4000-8000-00000000b802','__FIS team profile archived season__','2098-01-01','2098-12-31');
insert into public.categories(id,code,name) values
  ('00000000-0000-4000-8000-00000000b803','__fis_team_profile_verify__','__FIS team profile verification category__');
insert into public.locations(id,name,address,active) values
  ('00000000-0000-4000-8000-00000000b804','__FIS team profile verification location__','Disposable verification only',true);
insert into public.competitions(id,category_id,location_id,weekday,division,name) values
  ('00000000-0000-4000-8000-00000000b805','00000000-0000-4000-8000-00000000b803','00000000-0000-4000-8000-00000000b804',1,'VERIFY-SOURCE','__FIS profile source competition__'),
  ('00000000-0000-4000-8000-00000000b806','00000000-0000-4000-8000-00000000b803','00000000-0000-4000-8000-00000000b804',3,'VERIFY-DEST','__FIS profile destination competition__');
insert into public.competition_seasons(id,competition_id,season_id,lifecycle,publication_state) values
  ('00000000-0000-4000-8000-00000000b807','00000000-0000-4000-8000-00000000b805','00000000-0000-4000-8000-00000000b801','active','draft'),
  ('00000000-0000-4000-8000-00000000b808','00000000-0000-4000-8000-00000000b806','00000000-0000-4000-8000-00000000b801','planned','draft'),
  ('00000000-0000-4000-8000-00000000b809','00000000-0000-4000-8000-00000000b805','00000000-0000-4000-8000-00000000b802','archived','draft');
insert into public.teams(id,competition_season_id,name,status,standings_eligible,kit_colour) values
  ('00000000-0000-4000-8000-00000000b810','00000000-0000-4000-8000-00000000b807','__FIS team profile verification__','active',true,'#FFFFFF'),
  ('00000000-0000-4000-8000-00000000b811','00000000-0000-4000-8000-00000000b807','__FIS duplicate target__','active',true,'#111111');
insert into public.team_kickoff_preferences(id,team_id,kickoff_time,classification) values
  ('00000000-0000-4000-8000-00000000b812','00000000-0000-4000-8000-00000000b810','19:00','avoid');
insert into public.team_fixture_notes(team_id,notes) values
  ('00000000-0000-4000-8000-00000000b810','Original disposable note');

do $verify$
declare
  v_team_id constant uuid := '00000000-0000-4000-8000-00000000b810';
  v_source_competition_season_id constant uuid := '00000000-0000-4000-8000-00000000b807';
  v_destination_competition_season_id constant uuid := '00000000-0000-4000-8000-00000000b808';
  v_archived_competition_season_id constant uuid := '00000000-0000-4000-8000-00000000b809';
  v_version bigint;
  v_before jsonb;
begin
  perform public.save_team_profile(v_team_id,1,'__FIS team profile verification__','active',v_source_competition_season_id,'#112233',
    '[{"kickoff_time":"19:40","classification":"required"},{"kickoff_time":"20:20","classification":"avoid"}]'::jsonb,
    'Updated disposable note',null);
  select t.profile_version into v_version from public.teams t where t.id=v_team_id;
  perform pg_temp.assert_true(v_version=2,'complete save increments profile version');
  perform pg_temp.assert_true((select count(*)=2 from public.team_kickoff_preferences p where p.team_id=v_team_id),'preferences replaced');
  perform pg_temp.assert_true(not exists(select 1 from public.team_kickoff_preferences p where p.id='00000000-0000-4000-8000-00000000b812'),'original preference removed');
  perform pg_temp.assert_true((select n.notes='Updated disposable note' from public.team_fixture_notes n where n.team_id=v_team_id),'note updated');

  perform public.save_team_profile(v_team_id,2,'__FIS team profile verification__','active',v_source_competition_season_id,'#112233','[]'::jsonb,'',null);
  perform pg_temp.assert_true(not exists(select 1 from public.team_kickoff_preferences p where p.team_id=v_team_id),'preferences deleted');
  perform pg_temp.assert_true(not exists(select 1 from public.team_fixture_notes n where n.team_id=v_team_id),'note intentionally removed');

  begin
    perform public.save_team_profile(v_team_id,3,'__FIS team profile verification__','active',v_source_competition_season_id,null,
      '[{"kickoff_time":"19:00","classification":"required"},{"kickoff_time":"19:00","classification":"required"}]'::jsonb,null,null);
    raise exception 'duplicate preference was accepted';
  exception when others then perform pg_temp.assert_true(sqlerrm like '%Duplicate kick-off preference%','duplicate preference rejected'); end;
  begin
    perform public.save_team_profile(v_team_id,3,'__FIS team profile verification__','active',v_source_competition_season_id,null,
      '[{"kickoff_time":"19:00","classification":"required"},{"kickoff_time":"19:00","classification":"avoid"}]'::jsonb,null,null);
    raise exception 'conflicting preference was accepted';
  exception when others then perform pg_temp.assert_true(sqlerrm like '%Conflicting strengths%','conflicting preference rejected'); end;
  begin
    perform public.save_team_profile(v_team_id,3,'__FIS duplicate target__','active',v_source_competition_season_id,null,'[]'::jsonb,null,'Duplicate test');
    raise exception 'duplicate team name was accepted';
  exception when others then perform pg_temp.assert_true(sqlerrm like '%Duplicate team name%','duplicate team name rejected'); end;
  begin
    perform public.save_team_profile(v_team_id,3,'__FIS team profile verification__','active',gen_random_uuid(),null,'[]'::jsonb,null,'Invalid destination test');
    raise exception 'invalid destination was accepted';
  exception when others then perform pg_temp.assert_true(sqlerrm like '%Invalid destination%','invalid destination rejected'); end;
  begin
    perform public.save_team_profile(v_team_id,3,'__FIS team profile verification__','active',v_archived_competition_season_id,null,'[]'::jsonb,null,'Archive test');
    raise exception 'archived destination was accepted';
  exception when others then perform pg_temp.assert_true(sqlerrm like '%Archived destination%','archived destination rejected'); end;
  begin
    perform public.save_team_profile(v_team_id,2,'__FIS team profile verification__','active',v_source_competition_season_id,null,'[]'::jsonb,null,null);
    raise exception 'stale edit was accepted';
  exception when others then perform pg_temp.assert_true(sqlerrm like '%Stale team profile%','stale edit rejected'); end;

  perform public.save_team_profile(v_team_id,3,'__FIS team profile verification__','active',v_destination_competition_season_id,'#112233','[]'::jsonb,null,'Approved disposable reassignment');
  perform pg_temp.assert_true((select t.competition_season_id=v_destination_competition_season_id from public.teams t where t.id=v_team_id),'history-free reassignment succeeds');

  select jsonb_build_object('team',to_jsonb(t),'preferences',(select count(*) from public.team_kickoff_preferences p where p.team_id=t.id),'note',(select n.notes from public.team_fixture_notes n where n.team_id=t.id))
    into v_before from public.teams t where t.id=v_team_id;
  execute 'create trigger fis_verify_team_note_failure before insert or update on public.team_fixture_notes for each row execute function pg_temp.fail_team_note_write()';
  begin
    perform public.save_team_profile(v_team_id,4,'__FIS team profile verification__','active',v_destination_competition_season_id,'#ABCDEF',
      '[{"kickoff_time":"21:00","classification":"preferred"}]'::jsonb,'must roll back',null);
  exception when others then perform pg_temp.assert_true(sqlerrm like '%Injected nested team-note failure%','nested note failure injected'); end;
  execute 'drop trigger fis_verify_team_note_failure on public.team_fixture_notes';
  perform pg_temp.assert_true(v_before=(select jsonb_build_object('team',to_jsonb(t),'preferences',(select count(*) from public.team_kickoff_preferences p where p.team_id=t.id),'note',(select n.notes from public.team_fixture_notes n where n.team_id=t.id)) from public.teams t where t.id=v_team_id),'failed nested save rolled back all profile state');
end;
$verify$;

do $unauthorised$
begin
  perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-00000000a001',true);
  begin
    perform public.save_team_profile('00000000-0000-4000-8000-00000000b810',4,'__FIS team profile verification__','active','00000000-0000-4000-8000-00000000b808',null,'[]'::jsonb,null,null);
    raise exception 'unauthorised caller was accepted';
  exception when others then perform pg_temp.assert_true(sqlerrm like '%Administrator access required%','unauthorised caller rejected'); end;
end;
$unauthorised$;

select true as team_profile_verification_passed;
rollback;
