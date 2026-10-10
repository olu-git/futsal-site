-- Read-only release diagnostics. No personal data, Auth records or credentials.
-- Run on verified production project gaqevgjgolvndhcycxzt; never infer it from database name alone.
begin transaction read only;
select current_database() database_name,current_setting('server_version') postgres_version,
 to_regclass('supabase_migrations.schema_migrations') migration_history_relation;
-- NULL history means no registered history, not that baseline effects are absent.
select table_name,column_name,data_type,is_nullable,column_default
from information_schema.columns where table_schema='public' and table_name in
 ('season_drafts','season_draft_competitions','season_draft_teams','teams','team_kickoff_preferences','fixture_change_sets')
order by table_name,ordinal_position;
select c.conrelid::regclass relation,c.conname,pg_get_constraintdef(c.oid) definition
from pg_constraint c join pg_namespace n on n.oid=c.connamespace
where n.nspname='public' and c.conrelid::regclass::text in
 ('season_drafts','season_draft_competitions','season_draft_teams','teams','fixture_change_sets') order by 1,2;
select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies
where schemaname='public' and tablename in ('season_drafts','season_draft_competitions','season_draft_teams','team_kickoff_preferences','team_fixture_notes') order by tablename,policyname;
select n.nspname schema,p.proname function,pg_get_function_identity_arguments(p.oid) arguments,
 p.prosecdef security_definer,p.proconfig configuration,
 has_function_privilege('anon',p.oid,'execute') anon_execute,
 has_function_privilege('authenticated',p.oid,'execute') authenticated_execute,
 pg_get_functiondef(p.oid) definition
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('public','private') and p.proname in
 ('is_fis_admin','is_admin','create_season_draft','save_season_draft','validate_season_draft','activate_season_draft','stage_season_draft','import_season_schedule','assert_season_draft_valid','save_team_profile','replace_fixture_change_items','transition_fixture_change_set','publish_fixture_change_set') order by 1,2;
select table_schema,table_name,grantee,privilege_type from information_schema.role_table_grants
where table_schema='public' and table_name in ('season_drafts','season_draft_competitions','season_draft_teams')
and grantee in ('anon','authenticated','PUBLIC') order by table_name,grantee,privilege_type;
select name,legacy_id,profile_version,
 (select count(*) from public.team_kickoff_preferences p where p.team_id=t.id) preference_count,
 exists(select 1 from public.team_kickoff_preferences p where p.team_id=t.id
  and p.id='a04c3160-7c38-4dd9-b0d2-73bb4d73f649' and p.kickoff_time='19:00'
  and p.classification='preferred' and p.created_at='2026-10-09T20:00:03.54453Z'
  and p.updated_at=p.created_at) exact_accidental_row
from public.teams t where id='04ebec43-f537-52b4-bbae-ffe3449b7826';
rollback;
