-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
select fis_fixture_test.assert_disposable();
select
  to_regclass('public.season_drafts') is not null as season_drafts_exists,
  to_regclass('public.season_draft_competitions') is not null as competitions_exist,
  to_regclass('public.season_draft_teams') is not null as teams_exist,
  (select c.is_nullable='NO' and c.data_type='jsonb' and c.column_default like '%[]%' from information_schema.columns c where c.table_schema='public' and c.table_name='season_draft_teams' and c.column_name='source_preferences') as source_preferences_exact,
  (select count(*)=3 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('season_drafts','season_draft_competitions','season_draft_teams') and c.relrowsecurity) as all_draft_rls_enabled,
  (select count(*)=3 from pg_catalog.pg_policies p where p.schemaname='public' and p.policyname in ('season_drafts_admin','season_draft_competitions_admin','season_draft_teams_admin') and p.roles='{authenticated}') as exact_admin_policies_exist,
  to_regprocedure('public.create_season_draft(text,date,date,uuid)') is not null as create_rpc_exists,
  to_regprocedure('public.save_season_draft(uuid,integer,text,date,date,jsonb,jsonb)') is not null as save_rpc_exists,
  to_regprocedure('public.validate_season_draft(uuid,integer)') is not null as validate_rpc_exists,
  to_regprocedure('public.abandon_season_draft(uuid,integer)') is not null as abandon_rpc_exists,
  to_regprocedure('public.activate_season_draft(uuid,integer,text)') is not null as activate_rpc_exists,
  not has_function_privilege('anon','public.activate_season_draft(uuid,integer,text)','execute') as anon_cannot_activate,
  has_function_privilege('authenticated','public.activate_season_draft(uuid,integer,text)','execute') as authenticated_has_rpc_grant,
  (select p.prosecdef and p.proconfig @> array['search_path=""'] from pg_catalog.pg_proc p where p.oid='public.activate_season_draft(uuid,integer,text)'::regprocedure) as activate_security_exact;
