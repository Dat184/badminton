# Module 3: Sessions and Self Check-in Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anyone, without logging in, can create a badminton session, open its page, and tick themselves in or out; guests who are not in the member list can be added by name to one session.

**Architecture:** Two new public tables, `sessions` and `session_attendees`, readable and writable by `anon` within narrow column grants; RLS lets attendance change only while the session is open (`public.session_is_open()`, which Module 5 redefines to also exclude split sessions). Server-only data functions in `src/server/sessions.ts`, `"use server"` actions in `src/features/sessions/actions.ts` (no `requireHost()`: these are public by design), pages `/sessions/new` and `/sessions/[id]`, and a session list on the home page.

**Tech Stack:** Next.js 16.4.5 (App Router, `cacheComponents: true`, `partialPrefetching: true`), React 19.3 (`useActionState`, `useOptimistic`), `@supabase/ssr` (from Module 1), Postgres RLS on Supabase, shadcn/ui (`base-nova`).

**Spec:** No separate spec. Scope agreed in chat on 2026-11-09:

- Members create sessions themselves, no login (internal app; the owner accepts that anyone with the link can create, edit, tick or untick for anyone).
- A session's page lists every active member; each person ticks themselves in or out.
- Guests: a session has an "add person" box; the guest belongs to that session only (never joins the member list) and later splits costs like everyone else.
- Costs, the "Chia tiền" button, rounding and the group fund are Module 5. Shuttle types are Module 4.
- MVP: smallest thing that works.

Calls made by the planner (not discussed with the owner; flagged for review): a session stores a date (required), a start time (optional) and a court/venue name (optional, ≤ 60 characters); anyone can edit those three fields or delete a session, and deleting archives it (`archived_at`), like members; the home page shows the 30 most recent sessions, newest date first; guests are listed in the same "Ai đi?" list with a `khách` tag; attendance checkboxes are native `<input type="checkbox">` rows (large tap target, no new shadcn component).

## Global Constraints

