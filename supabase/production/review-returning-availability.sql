-- PREPARED READ-ONLY REVIEW ONLY; not executed on hosted services by this preparation.
-- Run using existing authorised Supabase SQL Editor postgres access or an authenticated
-- FIS administrator SQL session. Never add grants, bypass RLS, or paste credentials.
-- Output: team name, night, scheduling preferences only. UUIDs are internal filters.
-- Private free-text notes are NOT exported: they may contain unrelated personal data.
-- If any statement fails, run ROLLBACK and stop. An access error is not an empty profile.
begin transaction read only;

do $access$
begin
  if current_user <> 'postgres' and not coalesce(public.is_fis_admin(),false) then
    raise exception 'Authorised SQL Editor or FIS administrator access is required; stop review';
  end if;
end $access$;

with returning_roster(team_name,weekday,team_id) as (
  values
    ('AFG', 1, 'b6374b74-1c92-5796-a39f-c0935ec5bfee'::uuid),
    ('Blue Dragons', 1, '5abfb2ea-6371-553f-a0d6-183433a5da64'::uuid),
    ('Goldlink Up', 1, '48bde0c2-9466-5ef4-8b84-8f150f0daf28'::uuid),
    ('Misfits', 1, 'b86d5ed5-20cc-5e3a-957f-0ee36cf400f1'::uuid),
    ('Ghazni United', 1, '49af3e93-876c-5538-af80-0e0acef919e7'::uuid),
    ('Wildcats', 1, '31dc0cdb-ec3c-5497-ba57-c24a9256a68f'::uuid),
    ('Salvos', 1, 'fb74c735-3291-5c0f-9903-2886d57fa33c'::uuid),
    ('Hunger FC', 1, '4a71b16e-3503-5414-a122-5cf9d593fbe3'::uuid),
    ('King ADL', 1, '04ebec43-f537-52b4-bbae-ffe3449b7826'::uuid),
    ('Hope', 1, '7d4f7cde-d0fc-587e-81a0-242d7037e14e'::uuid),
    ('Bunyip', 1, 'c45d3081-6fd9-5cfd-ad32-c9c7f5ed37b2'::uuid),
    ('Declan''s Delinquents', 1, '5ab40935-7320-536b-a625-13661e1cdb8d'::uuid),
    ('AFG', 3, 'cfc5c915-1f34-5995-96d1-ef4b62d7c93f'::uuid),
    ('Goldlink Up', 3, 'd098c8c3-bfa2-5c4f-b627-f1c0bbe59df7'::uuid),
    ('Misfits', 3, '67c0aaae-329e-5c95-9217-392c74046dcb'::uuid),
    ('Ghazni United', 3, '24c8ab29-64f4-597f-97df-571b62a5bbb3'::uuid),
    ('Pops', 3, '41c7b7cf-7d53-50ea-a393-dbc1aa1db852'::uuid),
    ('Rinnai', 3, 'fc2b2203-9a12-5a25-9b99-6370c00a5dc7'::uuid),
    ('Unathletico', 3, '457fcb9b-aecd-550f-8b2a-711e5b1a3158'::uuid),
    ('Wildcats', 3, '5dae69e2-1e55-563e-8a0b-25f80f845677'::uuid),
    ('Hazara United', 3, '31e79707-81a2-5ff2-abfd-2e42537855df'::uuid),
    ('King ADL', 3, '402549b9-1e74-51ff-b058-9749e72ddd74'::uuid),
    ('Ibiza', 3, 'f4874f8a-c472-5fb7-8984-46e8f0506f5a'::uuid),
    ('Umoja Stars', 3, 'ce320e94-4be0-511b-b78b-7dcad3b8d9b0'::uuid),
    ('MTS FC', 3, '22d0eada-cd6e-5aee-a447-c74f5c07a371'::uuid),
    ('Kuq E Zi', 3, '629727a3-27fb-59de-a790-c578aeffd38f'::uuid)
)
select r.team_name as team,
       case r.weekday when 1 then 'Monday' else 'Wednesday' end as night,
       case when t.id is null or c.weekday is distinct from r.weekday
         then jsonb_build_object('review_status','Membership missing, hidden or night mismatch: stop and resolve identity; do not assume unrestricted availability')
         else jsonb_build_object(
           'review_status','Recorded preferences only; compare against draft and review any private scheduling note',
           'kickoff_rules',coalesce((
             select jsonb_agg(jsonb_build_object('time',to_char(p.kickoff_time,'HH24:MI'),'strength',p.classification) order by p.kickoff_time)
             from public.team_kickoff_preferences p where p.team_id=r.team_id
           ),'[]'::jsonb),
           'private_note_review_required',exists(
             select 1 from public.team_fixture_notes n where n.team_id=r.team_id and nullif(btrim(n.notes),'') is not null
           )
         ) end as scheduling_preferences
from returning_roster r
left join public.teams t on t.id=r.team_id
left join public.competition_seasons cs on cs.id=t.competition_season_id
left join public.competitions c on c.id=cs.competition_id
order by r.weekday,r.team_name;

rollback;
