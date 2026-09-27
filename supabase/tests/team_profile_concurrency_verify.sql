-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Read-only result check.
select fis_fixture_test.assert_disposable();
select t.profile_version=2 as one_save_committed, t.kit_colour='#112233' as session_a_won,
  (select count(*)=1 from public.admin_audit_log a where a.table_name='team_profile' and a.row_id=t.id) as one_profile_audit
from public.teams t where t.id='00000000-0000-4000-8000-00000000c806';
