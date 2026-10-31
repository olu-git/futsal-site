-- Proposal only. Apply after both reviewed date-only fixture sets are published.
-- The active-season editor has no end-date update action.
-- No fixture, result, identity, lifecycle or permission changes.
begin;
set local lock_timeout = '5s';
do $$
declare
  current_end date;
begin
  select ends_on into strict current_end from public.seasons
  where id = 'ba8c0e2f-7f8a-41be-8ddb-65b320cebaa2'
    and name = '2026 - Season 2' for update;
  if current_end not in (date '2027-05-31', date '2027-06-07') then
    raise exception 'Unexpected current season end date';
  end if;
  if (select max(match_date) from public.fixtures
      where competition_season_id = '62ce7ec9-459e-4acf-bec5-c6734a3199ef'
        and publication_state = 'published' and schedule_status = 'scheduled')
      is distinct from date '2027-06-07'
    or (select max(match_date) from public.fixtures
      where competition_season_id = 'be008d39-f175-45c1-a232-2148d84b1cf9'
        and publication_state = 'published' and schedule_status = 'scheduled')
      is distinct from date '2027-06-02' then
    raise exception 'Publish and verify the two approved postponements first';
  end if;
  if current_end = date '2027-05-31' then
    update public.seasons set ends_on = date '2027-06-07'
    where id = 'ba8c0e2f-7f8a-41be-8ddb-65b320cebaa2';
  end if;
end $$;
commit;
