-- LOCAL PREPARATION / REVIEW ONLY. Not executed against a hosted database.
-- Bind planned, unpublished editions explicitly; never creates/activates a season.
-- Confirmed Buckle City policy: ordinary eligible team, no automatic bye or special results.
begin;
do $new_memberships$
declare
  v_monday uuid := nullif(current_setting('fis.preparation.monday_edition', true), '')::uuid;
  v_wednesday uuid := nullif(current_setting('fis.preparation.wednesday_edition', true), '')::uuid;
  target record;
  stored public.teams%rowtype;
begin
  if v_monday is null or v_wednesday is null or v_monday = v_wednesday then
    raise exception 'Explicit distinct draft edition IDs are required';
  end if;
  if not exists (
    select 1 from public.competition_seasons m
    join public.competition_seasons w on m.season_id = w.season_id
    join public.competitions mc on mc.id = m.competition_id
    join public.competitions wc on wc.id = w.competition_id
    where m.id = v_monday and w.id = v_wednesday
      and m.lifecycle = 'planned' and w.lifecycle = 'planned'
      and m.publication_state = 'draft' and w.publication_state = 'draft'
      and mc.weekday = 1 and wc.weekday = 3 and mc.division = 'A' and wc.division = 'A'
      and mc.location_id = wc.location_id
  ) then raise exception 'Expected same-season Monday/Wednesday planned draft editions required'; end if;
  for target in select * from (values
    ('d9611fa9-bb86-4b6c-9ed9-75113b231809'::uuid, v_monday, 'mon-xaywan', 'Xaywan', true),
    ('8b1cff66-c38c-45bd-92a7-7fe80ac89a77'::uuid, v_monday, 'mon-nassaji-fc', 'Nassaji FC', true),
    ('bd8d3bb7-6fde-4e7d-b779-3ed2d92e6d72'::uuid, v_wednesday, 'wed-etihad-fc', 'Etihad FC', true),
    ('36781b64-2197-4a8b-ac2e-bb9c76c5c167'::uuid, v_wednesday, 'wed-buckle-city', 'Buckle City', true)
  ) as entries(id, edition_id, readable_id, name, eligible) loop
    select * into stored from public.teams where id = target.id for update;
    if found then
      if stored.competition_season_id <> target.edition_id or stored.legacy_id is distinct from target.readable_id
        or stored.name <> target.name or stored.status <> 'active' or stored.standings_eligible <> target.eligible then
        raise exception 'Reserved membership UUID conflicts with another record';
      end if;
    else
      -- No reuse by name/old ID, no inherited history/kit and no automatic bye.
      insert into public.teams(id,competition_season_id,legacy_id,name,status,standings_eligible,kit_colour)
      values(target.id,target.edition_id,target.readable_id,target.name,'active',target.eligible,null);
    end if;
  end loop;
end $new_memberships$;
commit;
