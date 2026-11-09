# Module 4: Shuttle Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On `/admin`, a signed-in editor keeps a list of shuttle types — name, price of one tube, shuttles per tube — so Module 5 can price a session's shuttles from "type + number used".

**Architecture:** One `public.shuttle_types` table: public read (the session page needs the list), writes for `authenticated` only, soft removal via `archived_at`. Same layering as members: pure parsing in `src/features/shuttles/shuttle-type.ts`, server-only data in `src/server/shuttle-types.ts`, `"use server"` actions that call `requireHost()` first, and a section on `/admin` built like `MemberSection`.

**Tech Stack:** Next.js 16.4.5 (App Router, `cacheComponents: true`), React 19.3 (`useActionState`), `@supabase/ssr`, Postgres RLS on Supabase, shadcn/ui (`base-nova`).

**Spec:** No separate spec. Scope agreed in chat on 2026-11-09: shuttles are bought by one member, by the tube. In admin you enter a type, e.g. a tube of 12 for 100.000 ₫ → one shuttle ≈ 8.333 ₫. On a session (Module 5) you pick the type used and the number of shuttles, and the cost is rounded up to the thousand (5 × 8.333 = 41.666 → 42.000 ₫). This module only manages the list.

Calls made by the planner (flagged for review): shuttle types are edited only on `/admin` (login), like members; changing a type's price does not change sessions that already saved their shuttle cost (Module 5 stores a price snapshot per session); money fields accept `100000`, `100.000`, `100,000` or `100k`.

## Global Constraints

