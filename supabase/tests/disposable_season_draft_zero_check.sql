-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
select fis_fixture_test.assert_disposable();
select
 (select count(*) from public.season_drafts d where d.name like 'Verification%') as draft_count,
 (select count(*) from public.seasons s where s.name like 'Verification%') as season_count,
 (select count(*) from public.categories c where c.code='verify-season') as category_count,
 (select count(*) from public.fixtures f where f.id between '00000000-0000-4000-8000-00000000e900' and '00000000-0000-4000-8000-00000000e9ff') as fixture_count,
 (select count(*) from public.result_versions r where r.id between '00000000-0000-4000-8000-00000000e900' and '00000000-0000-4000-8000-00000000e9ff') as result_count,
 (select count(*) from public.standing_adjustments a where a.id between '00000000-0000-4000-8000-00000000e900' and '00000000-0000-4000-8000-00000000e9ff') as adjustment_count,
 not exists(select 1 from public.season_drafts d where d.name like 'Verification%')
 and not exists(select 1 from public.seasons s where s.name like 'Verification%')
 and not exists(select 1 from public.categories c where c.code='verify-season')
 and not exists(select 1 from public.teams t where t.id between '00000000-0000-4000-8000-00000000e900' and '00000000-0000-4000-8000-00000000e9ff') as all_verification_rows_removed,
 exists(select 1 from private.admin_users) as administrator_preserved,
 exists(select 1 from fis_fixture_test.project_marker m where m.disposable_admin_user_id is not null) as marker_preserved;
