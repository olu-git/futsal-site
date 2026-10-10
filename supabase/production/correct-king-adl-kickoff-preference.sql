-- PREPARED ONLY. Do not execute without separate production-write authorisation.
-- Organiser correction 10 October 2026: Monday King ADL has no kickoff preference.
-- Run before new draft creation. No fixtures, kits, IDs or history are rewritten.
begin;
do $correction$
declare t public.teams%rowtype; p public.team_kickoff_preferences%rowtype;
begin
 if current_user<>'postgres' and not coalesce(public.is_fis_admin(),false) then raise exception 'Administrator access required'; end if;
 select * into t from public.teams where id='04ebec43-f537-52b4-bbae-ffe3449b7826' for update;
 if not found or t.name<>'King ADL' or t.competition_season_id<>'8021a2bb-eb2b-55fe-9900-d3f50facf092'
  or t.legacy_id not in ('mon-toss','mon-king-adl') or t.status<>'active' then raise exception 'King ADL identity changed: stop'; end if;
 if not exists(select 1 from public.competition_seasons where id=t.competition_season_id and lifecycle='active' and publication_state='published') then raise exception 'Source edition changed: stop'; end if;
 select * into p from public.team_kickoff_preferences where id='a04c3160-7c38-4dd9-b0d2-73bb4d73f649' for update;
 if not found then
  if exists(select 1 from public.team_kickoff_preferences where team_id=t.id) then raise exception 'Other preferences exist: review rather than delete'; end if;
  return; -- Already corrected; safe repeat does not advance version.
 end if;
 if p.team_id<>t.id or p.kickoff_time<>'19:00'::time or p.classification<>'preferred'
  or p.created_at<>'2026-10-09T20:00:03.54453+00:00'::timestamptz
  or p.updated_at<>p.created_at or t.profile_version<>2
  or (select count(*) from public.team_kickoff_preferences where team_id=t.id)<>1
  or exists(select 1 from public.team_fixture_notes where team_id=t.id) then raise exception 'Recorded profile changed: stop and review'; end if;
 delete from public.team_kickoff_preferences where id=p.id and team_id=t.id;
 update public.teams set profile_version=profile_version+1 where id=t.id;
 -- Existing audit triggers preserve the deletion and team version update.
end $correction$;
commit;
