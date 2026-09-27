-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Run while Session A is sleeping. It must wait, then fail with the stale-edit error.
begin;
select fis_fixture_test.assert_disposable();
select set_config('request.jwt.claim.sub',(select au.user_id::text from private.admin_users au limit 1),true);
select set_config('request.jwt.claim.role','authenticated',true);
select * from public.save_team_profile(
  '00000000-0000-4000-8000-00000000c806',1,
  '__FIS team concurrency__','active','00000000-0000-4000-8000-00000000c805',
  '#445566','[]'::jsonb,null,null
);
rollback;
