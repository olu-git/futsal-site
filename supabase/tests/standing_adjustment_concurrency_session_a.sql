-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
begin;select fis_fixture_test.assert_disposable();select set_config('request.jwt.claim.sub',(select user_id::text from private.admin_users limit 1),true);select set_config('request.jwt.claim.role','authenticated',true);
select * from public.save_standing_adjustment('00000000-0000-4000-8000-00000000e907',1,'00000000-0000-4000-8000-00000000e905','00000000-0000-4000-8000-00000000e906',0,0,0,0,0,0,2,'Session A');select pg_sleep(8);commit;
