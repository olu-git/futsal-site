-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Read-only schema diagnostic. It never repairs or modifies the installed schema.
select fis_fixture_test.assert_disposable();

with checks as (
  select
    (select count(*) = 1
      from information_schema.columns c
      where c.table_schema = 'public' and c.table_name = 'fixtures'
        and c.column_name = 'schedule_status' and c.data_type = 'text'
        and c.is_nullable = 'NO' and c.column_default = '''scheduled''::text')
      as schedule_status_column_matches,
    (select count(*) = 1
      from pg_catalog.pg_constraint con
      join pg_catalog.pg_class rel on rel.oid = con.conrelid
      join pg_catalog.pg_namespace n on n.oid = rel.relnamespace
      where n.nspname = 'public' and rel.relname = 'fixtures' and con.contype = 'c'
        and pg_get_constraintdef(con.oid) =
          'CHECK ((schedule_status = ANY (ARRAY[''scheduled''::text, ''cancelled''::text])))')
      as schedule_status_constraint_matches,
    (select count(*) = 1
      from information_schema.columns c
      where c.table_schema = 'public' and c.table_name = 'fixtures'
        and c.column_name = 'schedule_version' and c.data_type = 'bigint'
        and c.is_nullable = 'NO' and c.column_default = '1')
      as schedule_version_column_matches,
    (select count(*) = 3
      from information_schema.tables t
      where t.table_schema = 'public'
        and t.table_name in ('fixture_change_sets', 'fixture_change_items', 'fixture_change_history'))
      as fixture_change_tables_exist,
    (select count(*) = 8
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      where (n.nspname, p.proname) in (
        ('private', 'bump_fixture_schedule_version'),
        ('private', 'fixture_change_message'),
        ('private', 'fixture_change_report'),
        ('private', 'fixture_report_has'),
        ('private', 'bump_fixture_change_set_version'),
        ('private', 'guard_fixture_change_rows'),
        ('public', 'create_fixture_change_set'),
        ('public', 'replace_fixture_change_items')
      )) as fixture_change_core_functions_exist,
    (select count(*) = 3
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in ('transition_fixture_change_set', 'validate_fixture_change_set', 'publish_fixture_change_set'))
      as fixture_change_workflow_functions_exist,
    (select count(*) = 3
      from pg_catalog.pg_policies p
      where p.schemaname = 'public'
        and (p.tablename, p.policyname) in (
          ('fixture_change_sets', 'fixture_change_sets_admin_read'),
          ('fixture_change_items', 'fixture_change_items_admin_read'),
          ('fixture_change_history', 'fixture_change_history_admin_read')
        )) as fixture_change_policies_exist
)
select c.*,
  c.schedule_status_column_matches
    and c.schedule_status_constraint_matches
    and c.schedule_version_column_matches
    and c.fixture_change_tables_exist
    and c.fixture_change_core_functions_exist
    and c.fixture_change_workflow_functions_exist
    and c.fixture_change_policies_exist as all_fixture_change_schema_checks_passed
from checks c;
