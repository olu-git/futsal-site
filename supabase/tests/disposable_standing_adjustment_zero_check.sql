-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
select fis_fixture_test.assert_disposable();
select count(*) as leaked_adjustments from public.standing_adjustments where team_id='00000000-0000-4000-8000-00000000d906';
select not exists(select 1 from public.seasons where id='00000000-0000-4000-8000-00000000d901') and not exists(select 1 from public.teams where id='00000000-0000-4000-8000-00000000d906') as standing_adjustment_zero_check_passed;
