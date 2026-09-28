-- DISPOSABLE TEST PROJECT ONLY. Paste and run as one query.
begin;select fis_fixture_test.assert_disposable();create temporary table _fis_adjustment_bootstrap(id integer);
create function pg_temp.assert_true(p_value boolean,p_message text)returns void language plpgsql as $$begin if p_value is not true then raise exception 'Verification failed: %',p_message;end if;end$$;
select set_config('request.jwt.claim.sub',(select au.user_id::text from private.admin_users au limit 1),true);select set_config('request.jwt.claim.role','authenticated',true);select pg_temp.assert_true(auth.uid() is not null and private.is_admin(),'enrolled disposable administrator is required');
insert into public.seasons(id,name,starts_on,ends_on)values('00000000-0000-4000-8000-00000000d901','__FIS adjustment verification__','2099-01-01','2099-12-31');
insert into public.categories(id,code,name)values('00000000-0000-4000-8000-00000000d902','__fis_adjustment_verify__','Verification');
insert into public.locations(id,name,address,active)values('00000000-0000-4000-8000-00000000d903','__FIS adjustment location__','Disposable only',true);
insert into public.competitions(id,category_id,location_id,weekday,division,name)values('00000000-0000-4000-8000-00000000d904','00000000-0000-4000-8000-00000000d902','00000000-0000-4000-8000-00000000d903',1,'VERIFY','Verification');
insert into public.competition_seasons(id,competition_id,season_id,lifecycle,publication_state)values('00000000-0000-4000-8000-00000000d905','00000000-0000-4000-8000-00000000d904','00000000-0000-4000-8000-00000000d901','active','published');
insert into public.teams(id,competition_season_id,name,status,standings_eligible)values('00000000-0000-4000-8000-00000000d906','00000000-0000-4000-8000-00000000d905','__FIS adjustment team__','active',true);
do $v$ declare v_id uuid;v_version bigint;begin
 select r.adjustment_id,r.adjustment_version into v_id,v_version from public.save_standing_adjustment(null,null,'00000000-0000-4000-8000-00000000d905','00000000-0000-4000-8000-00000000d906',0,1,0,0,2,0,3,'Verification adjustment')r;
 perform pg_temp.assert_true(v_version=1,'draft starts at version 1');perform public.transition_standing_adjustment(v_id,1,'pending_review');perform public.transition_standing_adjustment(v_id,2,'published');
 perform pg_temp.assert_true((select a.publication_state='published' and a.version=3 from public.standing_adjustments a where a.id=v_id),'review and publish transition succeeds');
 begin update public.standing_adjustments a set reason='illegal' where a.id=v_id;raise exception 'published update accepted';exception when sqlstate '55000' then null;end;
 perform public.create_standing_adjustment_followup(v_id,'reversal','Reverse verification adjustment');
 perform pg_temp.assert_true((select a.points_delta=-3 and a.adjustment_kind='reversal' from public.standing_adjustments a where a.supersedes_adjustment_id=v_id),'reversal is linked and compensating');
 begin perform public.create_standing_adjustment_followup(v_id,'correction','Duplicate');raise exception 'duplicate follow-up accepted';exception when unique_violation then null;end;
 begin perform public.save_standing_adjustment((select a.id from public.standing_adjustments a where a.supersedes_adjustment_id=v_id),99,'00000000-0000-4000-8000-00000000d905','00000000-0000-4000-8000-00000000d906',0,0,0,0,0,0,-3,'stale');raise exception 'stale save accepted';exception when serialization_failure then null;end;
end$v$;select true as standing_adjustment_verification_passed;rollback;
