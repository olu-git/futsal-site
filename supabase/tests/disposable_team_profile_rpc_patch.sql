-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Repairs only the installed save_team_profile function after the confirmed
-- RETURNS TABLE output-variable conflict in ON CONFLICT (team_id).
begin;
select fis_fixture_test.assert_disposable();

create temporary table _fis_team_profile_rpc_before as
select p.oid, p.proowner, p.proacl
from pg_catalog.pg_proc p
where p.oid = to_regprocedure('public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)');

do $patch$
declare
  v_function_oid oid;
  v_definition text;
  v_corrected_definition text;
begin
  v_function_oid := to_regprocedure('public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)');
  if v_function_oid is null then
    raise exception 'Installed save_team_profile function was not found';
  end if;
  select pg_catalog.pg_get_functiondef(p.oid) into v_definition
  from pg_catalog.pg_proc p where p.oid = v_function_oid;
  if v_definition !~* 'on\s+conflict\s*\(\s*team_id\s*\)\s+do\s+update\s+set\s+notes\s*=\s*excluded\.notes' then
    raise exception 'Known ambiguous ON CONFLICT expression was not found; stop rather than applying an uncertain patch';
  end if;
  v_corrected_definition := pg_catalog.regexp_replace(
    v_definition,
    'on\s+conflict\s*\(\s*team_id\s*\)\s+do\s+update\s+set\s+notes\s*=\s*excluded\.notes',
    'on conflict on constraint team_fixture_notes_pkey do update set notes = excluded.notes',
    'i'
  );
  execute v_corrected_definition;
end;
$patch$;

select
  to_regprocedure('public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)') is not null as corrected_function_exists,
  pg_catalog.pg_get_functiondef('public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)'::regprocedure)
    !~* 'on\s+conflict\s*\(\s*team_id\s*\)' as known_ambiguous_expression_removed,
  pg_catalog.pg_get_functiondef('public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)'::regprocedure)
    ~* 'on\s+conflict\s+on\s+constraint\s+team_fixture_notes_pkey' as named_constraint_installed,
  p.prosecdef as security_definer_preserved,
  coalesce(array_to_string(p.proconfig, ','), '') like 'search_path=%' as safe_search_path_preserved,
  p.proowner = b.proowner as ownership_preserved,
  p.proacl is not distinct from b.proacl as grants_preserved,
  has_function_privilege('authenticated','public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)','EXECUTE') as authenticated_execute_preserved,
  not has_function_privilege('anon','public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)','EXECUTE') as anonymous_execute_denied
from pg_catalog.pg_proc p cross join _fis_team_profile_rpc_before b
where p.oid='public.save_team_profile(uuid,bigint,text,text,uuid,text,jsonb,text,text)'::regprocedure;

commit;
