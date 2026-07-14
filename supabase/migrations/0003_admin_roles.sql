-- Migration: adds an is_admin flag to profiles for the Team management page.
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

alter table profiles
  add column if not exists is_admin boolean not null default false;

-- Prevent a regular user from self-promoting via a direct API call
-- (the existing "users can update own profile" policy allows updating
-- their own row, but not this specific column, except via the
-- service_role key used by the admin server actions).
create or replace function prevent_self_admin_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and current_user not in ('service_role', 'postgres', 'supabase_admin') then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_admin_escalation on profiles;
create trigger profiles_prevent_admin_escalation
  before update on profiles
  for each row execute procedure prevent_self_admin_escalation();

-- After running this, make yourself an admin (replace with your real email):
-- update profiles set is_admin = true where email = 'you@example.com';
