-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
select fis_fixture_test.assert_disposable();
select
 to_regprocedure('public.save_standing_adjustment(uuid,bigint,uuid,uuid,integer,integer,integer,integer,integer,integer,integer,text)') is not null as save_rpc_exists,
 to_regprocedure('public.transition_standing_adjustment(uuid,bigint,text)') is not null as transition_rpc_exists,
 to_regprocedure('public.create_standing_adjustment_followup(uuid,text,text)') is not null as followup_rpc_exists,
 exists(select 1 from information_schema.columns c where c.table_schema='public' and c.table_name='standing_adjustments' and c.column_name='version' and c.is_nullable='NO') as version_exists,
 exists(select 1 from pg_indexes i where i.schemaname='public' and i.indexname='standing_adjustments_one_followup') as followup_unique_exists,
 exists(select 1 from pg_trigger t where t.tgname='standing_adjustments_protect_published' and not t.tgisinternal) as immutability_trigger_exists;
