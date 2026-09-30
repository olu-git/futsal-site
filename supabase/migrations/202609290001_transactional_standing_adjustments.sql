begin;

alter table public.standing_adjustments add column version bigint not null default 1 check (version > 0);
alter table public.standing_adjustments add column adjustment_kind text not null default 'standard' check (adjustment_kind in ('standard','correction','reversal'));
alter table public.standing_adjustments add column supersedes_adjustment_id uuid references public.standing_adjustments(id) on delete restrict;
alter table public.standing_adjustments add column published_at timestamptz;
alter table public.standing_adjustments drop constraint standing_adjustments_publication_state_check;
alter table public.standing_adjustments add constraint standing_adjustments_publication_state_check check (publication_state in ('draft','pending_review','published'));
alter table public.standing_adjustments add constraint standing_adjustments_followup_shape check (
  (adjustment_kind = 'standard' and supersedes_adjustment_id is null) or
  (adjustment_kind in ('correction','reversal') and supersedes_adjustment_id is not null)
);
create unique index standing_adjustments_one_followup on public.standing_adjustments(supersedes_adjustment_id) where supersedes_adjustment_id is not null;

create function private.protect_published_standing_adjustment() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.publication_state = 'published' then raise exception using errcode='55000', message='Published standing adjustments are immutable'; end if;
  return case when tg_op='DELETE' then old else new end;
end;
$$;
create trigger standing_adjustments_protect_published before update or delete on public.standing_adjustments
for each row execute function private.protect_published_standing_adjustment();

create function public.save_standing_adjustment(
  p_adjustment_id uuid, p_expected_version bigint, p_competition_season_id uuid, p_team_id uuid,
  p_played_delta integer, p_wins_delta integer, p_draws_delta integer, p_losses_delta integer,
  p_goals_for_delta integer, p_goals_against_delta integer, p_points_delta integer, p_reason text
) returns table(adjustment_id uuid, adjustment_version bigint, adjustment_state text)
language plpgsql security definer set search_path='' as $$
declare v_adjustment public.standing_adjustments%rowtype; v_id uuid;
begin
  if not private.is_admin() then raise exception using errcode='42501',message='Administrator access required'; end if;
  if btrim(coalesce(p_reason,''))='' then raise exception using errcode='22023',message='Adjustment reason is required'; end if;
  if not exists(select 1 from public.teams t where t.id=p_team_id and t.competition_season_id=p_competition_season_id) then raise exception using errcode='23503',message='Team does not belong to the competition season'; end if;
  if private.competition_season_is_archived(p_competition_season_id) then raise exception using errcode='55000',message='Archived competition seasons are read-only'; end if;
  if p_adjustment_id is null then
    insert into public.standing_adjustments(competition_season_id,team_id,played_delta,wins_delta,draws_delta,losses_delta,goals_for_delta,goals_against_delta,points_delta,reason,publication_state)
    values(p_competition_season_id,p_team_id,p_played_delta,p_wins_delta,p_draws_delta,p_losses_delta,p_goals_for_delta,p_goals_against_delta,p_points_delta,btrim(p_reason),'draft') returning id into v_id;
  else
    select a.* into v_adjustment from public.standing_adjustments a where a.id=p_adjustment_id for update;
    if not found then raise exception using errcode='P0002',message='Standing adjustment not found'; end if;
    if v_adjustment.version<>p_expected_version then raise exception using errcode='40001',message='Stale standing adjustment: changed since the editor loaded it'; end if;
    if v_adjustment.publication_state<>'draft' then raise exception using errcode='55000',message='Only draft adjustments can be edited'; end if;
    update public.standing_adjustments a set played_delta=p_played_delta,wins_delta=p_wins_delta,draws_delta=p_draws_delta,losses_delta=p_losses_delta,goals_for_delta=p_goals_for_delta,goals_against_delta=p_goals_against_delta,points_delta=p_points_delta,reason=btrim(p_reason),version=a.version+1 where a.id=p_adjustment_id returning a.id into v_id;
  end if;
  return query select a.id,a.version,a.publication_state from public.standing_adjustments a where a.id=v_id;
end;$$;

