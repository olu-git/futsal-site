-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
select fis_fixture_test.assert_disposable();
select
 (select count(*)=1 from public.seasons s where s.name='__FIS season concurrency target__') as one_activation_committed,
 (select count(*)=1 from public.competition_seasons cs join public.seasons s on s.id=cs.season_id where s.name='__FIS season concurrency target__' and cs.lifecycle='active') as one_active_edition,
 (select count(*)=1 from public.teams t join public.competition_seasons cs on cs.id=t.competition_season_id join public.seasons s on s.id=cs.season_id where s.name='__FIS season concurrency target__') as one_team_created,
 (select count(*)=1 from public.team_kickoff_preferences p join public.teams t on t.id=p.team_id join public.competition_seasons cs on cs.id=t.competition_season_id join public.seasons s on s.id=cs.season_id where s.name='__FIS season concurrency target__') as one_preference_created,
 (select count(*)=1 from public.team_fixture_notes n join public.teams t on t.id=n.team_id join public.competition_seasons cs on cs.id=t.competition_season_id join public.seasons s on s.id=cs.season_id where s.name='__FIS season concurrency target__') as one_note_created,
 (select d.status='activated' and d.version=3 from public.season_drafts d where d.name='__FIS season concurrency target__') as session_a_won;
