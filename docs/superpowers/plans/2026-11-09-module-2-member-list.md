# Module 2: Member List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the host keep the group's fixed member list (add, rename, remove members by nickname) on `/admin`, stored in Supabase and readable/writable only by the host.

**Architecture:** One `public.members` table with row-level security tied to the host's user id (`host_id = auth.uid()`), no access for `anon`, and soft removal via `archived_at`. Server-only data functions in `src/server/members.ts`; `"use server"` actions in `src/features/members/actions.ts` call `requireHost()` first and `refresh()` after a successful write; the UI is a server component section plus two small client components on the existing `/admin` page.

**Tech Stack:** Next.js 16.4.5 (App Router, `cacheComponents: true`), React 19.3 (`useActionState`), `@supabase/ssr` + `@supabase/supabase-js` (from Module 1), Postgres RLS on Supabase, shadcn/ui (`base-nova`).

**Spec:** No separate spec. Scope agreed in chat on 2026-11-09: the list holds only the group's fixed members (currently 6). Each member is just a nickname as used in the group (e.g. `DatNT`, `LiemHTN`, `PhongTB`, `TienT`, `HaoNV`). Guests are not stored in the list; they are typed per session (Module 3). Only the host sees and edits the list, on `/admin`. Agreed behaviors: no two active members share a nickname, ignoring case; removing a member hides them from future ticking but past sessions keep their name; the list is sorted A–Z; viewers of a session link never see the whole list. Creating sessions, ticking attendance and costs are Module 3.

## Global Constraints