- No automated tests (owner's decision). Verify with `npm run format:check && npm run lint && npm run typecheck && npm run build` plus the curl/browser checks in each task.
- Repo docs and code comments in English; UI text in Vietnamese, exactly as in "UI copy".
- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code. Cookie-reading components render inside `<Suspense>`; actions call `refresh()` after a successful write.
- Every shuttle-type server action calls `requireHost()` before anything else. RLS is the second line.
- Money is an integer number of VND. Tube price 1.000–10.000.000 ₫; shuttles per tube 1–100; name 1–40 code points, unique among active types ignoring case.
- Shuttle types are never hard-deleted (`archived_at`); there is no `DELETE` grant.
- Work on branch `feat/module-4-shuttle-types` from `main` (after Module 3 is merged). Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Running migrations (test project only; production is automatic on merge) and pushing to GitHub are owner-gated: the executor asks first.

### UI copy (Vietnamese, exact)

| Where                          | Text                                                             |
| ------------------------------ | ---------------------------------------------------------------- |
| Section heading                | `Loại cầu ({count})`                                             |
| Field labels (add + edit)      | `Tên loại cầu`, `Giá 1 lốc`, `Số trái 1 lốc`                     |
| Placeholders                   | `Ví dụ: Yonex AS-30`, `Ví dụ: 100k`, (none; default value `12`)  |
| Add button / pending           | `Thêm loại cầu` / `Đang thêm…`                                   |
| Row detail line                | `{tubePrice} / lốc {tubeSize} trái · {perShuttle}/trái`          |
| Per-shuttle price              | exact → `8.000 ₫`; not exact → `≈ 8.333 ₫` (rounded to the đồng) |
| Empty list                     | `Chưa có loại cầu nào.`                                          |
| Row buttons                    | `Sửa`, `Bỏ`                                                      |
| Edit buttons / pending         | `Lưu` / `Đang lưu…`, `Hủy`                                       |
| Remove confirmation            | `Bỏ {name} khỏi danh sách?`                                      |
| Remove buttons / pending       | `Bỏ` / `Đang bỏ…`, `Hủy`                                         |
| Error: name empty              | `Nhập tên loại cầu.`                                             |
| Error: name too long           | `Tên loại cầu tối đa 40 ký tự.`                                  |
| Error: duplicate name          | `Loại cầu này đã có trong danh sách.`                            |
| Error: tube price empty        | `Nhập giá 1 lốc.`                                                |
| Error: money not understood    | `Số tiền không hợp lệ, ví dụ 100000, 100.000 hoặc 100k.`         |
| Error: tube price out of range | `Giá 1 lốc phải từ 1.000 ₫ đến 10.000.000 ₫.`                    |
| Error: shuttles per tube       | `Số trái 1 lốc phải từ 1 đến 100.`                               |
| Error: type removed / unknown  | `Loại cầu này không còn trong danh sách.`                        |
| Error: other write failure     | `Không lưu được, vui lòng thử lại.`                              |
| Error: list failed to load     | `Không tải được danh sách loại cầu, vui lòng tải lại trang.`     |

## Review Focus

1. **The publishable key writing `shuttle_types` through REST.** Expected: `anon` can read but not insert or update. Pinned by Task 1 Step 4.
2. **Money typed the way people type it** (`100k`, `100.000`, `100,000`, `100000`) vs nonsense (`1.5k`, `100.00`, `-5`, `abc`). Expected: the first four become `100000`; the rest show the money error. Pinned by Task 2 Step 1's check command and Task 3 Step 3 item 3.
3. **A per-shuttle price that does not divide evenly** (100.000 / 12). Expected: `≈ 8.333 ₫/trái`, while 96.000 / 12 shows `8.000 ₫/trái`. Pinned by Task 2 Step 1 and Task 3 Step 3 item 2.
4. **Same name in a different case, and re-adding a removed type.** Expected: duplicate error; re-adding after removal works. Pinned by Task 1's partial unique index and Task 3 Step 3 items 4 and 6.
5. **A stale tab editing a type removed elsewhere, or a double submit.** Expected: `Loại cầu này không còn trong danh sách.`; one row per submit. Pinned by Task 3 Step 3 items 7–8.

---

## File Structure

| Path                                                         | Change | Responsibility                                                    |
| ------------------------------------------------------------ | ------ | ----------------------------------------------------------------- |
| `supabase/migrations/20261109190000_shuttle_types.sql`       | Create | Table, unique index, grants, RLS                                  |
| `AGENTS.md`                                                  | Modify | Name `shuttle_types` as a login-gated table                       |
| `src/lib/money.ts`                                           | Modify | Add `VND_MAX`, `parseVND()`                                       |
| `src/features/shuttles/shuttle-type.ts`                      | Create | Types, limits, `parseShuttleTypeForm()`, `pricePerShuttleLabel()` |
| `src/server/shuttle-types.ts`                                | Create | Server-only queries/writes                                        |
| `src/features/shuttles/actions.ts`                           | Create | `addShuttleType`, `editShuttleType`, `removeShuttleType`          |
| `src/features/shuttles/components/shuttle-type-section.tsx`  | Create | Server section: load, heading, add form, rows                     |
| `src/features/shuttles/components/shuttle-type-fields.tsx`   | Create | The three labelled inputs, shared by add and edit                 |
| `src/features/shuttles/components/add-shuttle-type-form.tsx` | Create | Client add form                                                   |
| `src/features/shuttles/components/shuttle-type-row.tsx`      | Create | Client row: view / edit / confirm-remove                          |
| `src/app/admin/page.tsx`                                     | Modify | Render the section below members                                  |

---

### Task 1: `shuttle_types` table

**Files:** Create `supabase/migrations/20261109190000_shuttle_types.sql`; Modify `AGENTS.md`

**Interfaces:**

- Produces: `public.shuttle_types (id uuid, name text, tube_price integer, tube_size integer, archived_at timestamptz, created_at timestamptz)`; readable by `anon`/`authenticated`; `authenticated` may insert `(name, tube_price, tube_size)` and update those plus `archived_at`.

- [ ] **Step 1: Create branch** — `git switch -c feat/module-4-shuttle-types main`
- [ ] **Step 2: Write the migration** (exact):

```sql
-- Module 4: shuttle types bought by the tube. Everyone reads; signed-in editors write.
create table public.shuttle_types (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name = btrim(name) and char_length(name) between 1 and 40),
  tube_price integer not null check (tube_price between 1000 and 10000000),
  tube_size integer not null check (tube_size between 1 and 100),
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index shuttle_types_active_name_key
  on public.shuttle_types (lower(name))
  where archived_at is null;

alter table public.shuttle_types enable row level security;

revoke all on table public.shuttle_types from anon, authenticated;
grant select on table public.shuttle_types to anon, authenticated;
grant insert (name, tube_price, tube_size) on table public.shuttle_types to authenticated;
grant update (name, tube_price, tube_size, archived_at) on table public.shuttle_types to authenticated;

create policy "anyone reads shuttle types" on public.shuttle_types
  for select to anon, authenticated using (true);
create policy "signed-in users add shuttle types" on public.shuttle_types
  for insert to authenticated with check ((select auth.uid()) is not null);
create policy "signed-in users edit shuttle types" on public.shuttle_types
  for update to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);
```

- [ ] **Step 3 (owner-gated): Apply it to the test project** — with the CLI linked to the test project: `npx supabase db push --remote --dry-run` must list exactly this file, then `npx supabase db push --remote`. Never through the SQL Editor (see `AGENTS.md` → Database). The executor asks the owner before running it.
- [ ] **Step 4: Verify with the publishable key** (same curl setup as Module 3 Task 1 Step 4):
  1. `GET /rest/v1/shuttle_types?select=id` → HTTP 200, `[]`.
  2. `POST /rest/v1/shuttle_types` body `{"name":"probe","tube_price":100000,"tube_size":12}` → `"code":"42501"`.
- [ ] **Step 5: Docs** — `AGENTS.md` "Database": list `shuttle_types` with `members` as the login-gated tables.
- [ ] **Step 6: Verify** — static checks exit 0.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: add shuttle types table" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

### Task 2: Money parsing, shuttle-type data access and actions

**Files:** Modify `src/lib/money.ts`; Create `src/features/shuttles/shuttle-type.ts`, `src/server/shuttle-types.ts`, `src/features/shuttles/actions.ts`

**Interfaces:**

- Consumes: `normalizeName`, `nameLength` (`@/lib/names`, Module 3); `requireHost()`; `createSupabaseServerClient()`; `formatVND`.
- Produces:
  - `src/lib/money.ts`: `VND_MAX = 10_000_000`; `type ParsedVND = { ok: true; amount: number } | { ok: false; reason: "empty" | "invalid" }`; `parseVND(raw: FormDataEntryValue | null): ParsedVND`. Range checks belong to callers (their messages differ).
  - `src/features/shuttles/shuttle-type.ts` (pure):
    - `type ShuttleType = { id: string; name: string; tubePrice: number; tubeSize: number }`
    - `SHUTTLE_NAME_MAX_LENGTH = 40`, `TUBE_PRICE_MIN = 1000`, `TUBE_SIZE_MAX = 100`
    - `type ShuttleTypeInput = { name: string; tubePrice: number; tubeSize: number }`
    - `type ShuttleTypeFormValues = { name: string; tubePrice: string; tubeSize: string }`
    - `parseShuttleTypeForm(formData: FormData): { ok: true; input: ShuttleTypeInput } | { ok: false; error: string; values: ShuttleTypeFormValues }` — fields `name`, `tube_price`, `tube_size`
    - `pricePerShuttleLabel(type: { tubePrice: number; tubeSize: number }): string`
  - `src/server/shuttle-types.ts` (`import "server-only"`):
    - `type ShuttleTypeWriteResult = { ok: true } | { ok: false; reason: "duplicate" | "not_found" | "error" }`
    - `listActiveShuttleTypes(): Promise<ShuttleType[]>` — A–Z by name (`localeCompare(…, "vi", { sensitivity: "base" })`); throws on error. Module 5 calls it from the public session page, so it must not call `requireHost()`.
    - `insertShuttleType(input: ShuttleTypeInput): Promise<ShuttleTypeWriteResult>`
    - `updateShuttleType(id: string, input: ShuttleTypeInput): Promise<ShuttleTypeWriteResult>`
    - `archiveShuttleType(id: string): Promise<ShuttleTypeWriteResult>`
  - `src/features/shuttles/actions.ts` (`"use server"`):
    - `type ShuttleTypeFormState = { error: string | null; values: ShuttleTypeFormValues; saved: boolean }`
    - `type RemoveShuttleTypeState = { error: string | null }`
    - `addShuttleType(prev: ShuttleTypeFormState, formData: FormData): Promise<ShuttleTypeFormState>`
    - `editShuttleType(prev: ShuttleTypeFormState, formData: FormData): Promise<ShuttleTypeFormState>` — extra field `id`
    - `removeShuttleType(prev: RemoveShuttleTypeState, formData: FormData): Promise<RemoveShuttleTypeState>` — field `id`

- [ ] **Step 1: `parseVND` and `pricePerShuttleLabel`** — `parseVND`: non-string or blank after removing all whitespace → `empty`. Lower-case it. Accept exactly `^\d+k$` (× 1000), `^\d+$`, or `^\d{1,3}([.,]\d{3})+$` (separators removed); anything else, or a result above `Number.MAX_SAFE_INTEGER`, → `invalid`. `pricePerShuttleLabel`: `tubePrice % tubeSize === 0` → `formatVND(tubePrice / tubeSize)`, else `"≈ " + formatVND(Math.round(tubePrice / tubeSize))`. Check:

Run: `node --input-type=module -e 'import { parseVND } from "./src/lib/money.ts"; console.log(JSON.stringify(["100k","100.000","100,000"," 100000 ","1.5k","100.00","-5","abc",""].map(parseVND)))'`
Expected: four `{"ok":true,"amount":100000}`, then `invalid` × 4, then `empty`.

- [ ] **Step 2: `parseShuttleTypeForm`** — name via `normalizeName`: empty → `Nhập tên loại cầu.`, > 40 → `Tên loại cầu tối đa 40 ký tự.`. Tube price: `empty` → `Nhập giá 1 lốc.`, `invalid` → the money error, outside 1.000–`VND_MAX` → the range error. Tube size: must be an integer string 1–100 (`^\d+$`), else `Số trái 1 lốc phải từ 1 đến 100.`. Failure echoes the typed values.
- [ ] **Step 3: `src/server/shuttle-types.ts`** — mirror `src/server/members.ts`: same error mapping (`23505` → `duplicate`, `22P02` → `not_found`, other → `error` with `console.error`), updates filter `.is("archived_at", null)` and `.select("id")` (zero rows → `not_found`). Map snake_case columns to the camelCase type.
- [ ] **Step 4: `actions.ts`** — mirror `src/features/members/actions.ts`: `requireHost()` first; messages from UI copy; on a `duplicate`, `refresh()` too (shows a type added in another tab); success → `refresh()`; add returns empty values with `tubeSize: "12"`; edit returns the saved values.
- [ ] **Step 5: Verify** — static checks exit 0.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: add shuttle type data access and actions" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

### Task 3: Shuttle types on `/admin`

**Files:** Create the four components listed in File Structure; Modify `src/app/admin/page.tsx`

**Interfaces:**

- Consumes: Task 2; `Button`, `Input`, `Label`; `formatVND`.
- Produces: `ShuttleTypeSection()` (async server component, no props); `ShuttleTypeFields({ values, error? }: { values: ShuttleTypeFormValues; error?: boolean })`; `AddShuttleTypeForm()`; `ShuttleTypeRow({ shuttleType }: { shuttleType: ShuttleType })`.

- [ ] **Step 1: Components** — copy the structure and focus handling of `member-section.tsx`, `add-member-form.tsx` and `member-row.tsx`:
  - `ShuttleTypeFields`: three `Label` + `Input` pairs stacked: name (`maxLength={SHUTTLE_NAME_MAX_LENGTH}`, `autoComplete="off"`), tube price (plain text input, `autoComplete="off"`; not `inputMode="numeric"`, because people type `100k`), tube size (`type="number"`, `min={1}`, `max={100}`, `inputMode="numeric"`). `defaultValue`s from `values`.
  - Section: `requireHost()`, then `listActiveShuttleTypes()` in try/catch; heading, add form, empty copy or bordered list.
  - Row view: name on the first line; `{formatVND(tubePrice)} / lốc {tubeSize} trái · {pricePerShuttleLabel(...)}/trái` muted below; `Sửa`, `Bỏ` with `aria-label` `Sửa {name}` / `Bỏ {name}`. Edit and confirm modes as in `MemberRow`.
- [ ] **Step 2: `/admin`** — add `<Suspense fallback="Đang tải…"><ShuttleTypeSection /></Suspense>` after the member section.
- [ ] **Step 3: Verify** — static checks exit 0, then on `npx next dev -p 3100`, logged in on `/admin`:
  1. `Loại cầu (0)`, `Chưa có loại cầu nào.`, size field shows `12`.
  2. Add `Yonex AS-30`, `100k`, `12` → row `100.000 ₫ / lốc 12 trái · ≈ 8.333 ₫/trái`. Add `Lining`, `96.000`, `12` → `… · 8.000 ₫/trái`.
  3. Price `1.5k` → money error, all three fields keep what was typed. Price `500` → range error. Size `0` → size error.
  4. Add `yonex as-30` → duplicate error.
  5. `Sửa` `Lining` → price `100,000` → `Lưu` → row updates.
  6. `Bỏ` `Lining` → confirm → gone. Add `Lining` again → succeeds.
  7. Remove a type in a second tab, then `Sửa` → `Lưu` it in the first → `Loại cầu này không còn trong danh sách.`.
  8. Double-click `Thêm loại cầu` → one row.
  9. Members section still works; phone width (~375 px) has no horizontal scroll.
  10. Clean up test rows except one realistic type (Module 5 needs one).
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: manage shuttle types on the admin page" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

After the tasks: superpowers:finishing-a-development-branch. Merge after Module 3 (migration timestamp order). The merge into `main` applies `20261109190000_shuttle_types.sql` to production automatically; after the deploy the owner adds the group's real shuttle type(s) on production `/admin`.
