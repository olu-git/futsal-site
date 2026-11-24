-- APPLIED RECEIPT: Monday soft kickoff preferences, 24 November 2026; transaction 1833. DO NOT RERUN.
-- Explicit organiser approval received for this guarded SQL exception; admin automation unavailable.
-- Verified: no fixture, result, identity, kit, status or permission changes. Local rollback/retry checks passed.
BEGIN;
SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='30s';
LOCK TABLE public.teams,public.team_kickoff_preferences,public.team_fixture_notes,public.fixtures,public.result_versions,public.competition_seasons IN SHARE ROW EXCLUSIVE MODE;
CREATE TEMP TABLE soft_teams_before ON COMMIT DROP AS SELECT * FROM public.teams;
CREATE TEMP TABLE soft_prefs_before ON COMMIT DROP AS SELECT * FROM public.team_kickoff_preferences;
CREATE TEMP TABLE soft_notes_before ON COMMIT DROP AS SELECT * FROM public.team_fixture_notes;
CREATE TEMP TABLE soft_fixtures_before ON COMMIT DROP AS SELECT * FROM public.fixtures;
CREATE TEMP TABLE soft_results_before ON COMMIT DROP AS SELECT * FROM public.result_versions;
CREATE TEMP TABLE soft_audit_before ON COMMIT DROP AS SELECT * FROM public.admin_audit_log;
CREATE TEMP TABLE soft_targets(id uuid,name text,version bigint,expected_updated timestamptz,kickoff_time time,note text) ON COMMIT DROP;
INSERT INTO soft_targets VALUES
('38580a95-ab89-5ddd-a71d-c31ed05de4bd','Black Magic',1,'2026-10-15 08:58:03.138018+00','19:00','Organiser update 24 November 2026: soft avoid 19:00; may play then if absolutely necessary. This supersedes any earlier unrestricted-availability assumption for this time.'),
('f0402dd7-5aa2-4a6b-98ee-6d8663c6a76c','Kabul Commandos',2,'2026-11-11 12:56:55.882294+00','21:00','Organiser update 24 November 2026: soft avoid 21:00; may play then if very necessary. This supersedes the earlier unrestricted-availability position for this time.');
DO $$BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.competition_seasons WHERE id='62ce7ec9-459e-4acf-bec5-c6734a3199ef' AND lifecycle='active' AND publication_state='published') THEN RAISE EXCEPTION 'Edition baseline changed'; END IF;
 IF EXISTS(SELECT 1 FROM soft_targets p LEFT JOIN public.teams t ON t.id=p.id WHERE t.id IS NULL OR t.name<>p.name OR t.profile_version<>p.version OR t.updated_at<>p.expected_updated OR t.status<>'active' OR t.competition_season_id<>'62ce7ec9-459e-4acf-bec5-c6734a3199ef') THEN RAISE EXCEPTION 'Team profile baseline changed or already applied'; END IF;
 IF EXISTS(SELECT 1 FROM public.team_kickoff_preferences WHERE team_id IN(SELECT id FROM soft_targets)) THEN RAISE EXCEPTION 'Preferences changed; review before applying'; END IF;
END $$;
INSERT INTO public.team_kickoff_preferences(team_id,kickoff_time,classification) SELECT id,kickoff_time,'avoid' FROM soft_targets;
UPDATE public.teams SET profile_version=profile_version+1 WHERE id IN(SELECT id FROM soft_targets);
INSERT INTO public.team_fixture_notes(team_id,notes)
SELECT p.id,concat_ws(E'\n\n',nullif(b.notes,''),p.note) FROM soft_targets p LEFT JOIN soft_notes_before b ON b.team_id=p.id
ON CONFLICT(team_id) DO UPDATE SET notes=excluded.notes;
DO $$BEGIN
 IF EXISTS(SELECT 1 FROM soft_fixtures_before b FULL JOIN public.fixtures f USING(id) WHERE to_jsonb(b) IS DISTINCT FROM to_jsonb(f)) OR EXISTS(SELECT 1 FROM soft_results_before b FULL JOIN public.result_versions r USING(id) WHERE to_jsonb(b) IS DISTINCT FROM to_jsonb(r)) THEN RAISE EXCEPTION 'Fixtures or results changed'; END IF;
 IF EXISTS(SELECT 1 FROM soft_teams_before b FULL JOIN public.teams t USING(id) WHERE (to_jsonb(b)-'profile_version'-'updated_at') IS DISTINCT FROM (to_jsonb(t)-'profile_version'-'updated_at') OR (b.id NOT IN(SELECT id FROM soft_targets) AND to_jsonb(b) IS DISTINCT FROM to_jsonb(t))) OR EXISTS(SELECT 1 FROM soft_targets p JOIN public.teams t ON t.id=p.id WHERE t.profile_version<>p.version+1) THEN RAISE EXCEPTION 'Unexpected team change'; END IF;
 IF (SELECT count(*) FROM public.team_kickoff_preferences)<>(SELECT count(*)+2 FROM soft_prefs_before) OR (SELECT count(*) FROM soft_targets p JOIN public.team_kickoff_preferences k ON k.team_id=p.id AND k.kickoff_time=p.kickoff_time AND k.classification='avoid')<>2 OR EXISTS(SELECT 1 FROM soft_prefs_before b LEFT JOIN public.team_kickoff_preferences k USING(id) WHERE to_jsonb(b) IS DISTINCT FROM to_jsonb(k)) THEN RAISE EXCEPTION 'Unexpected preference change'; END IF;
 IF EXISTS(SELECT 1 FROM soft_notes_before b FULL JOIN public.team_fixture_notes n USING(team_id) WHERE coalesce(b.team_id,n.team_id) NOT IN(SELECT id FROM soft_targets) AND to_jsonb(b) IS DISTINCT FROM to_jsonb(n)) OR EXISTS(SELECT 1 FROM soft_targets p LEFT JOIN soft_notes_before b ON b.team_id=p.id LEFT JOIN public.team_fixture_notes n ON n.team_id=p.id WHERE n.notes IS DISTINCT FROM concat_ws(E'\n\n',nullif(b.notes,''),p.note)) THEN RAISE EXCEPTION 'Unexpected note change'; END IF;
 IF EXISTS(SELECT 1 FROM soft_audit_before b LEFT JOIN public.admin_audit_log a USING(id) WHERE to_jsonb(b) IS DISTINCT FROM to_jsonb(a)) THEN RAISE EXCEPTION 'Existing audit changed'; END IF;
END $$;
SELECT txid_current() transaction_id,p.name,p.kickoff_time,'avoid (soft)' classification,t.profile_version FROM soft_targets p JOIN public.teams t ON t.id=p.id ORDER BY p.name;
COMMIT;
