-- APPLIED RECEIPT ONLY. Do not rerun. Original execution and verification evidence: docs/OCTOBER-15-ROSTER-REVISION.md.
-- Narrow organiser-confirmed profile updates, 16 October 2026.
-- Pops soft avoid 21:00; current Wednesday Hazara United -> Kawsar FC.
-- Existing UUIDs, readable IDs, kits, fixtures, scores and history stay intact.
BEGIN;
SET LOCAL timezone='UTC'; SET LOCAL lock_timeout='5s';
DO $$ DECLARE p public.teams%ROWTYPE; h public.teams%ROWTYPE; BEGIN
 SELECT * INTO STRICT p FROM public.teams WHERE id='8902231b-a7f3-474b-96da-c8b3ac09c74b' FOR UPDATE;
 SELECT * INTO STRICT h FROM public.teams WHERE id='3a2cbf2d-326d-4a3b-bd94-56ac4f46a999' FOR UPDATE;
 IF p.name<>'Pops' OR p.competition_season_id<>'be008d39-f175-45c1-a232-2148d84b1cf9' OR p.profile_version<>1 OR EXISTS(SELECT 1 FROM public.team_kickoff_preferences WHERE team_id=p.id) THEN RAISE EXCEPTION 'Pops profile changed; review required'; END IF;
 IF h.name<>'Hazara United' OR h.competition_season_id<>'be008d39-f175-45c1-a232-2148d84b1cf9' OR h.legacy_id<>'wed-hazara-united' OR h.profile_version<>1 THEN RAISE EXCEPTION 'Hazara profile changed; review required'; END IF;
 IF EXISTS(SELECT 1 FROM public.teams WHERE competition_season_id=h.competition_season_id AND lower(btrim(name))='kawsar fc') THEN RAISE EXCEPTION 'Kawsar name collision'; END IF;
END $$;
CREATE TEMP TABLE protected_profile_update ON COMMIT DROP AS
 SELECT 'teams' kind,to_jsonb(t) data FROM public.teams t WHERE id NOT IN('8902231b-a7f3-474b-96da-c8b3ac09c74b','3a2cbf2d-326d-4a3b-bd94-56ac4f46a999')
 UNION ALL SELECT 'preferences',to_jsonb(p) FROM public.team_kickoff_preferences p
 UNION ALL SELECT 'audit',to_jsonb(a) FROM public.admin_audit_log a;
UPDATE public.teams SET profile_version=profile_version+1 WHERE id='8902231b-a7f3-474b-96da-c8b3ac09c74b';
INSERT INTO public.team_kickoff_preferences(team_id,kickoff_time,classification) VALUES ('8902231b-a7f3-474b-96da-c8b3ac09c74b','21:00','avoid');
INSERT INTO public.team_fixture_notes(team_id,notes) VALUES ('8902231b-a7f3-474b-96da-c8b3ac09c74b','Organiser correction, 16 October 2026: Pops prefers to avoid 21:00 (soft); Umoja matches remain at 21:00 under Umoja''s hard rule.')
 ON CONFLICT(team_id) DO UPDATE SET notes=excluded.notes||E'\n\nEarlier private context:\n'||public.team_fixture_notes.notes;
UPDATE public.teams SET name='Kawsar FC',profile_version=profile_version+1 WHERE id='3a2cbf2d-326d-4a3b-bd94-56ac4f46a999';
DO $$ BEGIN
 IF (SELECT md5(jsonb_agg(to_jsonb(f) ORDER BY id)::text) FROM public.fixtures f)<>'7c61ac7435b0faa7eaeb0b03d31bd8ba' OR (SELECT md5(jsonb_agg(to_jsonb(r) ORDER BY id)::text) FROM public.result_versions r)<>'fb8afcb4c1e8fe901add297074502ab0' THEN RAISE EXCEPTION 'Fixtures or results changed; rollback'; END IF;
 IF EXISTS(SELECT data FROM protected_profile_update WHERE kind='teams' EXCEPT SELECT to_jsonb(t) FROM public.teams t) OR EXISTS(SELECT data FROM protected_profile_update WHERE kind='preferences' EXCEPT SELECT to_jsonb(p) FROM public.team_kickoff_preferences p) OR EXISTS(SELECT data FROM protected_profile_update WHERE kind='audit' EXCEPT SELECT to_jsonb(a) FROM public.admin_audit_log a) THEN RAISE EXCEPTION 'Unrelated identity, preferences or audit changed'; END IF;
END $$;
COMMIT;
SELECT t.id,t.name,t.legacy_id,t.kit_colour,t.profile_version FROM public.teams t WHERE t.id IN ('8902231b-a7f3-474b-96da-c8b3ac09c74b','3a2cbf2d-326d-4a3b-bd94-56ac4f46a999');
