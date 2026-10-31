-- Proposal only: emergency venue closure, date-only postponements.
-- Normal admin workflow is unavailable because the browser access host is unavailable.
-- Requires explicit organiser approval before production execution.
-- The existing fixture-version and audit triggers remain enabled.
-- Each date moves to the next playing week, preserving existing calendar exclusions.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';
set local application_name = 'FIS approved November venue postponement';
create temporary table fis_closure_dates (edition uuid, old_date date, new_date date, primary key (edition, old_date)) on commit drop;
insert into fis_closure_dates values
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2026-11-02'::date, '2026-11-09'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2026-11-09'::date, '2026-11-16'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2026-11-16'::date, '2026-11-23'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2026-11-23'::date, '2026-11-30'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2026-11-30'::date, '2026-12-07'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2026-12-07'::date, '2026-12-14'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2026-12-14'::date, '2026-12-21'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2026-12-21'::date, '2027-01-11'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-01-11'::date, '2027-01-18'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-01-18'::date, '2027-01-25'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-01-25'::date, '2027-02-01'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-02-01'::date, '2027-02-08'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-02-08'::date, '2027-02-15'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-02-15'::date, '2027-02-22'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-02-22'::date, '2027-03-01'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-03-01'::date, '2027-03-15'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-03-15'::date, '2027-03-22'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-03-22'::date, '2027-04-05'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-04-05'::date, '2027-04-12'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-04-12'::date, '2027-04-19'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-04-19'::date, '2027-04-26'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-04-26'::date, '2027-05-03'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-05-03'::date, '2027-05-10'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-05-10'::date, '2027-05-17'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-05-17'::date, '2027-05-24'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-05-24'::date, '2027-05-31'::date),
    ('62ce7ec9-459e-4acf-bec5-c6734a3199ef'::uuid, '2027-05-31'::date, '2027-06-07'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2026-11-04'::date, '2026-11-11'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2026-11-11'::date, '2026-11-18'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2026-11-18'::date, '2026-11-25'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2026-11-25'::date, '2026-12-02'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2026-12-02'::date, '2026-12-09'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2026-12-09'::date, '2026-12-16'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2026-12-16'::date, '2026-12-23'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2026-12-23'::date, '2027-01-13'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-01-13'::date, '2027-01-20'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-01-20'::date, '2027-01-27'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-01-27'::date, '2027-02-03'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-02-03'::date, '2027-02-10'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-02-10'::date, '2027-02-17'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-02-17'::date, '2027-02-24'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-02-24'::date, '2027-03-03'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-03-03'::date, '2027-03-10'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-03-10'::date, '2027-03-17'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-03-17'::date, '2027-03-24'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-03-24'::date, '2027-03-31'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-03-31'::date, '2027-04-07'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-04-07'::date, '2027-04-14'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-04-14'::date, '2027-04-21'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-04-21'::date, '2027-04-28'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-04-28'::date, '2027-05-05'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-05-05'::date, '2027-05-12'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-05-12'::date, '2027-05-19'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-05-19'::date, '2027-05-26'::date),
    ('be008d39-f175-45c1-a232-2148d84b1cf9'::uuid, '2027-05-26'::date, '2027-06-02'::date);
do $$
declare
  digest text;
  results_before text;
  results_after text;
  fixture record;
  affected integer := 0;
begin
  -- Lock relevant rows before checking the exact rehearsal baseline.
  perform 1 from public.fixtures
  where competition_season_id in (select distinct edition from fis_closure_dates)
    and publication_state='published' and schedule_status='scheduled'
    and match_date >= date '2026-11-02'
  order by id for update;
  select md5(string_agg(concat_ws('|',id,competition_season_id,round_number,match_date,kickoff_time,court,home_team_id,away_team_id,schedule_version),E'\n' order by id)) into digest
  from public.fixtures where competition_season_id in (select distinct edition from fis_closure_dates)
    and publication_state='published' and schedule_status='scheduled' and match_date >= date '2026-11-02';
  if digest = 'd8709924084ca7ef3556e5faca9c473a' then return; end if;
  if digest is distinct from '9bf3284a290f57b2a9aa834c2c793392' then raise exception 'Schedule changed since rehearsal; stop and review'; end if;
  if exists(select 1 from public.fixtures f join public.result_versions rv on rv.fixture_id=f.id
    where f.competition_season_id in (select distinct edition from fis_closure_dates)
      and f.publication_state='published' and f.schedule_status='scheduled'
      and f.match_date >= date '2026-11-02' and rv.status='published') then
    raise exception 'A targeted match has a published result';
  end if;
  select md5(coalesce(jsonb_agg(to_jsonb(rv) order by rv.id)::text,'[]')) into results_before from public.result_versions rv;
  -- Latest dates first avoids temporary court-slot conflicts with the following round.
  for fixture in select f.id,d.new_date from public.fixtures f join fis_closure_dates d
    on d.edition=f.competition_season_id and d.old_date=f.match_date
    where f.publication_state='published' and f.schedule_status='scheduled'
    order by f.match_date desc,f.id loop
    update public.fixtures set match_date=fixture.new_date where id=fixture.id;
    affected := affected+1;
  end loop;
  if affected <> 440 then raise exception 'Expected 440 date updates, got %',affected; end if;
  select md5(string_agg(concat_ws('|',id,competition_season_id,round_number,match_date,kickoff_time,court,home_team_id,away_team_id,schedule_version),E'\n' order by id)) into digest
  from public.fixtures where competition_season_id in (select distinct edition from fis_closure_dates)
    and publication_state='published' and schedule_status='scheduled' and match_date >= date '2026-11-02';
  if digest is distinct from 'd8709924084ca7ef3556e5faca9c473a' then raise exception 'Postponement verification failed'; end if;
  select md5(coalesce(jsonb_agg(to_jsonb(rv) order by rv.id)::text,'[]')) into results_after from public.result_versions rv;
  if results_before is distinct from results_after then raise exception 'Result history changed'; end if;
end $$;
commit;