- No automated tests (owner's decision). A task is verified by `npm run format:check && npm run lint && npm run typecheck && npm run build` plus the explicit curl/browser checks in its steps.
- Repo docs and code comments in English; user-facing UI text in Vietnamese, exactly as listed under "UI copy" below.
- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code. Anything that reads cookies (the Supabase server client, `requireHost()`) renders inside `<Suspense>`. After a successful write, actions call `refresh()` from `next/cache` (member data is not cached, so no `revalidatePath`/`updateTag`).
- Every member server action calls `requireHost()` before anything else. RLS is the second line, not the only one.
- All database access goes through `createSupabaseServerClient()` (the host's session). No service-role / secret key.
- Members are never hard-deleted: "Bỏ" sets `archived_at`. The database grants no `DELETE` on `members`.
- Nickname rules: NFC-normalize, trim, collapse inner whitespace runs to one space; 1–30 characters counted as code points (`Array.from(s).length`, matching Postgres `char_length`); unique among active members ignoring case.
- Work on branch `feat/module-2-members` created from `main`. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Running SQL against the Supabase project and pushing to GitHub are owner-gated: the executor asks first.

### UI copy (Vietnamese, exact)

| Where                                    | Text                                                           |
| ---------------------------------------- | -------------------------------------------------------------- |
| Section heading                          | `Thành viên ({count})`                                         |
| Nickname input `aria-label` (add + edit) | `Biệt danh`                                                    |
| Add input placeholder                    | `Biệt danh, ví dụ DatNT`                                       |
| Add button / while pending               | `Thêm` / `Đang thêm…`                                          |
| Empty list                               | `Chưa có thành viên nào.`                                      |
| Row buttons                              | `Sửa`, `Bỏ`                                                    |
| Edit buttons / save while pending        | `Lưu` / `Đang lưu…`, `Hủy`                                     |
| Remove confirmation                      | `Bỏ {nickname} khỏi danh sách?`                                |
| Remove buttons / remove while pending    | `Bỏ` / `Đang bỏ…`, `Hủy`                                       |
| Error: empty nickname                    | `Nhập biệt danh.`                                              |
| Error: too long                          | `Biệt danh tối đa 30 ký tự.`                                   |
| Error: duplicate                         | `Biệt danh này đã có trong danh sách.`                         |
| Error: member already removed / unknown  | `Thành viên này không còn trong danh sách.`                    |
| Error: any other write failure           | `Không lưu được, vui lòng thử lại.`                            |
| Error: list failed to load               | `Không tải được danh sách thành viên, vui lòng tải lại trang.` |
| Suspense fallback                        | `Đang tải…`                                                    |

## Review Focus

1. **Anyone with the publishable key reading or writing `members` through the public REST API.** The key ships to every browser. Expected: refused for `anon` (read and write). Pinned by Task 1 Step 4.
2. **The same nickname typed with different case or spacing** (`datnt`, `  DatNT  `, `Dat  NT` vs `Dat NT`). Expected: stored trimmed/collapsed and rejected as a duplicate of an active member. Pinned by Task 2 Step 1 (`parseNickname`), Task 1's unique index, Task 3 Step 4 items 3–4.
3. **Re-adding a nickname that was removed earlier.** Expected: allowed (the removed row stays archived for history; a new row is created). Pinned by Task 1's partial unique index and Task 3 Step 4 item 7.
4. **A stale tab:** renaming or removing a member that was already removed in another tab. Expected: `Thành viên này không còn trong danh sách.`, no crash. Pinned by Task 2 Step 2 (`not_found`) and Task 3 Step 4 item 8.
5. **Double submit** (double-click `Thêm`, `Lưu`, `Bỏ`). Expected: one write; buttons disabled while pending; a duplicate insert still loses to the unique index. Pinned by Task 3 Step 4 item 9.

---

## File Structure

| Path                                                  | Change | Responsibility                                                         |
| ----------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| `supabase/migrations/20261109140000_members.sql`      | Create | `members` table, unique index, grants, RLS policies                    |
| `AGENTS.md`, `README.md`                              | Modify | "Database" conventions; Setup step for applying migrations             |
| `src/features/members/member.ts`                      | Create | `Member` type, `NICKNAME_MAX_LENGTH`, `parseNickname()` (pure, no I/O) |
| `src/server/members.ts`                               | Create | Server-only queries/writes against `members`                           |
| `src/features/members/actions.ts`                     | Create | `addMember`, `renameMember`, `removeMember` server actions             |
| `src/features/members/components/member-section.tsx`  | Create | Async server component: loads list, renders heading, form, rows        |
| `src/features/members/components/add-member-form.tsx` | Create | Client add form                                                        |
| `src/features/members/components/member-row.tsx`      | Create | Client row: view / edit / confirm-remove                               |
| `src/app/admin/page.tsx`                              | Modify | Render `MemberSection` inside `<Suspense>`                             |

---

### Task 1: `members` table with host-only access

**Files:** Create `supabase/migrations/20261109140000_members.sql`; Modify `AGENTS.md`, `README.md`

**Interfaces:**

- Produces: table `public.members (id uuid, host_id uuid, nickname text, archived_at timestamptz, created_at timestamptz)`; `authenticated` may `SELECT`, `INSERT (nickname)`, `UPDATE (nickname, archived_at)` on its own rows only; `anon` has no privileges.

- [ ] **Step 1: Create branch** — `git switch -c feat/module-2-members main`
- [ ] **Step 2: Write the migration** (exact):

```sql
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
```

- [ ] **Step 3 (owner): Apply it** — Supabase dashboard → SQL Editor → New query → paste the whole file → Run. Expected: `Success. No rows returned`. The executor stops here and asks the owner to do this; it never runs SQL against the project itself.
- [ ] **Step 4: Verify `anon` is locked out** (do not print the env values):

Run: `set -a; . ./.env.local; set +a; curl -s -w ' HTTP %{http_code}\n' "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/members?select=id" -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"`
Expected: body contains `"code":"42501"` (permission denied for table members), HTTP 401 or 403.

Run: `set -a; . ./.env.local; set +a; curl -s -w ' HTTP %{http_code}\n' -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/members" -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" -H "Content-Type: application/json" -d '{"nickname":"anon-probe"}'`
Expected: body contains `"code":"42501"`, HTTP 401 or 403. `PGRST205` (table not found) means Step 3 was not applied; a `201` means the grants are wrong — stop and report.

- [ ] **Step 5: Docs**
  - `AGENTS.md` gains a "Database" section: schema changes are new timestamped files in `supabase/migrations/` (never edit an applied one); the owner applies each new file in the Supabase SQL Editor in filename order; every table enables RLS, revokes from `anon` unless public read is intended, and grants `authenticated` only the columns it writes; write policies check `host_id = (select auth.uid())`; members are archived (`archived_at`), never deleted.
  - `README.md` "Setup" gains a step after creating the host user: run each file in `supabase/migrations/` in the SQL Editor, in filename order.
- [ ] **Step 6: Verify** — `npm run format:check && npm run lint && npm run typecheck && npm run build` → all exit 0.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: add members table with host-only access" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

### Task 2: Member data access and server actions

**Files:** Create `src/features/members/member.ts`, `src/server/members.ts`, `src/features/members/actions.ts`

**Interfaces:**

- Consumes: `createSupabaseServerClient()` (`@/server/supabase/server`), `requireHost()` (`@/server/auth`), table `public.members` (Task 1).
- Produces:
  - `src/features/members/member.ts` (pure; importable from client and server):
    - `type Member = { id: string; nickname: string }`
    - `const NICKNAME_MAX_LENGTH = 30`
    - `type NicknameResult = { ok: true; nickname: string } | { ok: false; error: string }`
    - `parseNickname(raw: FormDataEntryValue | null): NicknameResult`
  - `src/server/members.ts` (`import "server-only"`):
    - `type MemberWriteResult = { ok: true } | { ok: false; reason: "duplicate" | "not_found" | "error" }`
    - `listActiveMembers(): Promise<Member[]>` — throws on a Supabase error
    - `insertMember(nickname: string): Promise<MemberWriteResult>`
    - `updateMemberNickname(id: string, nickname: string): Promise<MemberWriteResult>`
    - `archiveMember(id: string): Promise<MemberWriteResult>`
  - `src/features/members/actions.ts` (`"use server"`):
    - `type NicknameFormState = { error: string | null; nickname: string; saved: boolean }`
    - `type RemoveMemberState = { error: string | null }`
    - `addMember(prevState: NicknameFormState, formData: FormData): Promise<NicknameFormState>` — field `nickname`
    - `renameMember(prevState: NicknameFormState, formData: FormData): Promise<NicknameFormState>` — fields `id`, `nickname`
    - `removeMember(prevState: RemoveMemberState, formData: FormData): Promise<RemoveMemberState>` — field `id`

- [ ] **Step 1: `parseNickname`** — non-string → treat as `""`. Normalize: `.normalize("NFC")`, `.trim()`, `.replace(/\s+/g, " ")`. Empty → `{ ok: false, error: "Nhập biệt danh." }`; `Array.from(value).length > NICKNAME_MAX_LENGTH` → `{ ok: false, error: "Biệt danh tối đa 30 ký tự." }`; else `{ ok: true, nickname }`.
- [ ] **Step 2: `src/server/members.ts`**
  - `listActiveMembers`: `select("id, nickname")` where `archived_at` is null; sort in JS with `a.nickname.localeCompare(b.nickname, "vi", { sensitivity: "base" })` (A–Z, case-insensitive).
  - Writes: `insertMember` inserts `{ nickname }` only (`host_id` comes from the column default). `updateMemberNickname` and `archiveMember` (sets `archived_at` to `new Date().toISOString()`) filter `.eq("id", id).is("archived_at", null)` and chain `.select("id")`; zero rows → `not_found`.
  - Error mapping: Postgres `code === "23505"` → `duplicate`; `code === "22P02"` (malformed uuid) → `not_found`; any other error or thrown exception → `error`.
- [ ] **Step 3: `src/features/members/actions.ts`** — each action awaits `requireHost()` first.
  - `addMember` / `renameMember`: run `parseNickname`; on failure return `{ error, nickname: <raw trimmed input>, saved: false }` so the field keeps what was typed. Map write results: `duplicate` → `Biệt danh này đã có trong danh sách.`, `not_found` → `Thành viên này không còn trong danh sách.`, `error` → `Không lưu được, vui lòng thử lại.` On success call `refresh()` and return `{ error: null, nickname: "", saved: true }` for add and `{ error: null, nickname: <saved nickname>, saved: true }` for rename.
  - `removeMember`: missing `id` → `not_found` message; same result mapping; success → `refresh()` and `{ error: null }`.
- [ ] **Step 4: Verify** — `npm run format:check && npm run lint && npm run typecheck && npm run build` → all exit 0.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add member data access and server actions" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

### Task 3: Member list on `/admin`

**Files:** Create `src/features/members/components/{member-section,add-member-form,member-row}.tsx`; Modify `src/app/admin/page.tsx`

**Interfaces:**

- Consumes: everything Task 2 produces; `Button`, `Input` from `@/components/ui`.
- Produces: `MemberSection()` (async server component, no props); `AddMemberForm()`; `MemberRow({ member }: { member: Member })`.

- [ ] **Step 1: `member-section.tsx`** — awaits `requireHost()`, then `listActiveMembers()` inside try/catch; on failure renders the "list failed to load" copy with `role="alert"`. Otherwise: heading `Thành viên ({count})`, `AddMemberForm`, then either the empty-list copy or a `<ul>` of `MemberRow` keyed by `member.id`.
- [ ] **Step 2: Client components**
  - `add-member-form.tsx`: `useActionState(addMember, { error: null, nickname: "", saved: false })`; one `Input` (`name="nickname"`, `aria-label`, placeholder, `defaultValue={state.nickname}`, `maxLength={NICKNAME_MAX_LENGTH}`, `autoComplete="off"`, `required`) and the add `Button` side by side; button disabled while pending with the pending label; error below with `role="alert"`. React resets the form after the action, so `defaultValue` from state is what keeps the typed text on error and clears it on success.
  - `member-row.tsx`: local mode `"view" | "edit" | "confirm"`. View: nickname, `Sửa` and `Bỏ` (small, `variant="outline"`). Edit: form with hidden `id`, `Input` (`defaultValue={member.nickname}`, `autoFocus`, same `maxLength`), `Lưu` (pending label) and `Hủy` (`type="button"`, back to view); when `renameMember` returns `saved: true`, back to view. Confirm: the remove-confirmation copy, form with hidden `id`, `Bỏ` (`variant="destructive"`, pending label) and `Hủy`. Errors below the row with `role="alert"`. No browser `confirm()` dialogs.
  - Mobile-first: rows fit at 375 px with no horizontal scroll; long nicknames wrap (`break-words`).
- [ ] **Step 3: `/admin/page.tsx`** — below the greeting, add `<Suspense fallback="Đang tải…"><MemberSection /></Suspense>`. Keep the existing heading, sign-out button and greeting.
- [ ] **Step 4: Verify build, then browser checklist (owner types the password; executor may drive the browser)** — `npm run format:check && npm run lint && npm run typecheck && npm run build` → all exit 0. Then on `npx next dev -p 3100`, logged in on `/admin`:
  1. Fresh table → `Thành viên (0)` and `Chưa có thành viên nào.`
  2. Add `DatNT` → appears, input cleared, `Thành viên (1)`.
  3. Add `  LiemHTN  ` → shown as `LiemHTN`. Add `   ` (spaces only) → `Nhập biệt danh.`
  4. Add `datnt` → `Biệt danh này đã có trong danh sách.`, input still shows `datnt`.
  5. Add `PhongTB`, `TienT`, `HaoNV`, `anhTV` → list is A–Z ignoring case (`anhTV` first).
  6. `Sửa` `HaoNV` → `HaoNV2` → `Lưu` → row shows `HaoNV2`, list re-sorted. `Sửa` again → type `LiemHTN` → duplicate error, row stays in edit. `Hủy` → back to `HaoNV2`.
  7. `Bỏ` `anhTV` → confirmation → `Bỏ` → gone, count drops. Add `anhTV` again → succeeds.
  8. Open `/admin` in a second tab, remove `TienT` there; in the first tab click `Sửa` on `TienT` → `Lưu` → `Thành viên này không còn trong danh sách.`
  9. Double-click `Thêm` with a new nickname → exactly one row added.
  10. Reload → list unchanged. `Đăng xuất`, open `/admin` → `/login`.
  11. Phone width (~375 px) → no horizontal scroll.
  12. Clean up: remove the test members (the owner adds the real six afterwards, on production).
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add member list to admin page" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

After the tasks: superpowers:finishing-a-development-branch. Merging into `main` and pushing (owner approves) deploys to production on Vercel; then confirm `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://badminton-pink.vercel.app/admin` → `307 https://badminton-pink.vercel.app/login`, and the owner adds the six real members on production.
