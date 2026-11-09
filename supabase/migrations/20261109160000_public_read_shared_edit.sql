-- Everyone can view; any signed-in account can edit everything.
-- Accounts are created by the owner in the Supabase dashboard and sign-ups stay
-- disabled, so "signed in" is the only gate for writes.
begin;

-- The per-account policies reference host_id, so they go before the column.
drop policy "host reads own members" on public.members;
drop policy "host adds own members" on public.members;
drop policy "host edits own members" on public.members;

drop index public.members_active_nickname_key;
alter table public.members drop column host_id;

-- Active nicknames are unique across the shared list, ignoring case.
create unique index members_active_nickname_key
  on public.members (lower(nickname))
  where archived_at is null;

grant select on table public.members to anon;

create policy "anyone reads members" on public.members
  for select to anon, authenticated
  using (true);

create policy "signed-in users add members" on public.members
  for insert to authenticated
  with check ((select auth.uid()) is not null);

create policy "signed-in users edit members" on public.members
  for update to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

commit;
