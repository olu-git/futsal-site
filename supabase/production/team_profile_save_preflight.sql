-- FIS PRODUCTION TEAM PROFILE SAVE PREFLIGHT - READ ONLY.
with state as (
  select
    to_regclass('public.teams') is not null as teams_exists,
    to_regclass('public.team_kickoff_preferences') is not null as preferences_exist,
    to_regclass('public.team_fixture_notes') is not null as notes_exist,
    to_regclass('public.admin_audit_log') is not null as audit_exists,
    to_regprocedure('private.is_admin()') is not null as admin_check_exists,
    exists(select 1 from private.admin_users) as administrator_enrolled,
    exists(select 1 from information_schema.columns where table_schema='public' and table_name='teams' and column_name='profile_version') as profile_version_exists,
    to_regprocedure('public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)') is not null as rpc_exists,
    (select count(*) from public.teams) as team_count,
    (select count(*) from public.team_kickoff_preferences) as preference_count,
    (select count(*) from public.team_fixture_notes) as note_count
)
select s.*, s.teams_exists and s.preferences_exist and s.notes_exist and s.audit_exists
  and s.admin_check_exists and s.administrator_enrolled and not s.profile_version_exists and not s.rpc_exists
  as team_profile_migration_ready
from state s;
