-- Module 2: the group's fixed member list. Only the host reads or writes it.
create table public.members (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nickname text not null
    check (nickname = btrim(nickname) and char_length(nickname) between 1 and 30),
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

-- Active nicknames are unique per host, ignoring case. Archived rows keep history
-- and do not block re-adding the same nickname.
create unique index members_active_nickname_key
  on public.members (host_id, lower(nickname))
  where archived_at is null;

alter table public.members enable row level security;

revoke all on table public.members from anon, authenticated;
grant select on table public.members to authenticated;
grant insert (nickname) on table public.members to authenticated;
grant update (nickname, archived_at) on table public.members to authenticated;

create policy "host reads own members" on public.members
  for select to authenticated
  using (host_id = (select auth.uid()));

create policy "host adds own members" on public.members
  for insert to authenticated
  with check (host_id = (select auth.uid()));

create policy "host edits own members" on public.members
  for update to authenticated
  using (host_id = (select auth.uid()))
  with check (host_id = (select auth.uid()));
