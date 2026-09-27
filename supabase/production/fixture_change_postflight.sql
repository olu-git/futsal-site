-- FIS PRODUCTION FIXTURE CHANGE MIGRATION POSTFLIGHT — READ ONLY
-- Replace the NULL placeholders with counts saved from preflight before running.
with expected as (select null::bigint as fixture_count_before, null::bigint as published_result_count_before), checks as (
  select
    (select count(*)=1 from information_schema.columns c where c.table_schema='public' and c.table_name='fixtures'
      and c.column_name='schedule_status' and c.data_type='text' and c.is_nullable='NO' and c.column_default='''scheduled''::text') as schedule_status_matches,
    (select count(*)=1 from information_schema.columns c where c.table_schema='public' and c.table_name='fixtures'
      and c.column_name='schedule_version' and c.data_type='bigint' and c.is_nullable='NO' and c.column_default='1') as schedule_version_matches,
    (select count(*)=3 from information_schema.tables t where t.table_schema='public'
      and t.table_name in ('fixture_change_sets','fixture_change_items','fixture_change_history')) as tables_exist,
    (select count(*)=3 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relname in ('fixture_change_sets','fixture_change_items','fixture_change_history') and c.relrowsecurity) as rls_enabled,
    (select count(*)=3 from pg_catalog.pg_policies p where p.schemaname='public'
      and p.policyname in ('fixture_change_sets_admin_read','fixture_change_items_admin_read','fixture_change_history_admin_read')) as policies_exist,
    (select count(*)=5 from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname in ('create_fixture_change_set','replace_fixture_change_items','transition_fixture_change_set','validate_fixture_change_set','publish_fixture_change_set')) as rpcs_exist,
    has_function_privilege('authenticated','public.create_fixture_change_set(uuid,text,text,text)','EXECUTE')
      and not has_function_privilege('anon','public.create_fixture_change_set(uuid,text,text,text)','EXECUTE') as grants_match,
    (select count(*) from private.admin_users)=1 as administrator_unchanged,
    (select count(*) from public.fixture_change_sets)=0 as no_change_sets_created,
    (select count(*) from public.fixtures)=e.fixture_count_before as fixture_count_unchanged,
    (select count(*) from public.result_versions where status='published')=e.published_result_count_before as result_count_unchanged,
    exists (select 1 from public.fixtures where publication_state='published') as public_fixture_visibility_intact,
    e.fixture_count_before is not null and e.published_result_count_before is not null as manual_counts_supplied
  from expected e
)
select c.*, (c.schedule_status_matches and c.schedule_version_matches and c.tables_exist and c.rls_enabled
  and c.policies_exist and c.rpcs_exist and c.grants_match and c.administrator_unchanged and c.no_change_sets_created
  and c.fixture_count_unchanged and c.result_count_unchanged and c.public_fixture_visibility_intact
  and c.manual_counts_supplied) as fixture_change_migration_verified from checks c;
