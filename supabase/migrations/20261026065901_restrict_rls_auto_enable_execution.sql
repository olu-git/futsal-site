-- Remove API execution privileges, not the automatic RLS event trigger.
begin;

do $migration$
declare
  v_function oid := to_regprocedure('public.rls_auto_enable()');
begin
  -- Some fresh/local installations do not install Supabase's optional helper.
  if v_function is null then
    raise notice 'rls_auto_enable is absent; no execution privileges to revoke';
    return;
  end if;
  if (select prorettype <> 'event_trigger'::regtype from pg_proc where oid = v_function) then
    raise exception 'Unexpected rls_auto_enable signature; review before proceeding';
  end if;
  execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
end;
$migration$;

commit;
