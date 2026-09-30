-- Read-only. Run before migration and save these counts.
select count(*) as teams_before from public.teams;
select count(*) as adjustments_before from public.standing_adjustments;
select count(*) filter(where publication_state='published') as published_adjustments_before from public.standing_adjustments;
select not exists(select 1 from public.competition_seasons where lifecycle='archived' and publication_state<>'published') as standing_adjustment_migration_ready;