create function public.transition_standing_adjustment(p_adjustment_id uuid,p_expected_version bigint,p_target_state text)
returns table(adjustment_id uuid,adjustment_version bigint,adjustment_state text)
language plpgsql security definer set search_path='' as $$
declare v_adjustment public.standing_adjustments%rowtype;
begin
 if not private.is_admin() then raise exception using errcode='42501',message='Administrator access required'; end if;
 select a.* into v_adjustment from public.standing_adjustments a where a.id=p_adjustment_id for update;
 if not found then raise exception using errcode='P0002',message='Standing adjustment not found'; end if;
 if v_adjustment.version<>p_expected_version then raise exception using errcode='40001',message='Stale standing adjustment: changed since the editor loaded it'; end if;
 if private.competition_season_is_archived(v_adjustment.competition_season_id) then raise exception using errcode='55000',message='Archived competition seasons are read-only'; end if;
 if not ((v_adjustment.publication_state='draft' and p_target_state in ('pending_review','published')) or (v_adjustment.publication_state='pending_review' and p_target_state in ('draft','published'))) then raise exception using errcode='55000',message='Invalid standing adjustment transition'; end if;
 if p_target_state in ('pending_review','published') and (v_adjustment.played_delta=0 and v_adjustment.wins_delta=0 and v_adjustment.draws_delta=0 and v_adjustment.losses_delta=0 and v_adjustment.goals_for_delta=0 and v_adjustment.goals_against_delta=0 and v_adjustment.points_delta=0) then raise exception using errcode='22023',message='At least one standing value must change'; end if;
 update public.standing_adjustments a set publication_state=p_target_state,version=a.version+1,published_at=case when p_target_state='published' then now() else a.published_at end where a.id=p_adjustment_id;
 return query select a.id,a.version,a.publication_state from public.standing_adjustments a where a.id=p_adjustment_id;
end;$$;

create function public.create_standing_adjustment_followup(p_original_adjustment_id uuid,p_kind text,p_reason text)
returns table(adjustment_id uuid,adjustment_version bigint,adjustment_state text)
language plpgsql security definer set search_path='' as $$
declare v_original public.standing_adjustments%rowtype; v_id uuid;
begin
 if not private.is_admin() then raise exception using errcode='42501',message='Administrator access required'; end if;
 if p_kind not in ('correction','reversal') then raise exception using errcode='22023',message='Follow-up kind must be correction or reversal'; end if;
 if btrim(coalesce(p_reason,''))='' then raise exception using errcode='22023',message='Correction or reversal reason is required'; end if;
 select a.* into v_original from public.standing_adjustments a where a.id=p_original_adjustment_id for update;
 if not found or v_original.publication_state<>'published' then raise exception using errcode='55000',message='Only published adjustments can have a correction or reversal'; end if;
 if exists(select 1 from public.standing_adjustments a where a.supersedes_adjustment_id=p_original_adjustment_id) then raise exception using errcode='23505',message='This adjustment already has a correction or reversal'; end if;
 insert into public.standing_adjustments(competition_season_id,team_id,played_delta,wins_delta,draws_delta,losses_delta,goals_for_delta,goals_against_delta,points_delta,reason,publication_state,adjustment_kind,supersedes_adjustment_id)
 values(v_original.competition_season_id,v_original.team_id,case when p_kind='reversal' then -v_original.played_delta else 0 end,case when p_kind='reversal' then -v_original.wins_delta else 0 end,case when p_kind='reversal' then -v_original.draws_delta else 0 end,case when p_kind='reversal' then -v_original.losses_delta else 0 end,case when p_kind='reversal' then -v_original.goals_for_delta else 0 end,case when p_kind='reversal' then -v_original.goals_against_delta else 0 end,case when p_kind='reversal' then -v_original.points_delta else 0 end,btrim(p_reason),'draft',p_kind,p_original_adjustment_id) returning id into v_id;
 return query select a.id,a.version,a.publication_state from public.standing_adjustments a where a.id=v_id;
end;$$;

revoke all on function public.save_standing_adjustment(uuid,bigint,uuid,uuid,integer,integer,integer,integer,integer,integer,integer,text) from public,anon;
revoke all on function public.transition_standing_adjustment(uuid,bigint,text) from public,anon;
revoke all on function public.create_standing_adjustment_followup(uuid,text,text) from public,anon;
grant execute on function public.save_standing_adjustment(uuid,bigint,uuid,uuid,integer,integer,integer,integer,integer,integer,integer,text) to authenticated;
grant execute on function public.transition_standing_adjustment(uuid,bigint,text) to authenticated;
grant execute on function public.create_standing_adjustment_followup(uuid,text,text) to authenticated;
commit;
