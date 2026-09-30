-- Expose only the current caller's administrator status. No administrator
-- identity, email address, or membership record is returned.
begin;

create or replace function public.is_fis_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin();
$$;

revoke all on function public.is_fis_admin() from public;
revoke execute on function public.is_fis_admin() from anon;
grant execute on function public.is_fis_admin() to authenticated;

commit;
