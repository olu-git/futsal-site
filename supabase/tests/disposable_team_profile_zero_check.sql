-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Read-only leakage check for every permanent row used by verify_team_profile_save.sql.
select fis_fixture_test.assert_disposable();
with verification_ids(id) as (values
  ('00000000-0000-4000-8000-00000000b801'::uuid),('00000000-0000-4000-8000-00000000b802'::uuid),
  ('00000000-0000-4000-8000-00000000b803'::uuid),('00000000-0000-4000-8000-00000000b804'::uuid),
  ('00000000-0000-4000-8000-00000000b805'::uuid),('00000000-0000-4000-8000-00000000b806'::uuid),
  ('00000000-0000-4000-8000-00000000b807'::uuid),('00000000-0000-4000-8000-00000000b808'::uuid),
  ('00000000-0000-4000-8000-00000000b809'::uuid),('00000000-0000-4000-8000-00000000b810'::uuid),
  ('00000000-0000-4000-8000-00000000b811'::uuid),('00000000-0000-4000-8000-00000000b812'::uuid)
), counts as (
  select
    (select count(*) from public.seasons s where s.id in (select v.id from verification_ids v)) as seasons,
    (select count(*) from public.categories c where c.id in (select v.id from verification_ids v)) as categories,
    (select count(*) from public.locations l where l.id in (select v.id from verification_ids v)) as locations,
    (select count(*) from public.competitions c where c.id in (select v.id from verification_ids v)) as competitions,
    (select count(*) from public.competition_seasons cs where cs.id in (select v.id from verification_ids v)) as competition_seasons,
    (select count(*) from public.teams t where t.id in (select v.id from verification_ids v)) as teams,
    (select count(*) from public.team_kickoff_preferences p where p.team_id='00000000-0000-4000-8000-00000000b810' or p.id in (select v.id from verification_ids v)) as preferences,
    (select count(*) from public.team_fixture_notes n where n.team_id='00000000-0000-4000-8000-00000000b810') as notes,
    (select count(*) from public.admin_audit_log a where a.row_id in (select v.id from verification_ids v)
      or (a.table_name='team_profile' and (a.old_row::text like '%00000000-0000-4000-8000-00000000b810%' or a.new_row::text like '%00000000-0000-4000-8000-00000000b810%'))) as audit_rows
)
select c.*, c.seasons=0 and c.categories=0 and c.locations=0 and c.competitions=0
  and c.competition_seasons=0 and c.teams=0 and c.preferences=0 and c.notes=0 and c.audit_rows=0
  as all_team_profile_verification_counts_zero
from counts c;
