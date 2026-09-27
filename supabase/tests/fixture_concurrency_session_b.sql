-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Start in SQL Editor Tab B one or two seconds after starting Tab A.
begin;
select fis_fixture_test.assert_disposable();
select set_config('request.jwt.claim.sub', (select user_id::text from private.admin_users), true);
set local statement_timeout = '45s';
set local role authenticated;

do $$
declare rejected boolean := false;
begin
  begin
    perform public.publish_fixture_change_set('00000000-0000-4000-8000-0000000f7002', 3);
  exception when raise_exception then
    if sqlerrm = 'Blocking fixture validation errors' then
      rejected := true;
    else
      raise;
    end if;
  end;
  if not rejected then
    raise exception 'CONCURRENCY TEST FAILED: Session B published the occupied venue slot';
  end if;
  raise notice 'EXPECTED: Session B waited, then was rejected by location-wide validation';
end;
$$;
commit;

select 'SESSION B REJECTED AS EXPECTED' as result;