- No automated tests (owner's decision). A task is verified by `npm run format:check && npm run lint && npm run typecheck && npm run build` plus the explicit curl/browser checks in its steps.
- Repo docs and code comments in English; user-facing UI text in Vietnamese, exactly as listed under "UI copy".
- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code — in particular `01-app/03-api-reference/03-file-conventions/dynamic-routes.md` ("With Cache Components"): `params` is a Promise and, without `generateStaticParams`, must be awaited inside `<Suspense>`. Anything that reads cookies or the clock renders inside `<Suspense>` after `await connection()` (outside any try/catch, as `PublicMemberList` does).
- After a successful write, actions call `refresh()` from `next/cache`, except `createSession` and `deleteSession`, which `redirect()`.
- All database access goes through `createSupabaseServerClient()`. No service-role / secret key. Visitors who are not signed in reach Postgres as `anon`; signed-in editors as `authenticated` — every policy and grant in this module covers both.
- Session actions do **not** call `requireHost()`. Member and admin actions keep calling it.
- Sessions are never hard-deleted (`archived_at`). `session_attendees` is the one table that grants `DELETE` (unticking removes the row).
- Dates are plain `YYYY-MM-DD` strings in the Vietnam calendar; never pass them through a local-time `Date`. Format with `timeZone: "UTC"` on a `YYYY-MM-DDT00:00:00Z` instant.
- Work on branch `feat/module-3-sessions` created from `main`. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Running migrations (test project only; production is automatic on merge) and pushing to GitHub are owner-gated: the executor asks first.

### UI copy (Vietnamese, exact)

| Where                                        | Text                                                   |
| -------------------------------------------- | ------------------------------------------------------ |
| Home section heading                         | `Buổi đánh`                                            |
| Home "new" link (styled as a button)         | `Tạo buổi`                                             |
| Home empty list                              | `Chưa có buổi nào.`                                    |
| Home row, second line                        | `{n} người đi`                                         |
| `/sessions/new` page title and heading       | `Tạo buổi đánh`                                        |
| Back link (new + detail pages)               | `← Trang chủ`                                          |
| Field labels                                 | `Ngày`, `Giờ (không bắt buộc)`, `Sân (không bắt buộc)` |
| Venue placeholder                            | `Ví dụ: Sân Kỳ Hòa`                                    |
| Create button / pending                      | `Tạo buổi` / `Đang tạo…`                               |
| Detail page title                            | `Buổi đánh`                                            |
| Detail header buttons                        | `Sửa`, `Xóa buổi`                                      |
| Edit buttons / save pending                  | `Lưu` / `Đang lưu…`, `Hủy`                             |
| Delete confirmation                          | `Xóa buổi {date}?`                                     |
| Delete buttons / pending                     | `Xóa` / `Đang xóa…`, `Hủy`                             |
| Attendance heading                           | `Ai đi? ({n})`                                         |
| Attendance hint                              | `Bấm vào tên mình để báo đi hoặc không đi.`            |
| Guest tag                                    | `khách`                                                |
| Guest remove button (`aria-label`)           | `Bỏ` (`Bỏ {name}`)                                     |
| Guest input `aria-label` / placeholder       | `Tên người ngoài nhóm` / `Thêm người ngoài nhóm`       |
| Guest add button / pending                   | `Thêm` / `Đang thêm…`                                  |
| No active members                            | `Chưa có thành viên nào.`                              |
| Error: no date                               | `Chọn ngày.`                                           |
| Error: bad date                              | `Ngày không hợp lệ.`                                   |
| Error: bad time                              | `Giờ không hợp lệ.`                                    |
| Error: venue too long                        | `Tên sân tối đa 60 ký tự.`                             |
| Error: guest name empty                      | `Nhập tên.`                                            |
| Error: guest name too long                   | `Tên tối đa 30 ký tự.`                                 |
| Error: guest name already in this session    | `Tên này đã có trong buổi.`                            |
| Error: session deleted / unknown             | `Buổi này không còn nữa.`                              |
| Error: any other write failure               | `Không lưu được, vui lòng thử lại.`                    |
| Error: list or session failed to load        | `Không tải được buổi đánh, vui lòng tải lại trang.`    |
| Detail page for a missing/deleted/invalid id | `Không tìm thấy buổi đánh này.`                        |
| Suspense fallback                            | `Đang tải…`                                            |

Session date display everywhere: `Thứ Bảy, 14/11/2026`, then ` · 19:00` if there is a time, then ` · {venue}` if there is a venue.

## Review Focus

1. **Anyone with the publishable key calling the REST API directly.** Expected: `anon` can read sessions/attendees, create and edit sessions, tick/untick — but cannot `DELETE` a session, cannot write `members`, and cannot tick into a deleted session. Pinned by Task 1 Step 4.
2. **Two people ticking the same member at once, or a double tap.** Expected: one row; the second insert hits the unique index and the action treats it as success. Pinned by Task 1's unique index, Task 2 Step 3 (`23505` on tick → ok), Task 4 Step 4 item 6.
3. **A stale tab acting on a session deleted elsewhere** (tick, add guest, edit, delete). Expected: `Buổi này không còn nữa.`, no crash. Pinned by Task 2 Step 3 and Task 4 Step 4 item 9.
4. **The date shifting by one day** on Vercel (UTC) or a phone in another timezone. Expected: the date picked is the date shown. Pinned by Task 2 Step 1 (`formatSessionDate`) and Task 3 Step 4 item 2.
5. **A member removed from the list after attending.** Expected: still shown (ticked) in that session, and can still be unticked there; not offered in other sessions. Pinned by Task 4 Step 2 and Task 4 Step 4 item 8.

---

## File Structure

| Path                                                   | Change | Responsibility                                                     |
| ------------------------------------------------------ | ------ | ------------------------------------------------------------------ |
| `supabase/migrations/20261109180000_sessions.sql`      | Create | `sessions`, `session_attendees`, `session_is_open()`, grants, RLS  |
| `AGENTS.md`                                            | Modify | Database section: public-write tables, the one `DELETE` grant      |
| `src/lib/names.ts`                                     | Create | `normalizeName()`, `nameLength()` (moved out of `member.ts`)       |
| `src/features/members/member.ts`                       | Modify | `parseNickname()` uses `normalizeName()` (behavior unchanged)      |
| `src/lib/dates.ts`                                     | Create | `todayInVietnam()`, `formatSessionDate()`, `formatSessionWhen()`   |
| `src/features/sessions/session.ts`                     | Create | Types, `parseSessionForm()`, `parseGuestName()` (pure)             |
| `src/server/sessions.ts`                               | Create | Server-only queries/writes                                         |
| `src/features/sessions/actions.ts`                     | Create | Public server actions                                              |
| `src/features/sessions/components/session-form.tsx`    | Create | Client form, shared by create and edit                             |
| `src/features/sessions/components/session-list.tsx`    | Create | Home page list (server)                                            |
| `src/features/sessions/components/session-detail.tsx`  | Create | `SessionDetailView` (server): loads data, composes the parts below |
| `src/features/sessions/components/session-header.tsx`  | Create | Client: date line, view / edit / confirm-delete                    |
| `src/features/sessions/components/attendance-list.tsx` | Create | Client: member checkboxes, guests with remove, add-guest form      |
| `src/app/page.tsx`                                     | Modify | Add `SessionList` above the member list                            |
| `src/app/sessions/new/page.tsx`                        | Create | Create page                                                        |
| `src/app/sessions/[id]/page.tsx`                       | Create | Detail page                                                        |

---

### Task 1: Sessions and attendance tables

**Files:** Create `supabase/migrations/20261109180000_sessions.sql`; Modify `AGENTS.md`

**Interfaces:**

- Produces: `public.sessions (id uuid, play_date date, start_time time, venue text, archived_at timestamptz, created_at timestamptz)`; `public.session_attendees (id uuid, session_id uuid, member_id uuid null, guest_name text null, created_at timestamptz)`; `public.session_is_open(p_session_id uuid) returns boolean`.

- [ ] **Step 1: Create branch** — `git switch -c feat/module-3-sessions main`
- [ ] **Step 2: Write the migration** (exact):

```sql
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
```

- [ ] **Step 3 (owner-gated): Apply it to the test project** — with the CLI linked to the test project: `npx supabase db push --remote --dry-run` must list exactly this file, then `npx supabase db push --remote`. Never through the SQL Editor (see `AGENTS.md` → Database). The executor asks the owner before running it.
- [ ] **Step 4: Verify access with the publishable key** (load env with `set -a; . ./.env.local; set +a`; never print the values; headers `apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, plus `Content-Type: application/json` and `Prefer: return=representation` on writes):
  1. `POST /rest/v1/sessions` body `{"play_date":"2026-11-14","venue":"anon-probe"}` → HTTP 201, body has an `id`. Keep it as `$SID`.
  2. `POST /rest/v1/session_attendees` body `{"session_id":"$SID","guest_name":"probe"}` → 201.
  3. `DELETE /rest/v1/sessions?id=eq.$SID` → body contains `"code":"42501"` (no delete grant).
  4. `PATCH /rest/v1/sessions?id=eq.$SID` body `{"archived_at":"2026-11-09T00:00:00Z"}` → 200.
  5. `POST /rest/v1/session_attendees` body `{"session_id":"$SID","guest_name":"probe2"}` → `"code":"42501"` (RLS: session no longer open).
  6. `POST /rest/v1/members` body `{"nickname":"anon-probe"}` → `"code":"42501"`.
     Any other result: stop and report. The probe session stays archived (invisible) in the test project.
- [ ] **Step 5: Docs** — `AGENTS.md` "Database": replace "grants `authenticated` only the columns it writes. No `DELETE` grants." with: login-gated tables (`members`, later `shuttle_types`) grant writes to `authenticated` only and their write policies check `(select auth.uid()) is not null`; public-write tables (`sessions`, `session_attendees`, and Module 5's cost tables) grant `anon` and `authenticated` only the columns the app writes, and attendance-like rows may change only while `public.session_is_open(session_id)` is true; `session_attendees` is the only table with a `DELETE` grant (unticking); sessions are archived, never deleted. Also update the "Project" paragraph: anyone can create sessions and tick attendance without logging in; logging in is for the member list and (Module 4) shuttle types. In "Auth", add: session pages and session actions are public on purpose and never call `requireHost()`.
- [ ] **Step 6: Verify** — `npm run format:check && npm run lint && npm run typecheck && npm run build` → all exit 0.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: add sessions and attendance tables" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

### Task 2: Session data access and public actions

**Files:** Create `src/lib/names.ts`, `src/lib/dates.ts`, `src/features/sessions/session.ts`, `src/server/sessions.ts`, `src/features/sessions/actions.ts`; Modify `src/features/members/member.ts`

**Interfaces:**

- Consumes: `createSupabaseServerClient()`; tables and `session_is_open` from Task 1; `Member` from `@/features/members/member`.
- Produces:
  - `src/lib/names.ts`: `normalizeName(raw: FormDataEntryValue | null): string` (non-string → `""`; NFC, strip the invisible characters `member.ts` strips today, trim, collapse whitespace runs to one space); `nameLength(value: string): number` (code points).
  - `src/lib/dates.ts`:
    - `todayInVietnam(): string` → `YYYY-MM-DD` via `Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" })`. Callers must be at request time.
    - `formatSessionDate(playDate: string): string` → `Thứ Bảy, 14/11/2026` via `Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })` on `new Date(playDate + "T00:00:00Z")`.
    - `formatSessionWhen(s: { playDate: string; startTime: string | null; venue: string | null }): string` → the date, then ` · HH:MM`, then ` · venue`, each only when present.
  - `src/features/sessions/session.ts` (pure):
    - `type SessionSummary = { id: string; playDate: string; startTime: string | null; venue: string | null; attendeeCount: number }` — `startTime` is `HH:MM` (Postgres returns `HH:MM:SS`; slice to 5).
    - `type Attendee = { id: string; memberId: string | null; name: string; isGuest: boolean }`
    - `type SessionDetail = SessionSummary & { attendees: Attendee[] }`
    - `type SessionInput = { playDate: string; startTime: string | null; venue: string | null }`
    - `type SessionFormValues = { playDate: string; startTime: string; venue: string }`
    - `VENUE_MAX_LENGTH = 60`, `GUEST_NAME_MAX_LENGTH = 30`
    - `parseSessionForm(formData: FormData): { ok: true; input: SessionInput } | { ok: false; error: string; values: SessionFormValues }` — fields `play_date`, `start_time`, `venue`.
    - `parseGuestName(raw: FormDataEntryValue | null): { ok: true; name: string } | { ok: false; error: string }`
  - `src/server/sessions.ts` (`import "server-only"`):
    - `type SessionWriteResult = { ok: true } | { ok: false; reason: "duplicate" | "not_found" | "closed" | "error" }`
    - `listSessions(): Promise<SessionSummary[]>` — throws on error
    - `getSessionDetail(id: string): Promise<SessionDetail | null>` — `null` for unknown, archived or malformed id; throws on other errors
    - `getSessionStatus(id: string): Promise<"open" | "missing">`
    - `insertSession(input: SessionInput): Promise<{ ok: true; id: string } | { ok: false; reason: "error" }>`
    - `updateSessionInfo(id: string, input: SessionInput): Promise<SessionWriteResult>`
    - `archiveSession(id: string): Promise<SessionWriteResult>`
    - `addMemberAttendance(sessionId: string, memberId: string): Promise<SessionWriteResult>`
    - `removeMemberAttendance(sessionId: string, memberId: string): Promise<SessionWriteResult>`
    - `insertGuest(sessionId: string, name: string): Promise<SessionWriteResult>`
    - `deleteGuest(sessionId: string, attendeeId: string): Promise<SessionWriteResult>`
  - `src/features/sessions/actions.ts` (`"use server"`):
    - `type SessionFormState = { error: string | null; values: SessionFormValues; saved: boolean }`
    - `type GuestFormState = { error: string | null; name: string }`
    - `type ActionResult = { error: string | null }`
    - `createSession(prev: SessionFormState, formData: FormData): Promise<SessionFormState>` — redirects to `/sessions/{id}` on success
    - `editSession(prev: SessionFormState, formData: FormData): Promise<SessionFormState>` — extra field `id`
    - `deleteSession(prev: ActionResult, formData: FormData): Promise<ActionResult>` — field `id`; redirects to `/` on success
    - `setAttendance(sessionId: string, memberId: string, attending: boolean): Promise<ActionResult>`
    - `addGuest(prev: GuestFormState, formData: FormData): Promise<GuestFormState>` — fields `session_id`, `name`
    - `removeGuest(sessionId: string, attendeeId: string): Promise<ActionResult>`

- [ ] **Step 1: Pure helpers** — `names.ts` and `dates.ts` as above. Move the invisible-character regex and normalization out of `member.ts`; `parseNickname` keeps its exact messages and limits. Check the formatter: `node --input-type=module -e 'import { formatSessionDate } from "./src/lib/dates.ts"; console.log(formatSessionDate("2026-11-14"))'` → `Thứ Bảy, 14/11/2026` (run it with `TZ=America/Los_Angeles` too: same output).
- [ ] **Step 2: `session.ts`** — `parseSessionForm`: `play_date` empty → `Chọn ngày.`; not `^\d{4}-\d{2}-\d{2}$`, not a real calendar day (round-trip through `Date.UTC`), or outside 2000–2100 → `Ngày không hợp lệ.`; `start_time` empty → `null`, else must match `^([01]\d|2[0-3]):[0-5]\d$` (browsers may send `HH:MM:SS`; keep the first 5 characters before matching) or `Giờ không hợp lệ.`; `venue` through `normalizeName`, empty → `null`, longer than 60 code points → `Tên sân tối đa 60 ký tự.`. On failure `values` echoes what was typed. `parseGuestName`: `normalizeName`, empty → `Nhập tên.`, > 30 → `Tên tối đa 30 ký tự.`.
- [ ] **Step 3: `src/server/sessions.ts`**
  - `listSessions`: active sessions, `select("id, play_date, start_time, venue, session_attendees(count)")`, ordered `play_date` desc then `start_time` desc (nulls last), `limit(30)`.
  - `getSessionDetail`: one active session with `session_attendees(id, member_id, guest_name, created_at, members(nickname))`; `maybeSingle()`. `attendeeCount` = number of attendees. Attendees: members first A–Z (`localeCompare(…, "vi", { sensitivity: "base" })`), then guests by `created_at`. `22P02` → `null`.
  - Writes: `updateSessionInfo`/`archiveSession` filter `.eq("id", id).is("archived_at", null).select("id")`; zero rows → `not_found`. `addMemberAttendance`: `23505` → `{ ok: true }` (already ticked). `removeMemberAttendance` / `deleteGuest`: delete by `session_id` + `member_id` / `id` (guest rows only: `.not("guest_name", "is", null)`); zero rows → `{ ok: true }` (already gone). `insertGuest`: `23505` → `duplicate`.
  - Error mapping (same shape as `src/server/members.ts`): `23505` → `duplicate`; `22P02` → `not_found`; `42501` → `closed`; `23503` (unknown session/member id) → `not_found`; anything else or a thrown exception → `error` (log code and message with `console.error`).
- [ ] **Step 4: `actions.ts`** — every action that takes a session id first awaits `getSessionStatus(sessionId)`; `missing` → `Buổi này không còn nữa.`. Map write results: `duplicate` → `Tên này đã có trong buổi.`; `not_found` or `closed` → `Buổi này không còn nữa.`; `error` → `Không lưu được, vui lòng thử lại.`. Form actions echo typed values on failure (as `addMember` does). `editSession` success → `refresh()` and `{ error: null, values: <saved values>, saved: true }`. `addGuest` success → `refresh()` and `{ error: null, name: "" }`. Direct-call actions (`setAttendance`, `removeGuest`) treat a non-string or empty id as `not_found`.
- [ ] **Step 5: Verify** — `npm run format:check && npm run lint && npm run typecheck && npm run build` → all exit 0.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: add session data access and public actions" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

### Task 3: Create a session and list sessions on the home page

**Files:** Create `src/features/sessions/components/session-form.tsx`, `src/features/sessions/components/session-list.tsx`, `src/app/sessions/new/page.tsx`; Modify `src/app/page.tsx`

**Interfaces:**

- Consumes: Task 2's actions, types, `formatSessionWhen`, `todayInVietnam`; `Button`, `buttonVariants`, `Input`, `Label` from `@/components/ui`.
- Produces: `SessionForm({ action, initialValues, submitLabel, pendingLabel, sessionId?, onCancel? })` where `action` is `createSession` or `editSession`, `sessionId` is sent as hidden `id` when present, and `onCancel` shows a `Hủy` button; `SessionList()` (async server component, no props).

- [ ] **Step 1: `session-form.tsx`** — `useActionState(action, { error: null, values: initialValues, saved: false })`. Fields: `Label` + `Input type="date"` (`name="play_date"`, `required`), `Input type="time"` (`name="start_time"`), `Input` venue (`name="venue"`, placeholder, `maxLength={VENUE_MAX_LENGTH}`, `autoComplete="off"`), each with `defaultValue` from `state.values`. Submit button disabled while pending; error with `role="alert"`. When `saved` becomes true and `onCancel` is given, call it (inside `startTransition`, as `EditMemberForm` does) so the edit closes.
- [ ] **Step 2: `/sessions/new`** — `metadata.title = "Tạo buổi đánh"`. Page renders back link, heading, and inside `<Suspense fallback="Đang tải…">` a small async server component that awaits `connection()` then renders `SessionForm` with `initialValues = { playDate: todayInVietnam(), startTime: "", venue: "" }`, `action={createSession}`, labels `Tạo buổi` / `Đang tạo…`.
- [ ] **Step 3: `SessionList` + home page** — awaits `connection()` (outside try), then `listSessions()` in try/catch (load-failure copy with `role="alert"`). Renders heading `Buổi đánh` with a `Tạo buổi` `<Link href="/sessions/new">` styled by `buttonVariants({ size: "sm" })` beside it, then the empty copy or a bordered `<ul>`: each row is a `<Link href="/sessions/{id}">` with `formatSessionWhen(...)` on the first line and `{n} người đi` muted on the second. `src/app/page.tsx`: insert `<Suspense fallback="Đang tải…"><SessionList /></Suspense>` above the member list.
- [ ] **Step 4: Verify** — static checks exit 0, then on `npx next dev -p 3100` (test project, not logged in):
  1. Home shows `Buổi đánh`, `Chưa có buổi nào.`, `Tạo buổi`.
  2. `Tạo buổi` → date prefilled with today (Vietnam). Pick `14/11/2026`, time `19:00`, venue `Sân Kỳ Hòa` → lands on `/sessions/{id}`; home shows `Thứ Bảy, 14/11/2026 · 19:00 · Sân Kỳ Hòa` and `0 người đi`.
  3. Create one with no time or venue → row shows only the date.
  4. Clear the date and submit (bypass `required` via devtools) → `Chọn ngày.`; venue of 61 characters (devtools) → `Tên sân tối đa 60 ký tự.`, typed values kept.
  5. Ordering: a session dated later appears above an earlier one.
  6. Phone width (~375 px): no horizontal scroll.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: create sessions and list them on the home page" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

### Task 4: Session page with self check-in and guests

**Files:** Create `src/features/sessions/components/session-detail.tsx`, `session-header.tsx`, `attendance-list.tsx`, `src/app/sessions/[id]/page.tsx`

**Interfaces:**

- Consumes: Task 2 (`getSessionDetail`, `listActiveMembers` from `@/server/members`, all session actions), Task 3 (`SessionForm`).
- Produces: `SessionDetailView({ id }: { id: string })` (async server component); `SessionHeader({ session }: { session: SessionSummary })`; `AttendanceList({ sessionId, members, attendees }: { sessionId: string; members: Member[]; attendees: Attendee[] })`. Module 5 adds a `locked: boolean` prop to the two client components.

- [ ] **Step 1: Page + detail** — `src/app/sessions/[id]/page.tsx`: `metadata.title = "Buổi đánh"`; back link; `<Suspense fallback="Đang tải…">` around a component that awaits `params` (typed `PageProps<"/sessions/[id]">`) then renders `SessionDetailView`. `SessionDetailView` awaits `connection()`, then loads `getSessionDetail(id)` and `listActiveMembers()` in parallel inside try/catch (load-failure copy). `null` → the not-found copy plus the back link (no `notFound()`, so the message is predictable inside the stream).
- [ ] **Step 2: `attendance-list.tsx`** — rows, in order: every active member (checked when an attendee has their `memberId`), then attendees whose member is no longer active (checked, same row type), then guests (name, `khách` tag, `Bỏ` button). Each member row is a `<label>` spanning the full width (min height 44 px) with a native checkbox (`size-5`) and the nickname. Heading `Ai đi? ({n})` where `n` is the optimistic count of ticked members plus guests; hint line below it. Toggling uses `useOptimistic` over the set of ticked member ids and calls `setAttendance` in a transition; a row is disabled while its own request is pending; on an error the optimistic tick falls back when the transition ends, and the message shows below the list with `role="alert"`. Guest remove calls `removeGuest` the same way. Below the list, the add-guest form (`useActionState(addGuest, …)`, hidden `session_id`, `Input name="name"` with `maxLength={GUEST_NAME_MAX_LENGTH}`, `Thêm` button). No active members and no attendees → `Chưa có thành viên nào.` above the guest form.
- [ ] **Step 3: `session-header.tsx`** — modes `"view" | "edit" | "confirm"` like `MemberRow`. View: `formatSessionWhen(session)` as the page `h1`, `Sửa` and `Xóa buổi` (small, outline). Edit: `SessionForm` with `action={editSession}`, `sessionId`, current values, `Lưu`/`Đang lưu…`, `onCancel` back to view. Confirm: `Xóa buổi {formatSessionDate(playDate)}?`, form with hidden `id` posting to `deleteSession`, `Xóa` (`variant="destructive"`) and `Hủy` (autofocused). No browser dialogs.
- [ ] **Step 4: Verify** — static checks exit 0, then on `npx next dev -p 3100`, not logged in, with at least `DatNT`, `LiemHTN`, `TienT` in the test member list:
  1. Open a session → all active members listed unticked, `Ai đi? (0)`.
  2. Tick `DatNT` → checked at once, `Ai đi? (1)`; reload → still checked; home shows `1 người đi`.
  3. Untick → `Ai đi? (0)` after reload too.
  4. Add guest `Bạn của Đạt` → listed with `khách`, count up. Add `bạn của đạt` → `Tên này đã có trong buổi.`. `Bỏ` it → gone.
  5. `Sửa` → change time to `20:00` → `Lưu` → header updates; `Hủy` leaves it unchanged.
  6. Double-click a checkbox quickly / tick the same member in two tabs → one row (count is 1 after reload).
  7. `/sessions/not-a-uuid` and a random valid uuid → `Không tìm thấy buổi đánh này.`.
  8. Tick `TienT`, then remove `TienT` from the member list on `/admin` (logged in, another tab) → the session still shows `TienT` ticked and it can be unticked; a new session does not list `TienT`. Re-add `TienT` afterwards.
  9. Two tabs on one session: `Xóa buổi` → `Xóa` in tab A → lands on home, session gone from the list; in tab B tick a member → `Buổi này không còn nữa.`.
  10. Phone width (~375 px): no horizontal scroll; rows are easy to tap.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add session page with self check-in and guests" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

After the tasks: superpowers:finishing-a-development-branch. `20261109180000_sessions.sql` is already applied to production (2026-11-09), so the merge into `main` only deploys the code. Then confirm `curl -s -o /dev/null -w "%{http_code}\n" https://badminton-pink.vercel.app/sessions/new` → `200` and the home page shows `Buổi đánh`.
