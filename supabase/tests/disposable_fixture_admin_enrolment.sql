-- DISPOSABLE TEST PROJECT ONLY — DO NOT RUN IN PRODUCTION
-- Replace the placeholder with the UUID shown for the disposable Auth user.
-- Create and confirm contact@futsalindoorsoccer.com.au in this project's Auth dashboard first.
begin;
select fis_fixture_test.assert_disposable();

do $$
declare
  user_id_text text := 'REPLACE_WITH_DISPOSABLE_ADMIN_USER_UUID';
  disposable_user_id uuid;
begin
  if user_id_text = 'REPLACE_WITH_DISPOSABLE_ADMIN_USER_UUID' then
    raise exception 'Replace REPLACE_WITH_DISPOSABLE_ADMIN_USER_UUID before enrolment';
  end if;
  begin
    disposable_user_id := user_id_text::uuid;
  exception when invalid_text_representation then
    raise exception 'Disposable administrator ID is not a valid UUID';
  end;
  if not exists (
    select 1 from auth.users u where u.id = disposable_user_id
      and lower(u.email) = 'contact@futsalindoorsoccer.com.au'
      and u.email_confirmed_at is not null
  ) then
    raise exception 'Disposable Auth user is missing, has the wrong email, or is not confirmed';
  end if;
  if exists (select 1 from private.admin_users) then
    raise exception 'An administrator membership already exists in this disposable project';
  end if;
  insert into private.admin_users(user_id) values (disposable_user_id);
  update fis_fixture_test.project_marker set disposable_admin_user_id = disposable_user_id
    where project_name = 'fis-fixture-test';
end;
$$;

select set_config('request.jwt.claim.sub', (select user_id::text from private.admin_users), true);
set local role authenticated;
do $$
begin
  if public.is_fis_admin() is not true then
    raise exception 'is_fis_admin() did not recognise the disposable administrator';
  end if;
end;
$$;
select public.is_fis_admin() as disposable_admin_verified;
reset role;
commit;
