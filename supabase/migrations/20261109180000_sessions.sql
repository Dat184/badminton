-- Module 3: sessions and who is coming. Internal app: anyone with the link may
-- create sessions and tick attendance without logging in.
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  play_date date not null check (play_date between '2000-01-01' and '2100-12-31'),
  start_time time,
  venue text check (venue = btrim(venue) and char_length(venue) between 1 and 60),
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create index sessions_active_play_date_idx
  on public.sessions (play_date desc, start_time desc)
  where archived_at is null;

-- A row is either a member (member_id) or a guest typed for this session only.
create table public.session_attendees (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  member_id uuid references public.members (id),
  guest_name text
    check (guest_name = btrim(guest_name) and char_length(guest_name) between 1 and 30),
  created_at timestamptz not null default now(),
  constraint session_attendees_member_or_guest check ((member_id is null) <> (guest_name is null))
);

create unique index session_attendees_member_key
  on public.session_attendees (session_id, member_id)
  where member_id is not null;

create unique index session_attendees_guest_key
  on public.session_attendees (session_id, lower(guest_name))
  where guest_name is not null;

-- Attendance may change only while this returns true. Module 5 redefines it to
-- also exclude sessions whose costs are split.
create function public.session_is_open(p_session_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.sessions s
    where s.id = p_session_id and s.archived_at is null
  );
$$;

alter table public.sessions enable row level security;
alter table public.session_attendees enable row level security;

revoke all on table public.sessions from anon, authenticated;
grant select on table public.sessions to anon, authenticated;
grant insert (play_date, start_time, venue) on table public.sessions to anon, authenticated;
grant update (play_date, start_time, venue, archived_at) on table public.sessions to anon, authenticated;

revoke all on table public.session_attendees from anon, authenticated;
grant select on table public.session_attendees to anon, authenticated;
grant insert (session_id, member_id, guest_name) on table public.session_attendees to anon, authenticated;
grant delete on table public.session_attendees to anon, authenticated;

create policy "anyone reads sessions" on public.sessions
  for select to anon, authenticated using (true);
create policy "anyone creates sessions" on public.sessions
  for insert to anon, authenticated with check (true);
create policy "anyone edits active sessions" on public.sessions
  for update to anon, authenticated using (archived_at is null) with check (true);

create policy "anyone reads attendees" on public.session_attendees
  for select to anon, authenticated using (true);
create policy "anyone joins an open session" on public.session_attendees
  for insert to anon, authenticated with check (public.session_is_open(session_id));
create policy "anyone leaves an open session" on public.session_attendees
  for delete to anon, authenticated using (public.session_is_open(session_id));
