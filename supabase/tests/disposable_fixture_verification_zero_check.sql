-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Read-only leakage check to run after the rollback-only fixture verification.
select fis_fixture_test.assert_disposable();

with verification_counts as (
  select
    (select count(*) from public.seasons s
      where s.id in ('00000000-0000-4000-8000-000000011101', '00000000-0000-4000-8000-000000011102')) as seasons,
    (select count(*) from public.categories c
      where c.id = '00000000-0000-4000-8000-000000012101') as categories,
    (select count(*) from public.locations l
      where l.id in ('00000000-0000-4000-8000-000000013101', '00000000-0000-4000-8000-000000013102')) as locations,
    (select count(*) from public.competitions c
      where c.id in (
        '00000000-0000-4000-8000-000000014101', '00000000-0000-4000-8000-000000014102',
        '00000000-0000-4000-8000-000000014103', '00000000-0000-4000-8000-000000014104'
      )) as competitions,
    (select count(*) from public.competition_seasons cs
      where cs.id in (
        '00000000-0000-4000-8000-000000015101', '00000000-0000-4000-8000-000000015102',
        '00000000-0000-4000-8000-000000015103', '00000000-0000-4000-8000-000000015104',
        '00000000-0000-4000-8000-000000015105'
      )) as competition_seasons,
    (select count(*) from public.teams t
      where t.id::text like '00000000-0000-4000-8000-0000000161%') as teams,
    (select count(*) from public.team_kickoff_preferences tkp
      where tkp.team_id::text like '00000000-0000-4000-8000-0000000161%') as team_kickoff_preferences,
    (select count(*) from public.team_fixture_notes tfn
      where tfn.team_id::text like '00000000-0000-4000-8000-0000000161%') as team_fixture_notes,
    (select count(*) from public.fixtures f
      where f.competition_season_id::text like '00000000-0000-4000-8000-0000000151%') as fixtures,
    (select count(*) from public.result_versions rv
      join public.fixtures f on f.id = rv.fixture_id
      where f.competition_season_id::text like '00000000-0000-4000-8000-0000000151%') as result_versions,
    (select count(*) from public.fixture_change_sets fcs
      where fcs.competition_season_id::text like '00000000-0000-4000-8000-0000000151%') as fixture_change_sets,
    (select count(*) from public.fixture_change_items fci
      join public.fixture_change_sets fcs on fcs.id = fci.change_set_id
      where fcs.competition_season_id::text like '00000000-0000-4000-8000-0000000151%') as fixture_change_items,
    (select count(*) from public.fixture_change_history fch
      join public.fixture_change_sets fcs on fcs.id = fch.change_set_id
      where fcs.competition_season_id::text like '00000000-0000-4000-8000-0000000151%') as fixture_change_history,
    (select count(*) from public.admin_audit_log aal
      where coalesce(aal.old_row::text, '') like '%00000000-0000-4000-8000-00000001%'
         or coalesce(aal.new_row::text, '') like '%00000000-0000-4000-8000-00000001%') as admin_audit_log
)
select vc.*,
  (vc.seasons + vc.categories + vc.locations + vc.competitions + vc.competition_seasons
    + vc.teams + vc.team_kickoff_preferences + vc.team_fixture_notes + vc.fixtures
    + vc.result_versions + vc.fixture_change_sets + vc.fixture_change_items
    + vc.fixture_change_history + vc.admin_audit_log) = 0 as all_verification_counts_zero
from verification_counts vc;
