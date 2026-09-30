-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Activation correctly archives the source edition. Cleanup therefore disables
-- only the archived-data guards, transactionally, after validating the marker.
begin;
select fis_fixture_test.assert_disposable();

create temporary table _fis_season_cleanup_ids(id uuid primary key) on commit drop;
insert into _fis_season_cleanup_ids(id)
select d.id from public.season_drafts d where d.name='__FIS season concurrency target__'
union select dc.id from public.season_draft_competitions dc join public.season_drafts d on d.id=dc.season_draft_id where d.name='__FIS season concurrency target__'
union select dt.id from public.season_draft_teams dt join public.season_drafts d on d.id=dt.season_draft_id where d.name='__FIS season concurrency target__'
union select s.id from public.seasons s where s.name in ('__FIS season concurrency source__','__FIS season concurrency target__')
union select cs.id from public.competition_seasons cs join public.seasons s on s.id=cs.season_id where s.name in ('__FIS season concurrency source__','__FIS season concurrency target__')
union select t.id from public.teams t join public.competition_seasons cs on cs.id=t.competition_season_id join public.seasons s on s.id=cs.season_id where s.name in ('__FIS season concurrency source__','__FIS season concurrency target__')
union select c.id from public.competitions c where c.id='00000000-0000-4000-8000-00000000ea04'
union select c.id from public.categories c where c.id='00000000-0000-4000-8000-00000000ea02'
union select l.id from public.locations l where l.id='00000000-0000-4000-8000-00000000ea03';

alter table public.team_fixture_notes disable trigger protect_archived_data;
alter table public.team_kickoff_preferences disable trigger protect_archived_data;
alter table public.teams disable trigger protect_archived_data;
alter table public.competition_seasons disable trigger protect_archived_competition_season;

delete from public.season_drafts d where d.name='__FIS season concurrency target__';
delete from public.team_fixture_notes n using public.teams t,public.competition_seasons cs,public.seasons s where n.team_id=t.id and t.competition_season_id=cs.id and cs.season_id=s.id and s.name in ('__FIS season concurrency source__','__FIS season concurrency target__');
delete from public.team_kickoff_preferences p using public.teams t,public.competition_seasons cs,public.seasons s where p.team_id=t.id and t.competition_season_id=cs.id and cs.season_id=s.id and s.name in ('__FIS season concurrency source__','__FIS season concurrency target__');
delete from public.teams t using public.competition_seasons cs,public.seasons s where t.competition_season_id=cs.id and cs.season_id=s.id and s.name in ('__FIS season concurrency source__','__FIS season concurrency target__');
delete from public.competition_seasons cs using public.seasons s where cs.season_id=s.id and s.name in ('__FIS season concurrency source__','__FIS season concurrency target__');

alter table public.competition_seasons enable trigger protect_archived_competition_season;
alter table public.teams enable trigger protect_archived_data;
alter table public.team_kickoff_preferences enable trigger protect_archived_data;
alter table public.team_fixture_notes enable trigger protect_archived_data;

delete from public.competitions c where c.id='00000000-0000-4000-8000-00000000ea04';
delete from public.seasons s where s.name in ('__FIS season concurrency source__','__FIS season concurrency target__');
delete from public.categories c where c.id='00000000-0000-4000-8000-00000000ea02';
delete from public.locations l where l.id='00000000-0000-4000-8000-00000000ea03';
delete from public.admin_audit_log a where a.row_id in(select i.id from _fis_season_cleanup_ids i) or a.new_row->>'name' like '__FIS season concurrency%';

do $$
begin
  if not exists (
    select 1 from pg_trigger t
    where t.tgrelid='public.competition_seasons'::regclass
      and t.tgname='protect_archived_competition_season' and t.tgenabled='O'
  ) then raise exception 'Archived competition-season protection was not restored'; end if;
  if (select count(*) from pg_trigger t
      where t.tgrelid in ('public.teams'::regclass,'public.team_fixture_notes'::regclass,'public.team_kickoff_preferences'::regclass)
        and t.tgname='protect_archived_data' and t.tgenabled='O') <> 3
  then raise exception 'Archived competition-data protection was not restored'; end if;
  if to_regprocedure('private.protect_archived_competition_season()') is null
     or to_regprocedure('private.protect_archived_competition_data()') is null
  then raise exception 'Archived protection function is missing'; end if;
end $$;
commit;

select
 exists(select 1 from private.admin_users) as administrator_preserved,
 exists(select 1 from fis_fixture_test.project_marker m where m.project_name='fis-fixture-test' and m.disposable_admin_user_id is not null) as marker_preserved,
 not exists(select 1 from public.seasons s where s.name like '__FIS season concurrency%') as concurrency_records_removed,
 exists(select 1 from pg_trigger t where t.tgrelid='public.competition_seasons'::regclass and t.tgname='protect_archived_competition_season' and t.tgenabled='O') as competition_season_guard_enabled,
 (select count(*)=3 from pg_trigger t where t.tgrelid in ('public.teams'::regclass,'public.team_fixture_notes'::regclass,'public.team_kickoff_preferences'::regclass) and t.tgname='protect_archived_data' and t.tgenabled='O') as competition_data_guards_enabled,
 to_regprocedure('private.protect_archived_competition_season()') is not null
   and to_regprocedure('private.protect_archived_competition_data()') is not null as protection_functions_preserved;
