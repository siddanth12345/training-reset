create table public.profiles (
  id uuid primary key,
  username text not null,
  settings jsonb,
  training jsonb,
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[A-Za-z0-9_]{3,20}$')
);
create unique index profiles_username_lower on public.profiles (lower(username));
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.prevent_username_change() returns trigger language plpgsql set search_path = public as $$
begin
  if new.username <> old.username and current_user = 'authenticated' then
    raise exception 'username cannot be changed';
  end if;
  return new;
end $$;
create trigger profiles_lock_username before update on public.profiles for each row execute function public.prevent_username_change();