-- FIS PRODUCTION TEAM PROFILE SAVE POSTFLIGHT - READ ONLY.
-- Replace the three NULL values with the saved preflight counts before running.
with checks as (
  select
    (select count(*) from public.teams) = null::bigint as teams_unchanged,
    (select count(*) from public.team_kickoff_preferences) = null::bigint as preferences_unchanged,
    (select count(*) from public.team_fixture_notes) = null::bigint as notes_unchanged,
    exists(select 1 from information_schema.columns where table_schema='public' and table_name='teams'
      and column_name='profile_version' and data_type='bigint' and is_nullable='NO' and column_default='1') as profile_version_matches,
    to_regprocedure('public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)') is not null as rpc_exists,
    has_function_privilege('authenticated','public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)','EXECUTE') as authenticated_can_execute,
    not has_function_privilege('anon','public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)','EXECUTE') as anon_cannot_execute
)
select c.*, c.teams_unchanged and c.preferences_unchanged and c.notes_unchanged and c.profile_version_matches
  and c.rpc_exists and c.authenticated_can_execute and c.anon_cannot_execute as team_profile_migration_verified
from checks c;
