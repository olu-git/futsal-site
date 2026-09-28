-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
select fis_fixture_test.assert_disposable();
insert into public.seasons(id,name,starts_on,ends_on)values('00000000-0000-4000-8000-00000000e901','__FIS adjustment concurrency__','2099-01-01','2099-12-31');
insert into public.categories(id,code,name)values('00000000-0000-4000-8000-00000000e902','__fis_adjustment_concurrency__','Concurrency');
insert into public.locations(id,name,address,active)values('00000000-0000-4000-8000-00000000e903','__FIS adjustment concurrency__','Disposable only',true);
insert into public.competitions(id,category_id,location_id,weekday,division,name)values('00000000-0000-4000-8000-00000000e904','00000000-0000-4000-8000-00000000e902','00000000-0000-4000-8000-00000000e903',1,'CONCURRENCY','Concurrency');
insert into public.competition_seasons(id,competition_id,season_id,lifecycle,publication_state)values('00000000-0000-4000-8000-00000000e905','00000000-0000-4000-8000-00000000e904','00000000-0000-4000-8000-00000000e901','active','draft');
insert into public.teams(id,competition_season_id,name,status,standings_eligible)values('00000000-0000-4000-8000-00000000e906','00000000-0000-4000-8000-00000000e905','__FIS adjustment concurrency team__','active',true);
insert into public.standing_adjustments(id,competition_season_id,team_id,points_delta,reason)values('00000000-0000-4000-8000-00000000e907','00000000-0000-4000-8000-00000000e905','00000000-0000-4000-8000-00000000e906',1,'Concurrency start');
select version=1 as concurrency_ready from public.standing_adjustments where id='00000000-0000-4000-8000-00000000e907';
