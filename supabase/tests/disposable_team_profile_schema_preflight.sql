-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Read-only check after applying the migration.
select fis_fixture_test.assert_disposable();

with checks as (
  select
    exists (select 1 from information_schema.columns c where c.table_schema='public' and c.table_name='teams'
      and c.column_name='profile_version' and c.data_type='bigint' and c.is_nullable='NO' and c.column_default='1') as profile_version_matches,
    to_regprocedure('public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)') is not null as rpc_exists,
    has_function_privilege('authenticated', 'public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)', 'EXECUTE') as authenticated_can_execute,
    not has_function_privilege('anon', 'public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)', 'EXECUTE') as anon_cannot_execute,
    (select p.prosecdef and coalesce(array_to_string(p.proconfig,','),'') like 'search_path=%' from pg_catalog.pg_proc p
      where p.oid='public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)'::regprocedure) as secure_definition
)
select c.*, c.profile_version_matches and c.rpc_exists and c.authenticated_can_execute
  and c.anon_cannot_execute and c.secure_definition as all_team_profile_schema_checks_passed
from checks c;
