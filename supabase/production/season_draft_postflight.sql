-- READ ONLY. Replace every BASELINE_* token with the saved preflight count.
select
 to_regclass('public.season_drafts') is not null as migration_installed,
 to_regprocedure('public.activate_season_draft(uuid,integer,text)') is not null as activation_rpc_installed,
 (select count(*) from public.season_drafts)=0 as no_drafts_created,
 (select count(*) from public.seasons)=/* BASELINE_SEASONS */0 as seasons_unchanged,
 (select count(*) from public.competitions)=/* BASELINE_COMPETITIONS */0 as competitions_unchanged,
 (select count(*) from public.competition_seasons)=/* BASELINE_COMPETITION_SEASONS */0 as editions_unchanged,
 (select count(*) from public.competition_seasons cs where cs.lifecycle='active')=/* BASELINE_ACTIVE_EDITIONS */0 as active_editions_unchanged,
 (select count(*) from public.teams)=/* BASELINE_TEAMS */0 as teams_unchanged,
 (select count(*) from public.team_kickoff_preferences)=/* BASELINE_PREFERENCES */0 as preferences_unchanged,
 (select count(*) from public.team_fixture_notes)=/* BASELINE_NOTES */0 as notes_unchanged,
 (select count(*) from public.fixtures)=/* BASELINE_FIXTURES */0 as fixtures_unchanged,
 (select count(*) from public.result_versions)=/* BASELINE_RESULTS */0 as results_unchanged,
 (select count(*) from public.standing_adjustments)=/* BASELINE_ADJUSTMENTS */0 as adjustments_unchanged,
 (select count(*) from public.admin_audit_log)=/* BASELINE_AUDIT */0 as audit_unchanged,
 (select count(*) from private.admin_users)=/* BASELINE_ADMINS */0 as administrators_unchanged,
 not has_function_privilege('anon','public.activate_season_draft(uuid,integer,text)','execute') as anonymous_grant_absent,
 has_function_privilege('authenticated','public.activate_season_draft(uuid,integer,text)','execute') as authenticated_grant_present,
 (select count(*) from public.competition_seasons cs where cs.lifecycle='active' and cs.publication_state='published')=/* BASELINE_PUBLIC_ACTIVE_EDITIONS */0 as active_visibility_intact,
 to_regclass('public.season_drafts') is not null
  and (select count(*) from public.season_drafts)=0
  and (select count(*) from public.seasons)=/* BASELINE_SEASONS */0
  and (select count(*) from public.competitions)=/* BASELINE_COMPETITIONS */0
  and (select count(*) from public.competition_seasons)=/* BASELINE_COMPETITION_SEASONS */0
  and (select count(*) from public.competition_seasons cs where cs.lifecycle='active')=/* BASELINE_ACTIVE_EDITIONS */0
  and (select count(*) from public.competition_seasons cs where cs.lifecycle='active' and cs.publication_state='published')=/* BASELINE_PUBLIC_ACTIVE_EDITIONS */0
  and (select count(*) from public.teams)=/* BASELINE_TEAMS */0
  and (select count(*) from public.team_kickoff_preferences)=/* BASELINE_PREFERENCES */0
  and (select count(*) from public.team_fixture_notes)=/* BASELINE_NOTES */0
  and (select count(*) from public.fixtures)=/* BASELINE_FIXTURES */0
  and (select count(*) from public.result_versions)=/* BASELINE_RESULTS */0
  and (select count(*) from public.standing_adjustments)=/* BASELINE_ADJUSTMENTS */0
  and (select count(*) from public.admin_audit_log)=/* BASELINE_AUDIT */0
  and (select count(*) from private.admin_users)=/* BASELINE_ADMINS */0 as all_postflight_checks_passed;
