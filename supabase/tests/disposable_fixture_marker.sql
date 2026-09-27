-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- First confirm the Dashboard project name is exactly fis-fixture-test.
begin;

create schema fis_fixture_test;
revoke all on schema fis_fixture_test from public, anon, authenticated;

create table fis_fixture_test.project_marker (
  project_name text primary key check (project_name = 'fis-fixture-test'),
  disposable_admin_user_id uuid,
  created_at timestamptz not null default now()
);
insert into fis_fixture_test.project_marker(project_name) values ('fis-fixture-test');

create function fis_fixture_test.assert_disposable() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from fis_fixture_test.project_marker where project_name = 'fis-fixture-test') then
    raise exception 'Disposable project marker fis-fixture-test is missing';
  end if;
end;
$$;
revoke all on function fis_fixture_test.assert_disposable() from public, anon, authenticated;

commit;
select fis_fixture_test.assert_disposable();
select project_name from fis_fixture_test.project_marker;
