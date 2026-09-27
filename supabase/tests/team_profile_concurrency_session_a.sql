-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Start Session B while this session is sleeping.
begin;
select fis_fixture_test.assert_disposable();
select set_config('request.jwt.claim.sub',(select au.user_id::text from private.admin_users au limit 1),true);
select set_config('request.jwt.claim.role','authenticated',true);
select * from public.save_team_profile(
  '00000000-0000-4000-8000-00000000c806',1,
  '__FIS team concurrency__','active','00000000-0000-4000-8000-00000000c805',
  '#112233','[]'::jsonb,null,null
);
select pg_sleep(15);
commit;
