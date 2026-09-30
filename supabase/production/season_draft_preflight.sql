-- READ ONLY. Save this single row before applying the migration.
select
 (select count(*) from public.seasons) as seasons_before,
 (select count(*) from public.competitions) as competitions_before,
 (select count(*) from public.competition_seasons) as competition_seasons_before,
 (select count(*) from public.competition_seasons cs where cs.lifecycle='active') as active_editions_before,
 (select count(*) from public.competition_seasons cs where cs.lifecycle='active' and cs.publication_state='published') as public_active_editions_before,
 (select count(*) from public.teams) as teams_before,
 (select count(*) from public.team_kickoff_preferences) as preferences_before,
 (select count(*) from public.team_fixture_notes) as notes_before,
 (select count(*) from public.fixtures) as fixtures_before,
 (select count(*) from public.result_versions) as result_versions_before,
 (select count(*) from public.standing_adjustments) as adjustments_before,
 (select count(*) from public.admin_audit_log) as audit_rows_before,
 (select count(*) from private.admin_users) as administrators_before;
