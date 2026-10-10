-- PREPARED ONLY: verified in local in-memory Postgres, never executed on a hosted DB.
-- Run before season activation; never bypass archived-record protection.
-- Readable IDs only. Team PKs, memberships, kits and all child references stay intact.
begin;
do $identity_update$
declare
  target record;
  stored public.teams%rowtype;
begin
  for target in select * from (values
    ('04ebec43-f537-52b4-bbae-ffe3449b7826'::uuid, '8021a2bb-eb2b-55fe-9900-d3f50facf092'::uuid, 'mon-toss', 'mon-king-adl', 'King ADL'),
    ('402549b9-1e74-51ff-b058-9749e72ddd74'::uuid, 'e1db4456-0663-55d2-95a1-681d17163b91'::uuid, 'wed-toss', 'wed-king-adl', 'King ADL'),
    ('5ab40935-7320-536b-a625-13661e1cdb8d'::uuid, '8021a2bb-eb2b-55fe-9900-d3f50facf092'::uuid, 'mon-declans-team', 'mon-declans-delinquents', 'Declan''s Delinquents'),
    ('629727a3-27fb-59de-a790-c578aeffd38f'::uuid, 'e1db4456-0663-55d2-95a1-681d17163b91'::uuid, 'wed-xaywan', 'wed-kuq-e-zi', 'Kuq E Zi')
  ) as changes(id, edition_id, old_id, new_id, expected_name) loop
    select * into stored from public.teams where id = target.id for update;
    if not found or stored.competition_season_id <> target.edition_id
      or stored.name <> target.expected_name or stored.status <> 'active'
      or stored.legacy_id not in (target.old_id, target.new_id) or stored.legacy_id is null then
      raise exception 'Team identity precondition failed for %', target.id;
    end if;
    if not exists (select 1 from public.competition_seasons where id = target.edition_id and lifecycle = 'active' and publication_state = 'published') then
      raise exception 'Expected active published edition unavailable';
    end if;
    if exists (select 1 from public.teams where competition_season_id = target.edition_id and legacy_id = target.new_id and id <> target.id) then
      raise exception 'Requested readable ID already belongs to another team';
    end if;
    if stored.legacy_id = target.old_id then
      update public.teams set legacy_id = target.new_id where id = target.id;
    end if;
  end loop;
end $identity_update$;
commit;
