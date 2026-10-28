-- Keep publish_result as SECURITY INVOKER. Only its fixture row lock needs
-- owner privileges; result writes continue through the caller's grants/RLS.
begin;

create or replace function private.lock_fixture_for_result_publication(p_fixture_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if (select private.is_admin()) is not true then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  perform 1 from public.fixtures f where f.id = p_fixture_id for update;
  if not found then
    raise exception 'Unknown fixture' using errcode = 'P0002';
  end if;
end;
$function$;

alter function private.lock_fixture_for_result_publication(uuid) owner to postgres;
revoke all on function private.lock_fixture_for_result_publication(uuid)
  from public, anon, authenticated, service_role;
grant execute on function private.lock_fixture_for_result_publication(uuid) to authenticated;

-- Transform one known statement instead of replacing the publication workflow.
-- pg_get_functiondef retains owner-independent function attributes and CREATE
-- OR REPLACE preserves the existing function OID, owner and execution grants.
do $migration$
declare
  v_function oid := to_regprocedure('public.publish_result(uuid)');
  v_definition text;
  v_lock_pattern constant text := '\mperform\s+1\s+from\s+public\.fixtures\s+where\s+id\s*=\s*candidate\.fixture_id\s+for\s+update\s*;';
  v_helper_pattern constant text := '\mperform\s+private\.lock_fixture_for_result_publication\(candidate\.fixture_id\)\s*;';
  v_count integer;
begin
  if v_function is null then
    raise exception 'publish_result(uuid) is missing';
  end if;
  if (select prosecdef or prorettype <> 'void'::regtype or
      not coalesce(proconfig @> array['search_path=""'], false)
      from pg_proc where oid = v_function) then
    raise exception 'Unexpected publish_result security attributes; review before proceeding';
  end if;
  v_definition := pg_get_functiondef(v_function);
  select count(*) into v_count from regexp_matches(v_definition, v_lock_pattern, 'gi');
  if v_count = 0 and (select count(*) from regexp_matches(v_definition, v_helper_pattern, 'gi')) = 1 then
    return; -- Already repaired: safe to repeat without changing the workflow.
  end if;
  if v_count <> 1 then
    raise exception 'Expected exactly one legacy fixture lock; review publish_result before proceeding';
  end if;
  execute regexp_replace(v_definition, v_lock_pattern,
    'perform private.lock_fixture_for_result_publication(candidate.fixture_id);', 'i');
end;
$migration$;

commit;
