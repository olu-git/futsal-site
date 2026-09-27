-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Run the entire file in SQL Editor Tab A. Immediately run session_b.sql in Tab B.
begin;
select fis_fixture_test.assert_disposable();
select set_config('request.jwt.claim.sub', (select user_id::text from private.admin_users), true);
set local role authenticated;

select public.publish_fixture_change_set('00000000-0000-4000-8000-0000000f7001', 3);
-- The venue row remains locked until COMMIT. Keep both tabs ready beforehand.
select pg_sleep(15);
commit;

select 'SESSION A COMMITTED' as result;
