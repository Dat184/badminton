# Module 5: Session Costs, Split and Group Fund Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On a session's page anyone can enter the court fee, the shuttles used (type + count) and optional surcharges, then press `Chia tiền`: the session locks, everyone's share is shown rounded up to the thousand, and the leftover goes to a group fund shown on the home page.

**Architecture:** Cost columns (with a shuttle price snapshot) and a `split_at` lock on `sessions`, plus a `session_surcharges` table. Nothing computed is stored: totals, shares and the fund are derived from the locked inputs by pure functions in `src/lib/money.ts` and `src/features/costs/costs.ts`, so a split can never disagree with its inputs. The database enforces the lock: `public.session_is_open()` now also requires `split_at is null` (blocks attendance and surcharge changes), and a trigger rejects any update to a split session except reopening it.

**Tech Stack:** Next.js 16.4.5 (App Router, `cacheComponents: true`), React 19.3, `@supabase/ssr`, Postgres RLS + a PL/pgSQL trigger on Supabase, shadcn/ui (`base-nova`).

**Spec:** No separate spec. Scope agreed in chat on 2026-11-09:

- Prices can be entered later, not when the session is created.
- Court fee (`sân`) and shuttles (`cầu`) are always required before splitting; surcharges (`phụ phí`, e.g. water) are optional extra lines added only when there are any.
- Shuttles: pick the type (Module 4) and the number used; cost = count × (tube price / tube size), rounded **up** to the thousand (5 × 100.000/12 = 41.666 → 42.000 ₫).
- A `Chia tiền` button splits the total equally across everyone ticked (members and guests). Each share is rounded **up** to the thousand (142.000 / 3 = 47.333 → 48.000 ₫); the leftover (3 × 48.000 − 142.000 = 2.000 ₫) goes to the group fund.
- MVP. Payment marking ("đã chuyển khoản"), paying the shuttle buyer separately, QR, and spending from the fund are later modules.

Calls made by the planner (not discussed with the owner; flagged for review):

- Anyone can enter costs and press `Chia tiền`, no login — same as attendance.
- `Chia tiền` locks the session: no ticking, no cost or surcharge changes, no edit/delete of the session. A `Mở lại` button (with confirmation) unlocks it; the shares disappear from the page and the fund until someone presses `Chia tiền` again. This answers "what if someone ticks after splitting?".
- One shuttle type per session.
- Before splitting the page shows the cost lines and the total, not per-person amounts.
- The fund is shown as one number on the home page: the sum of leftovers over split, non-deleted sessions. No history page, no spending yet.
- Court fee and surcharge amounts: 1–10.000.000 ₫; shuttles used: 1–100; surcharge name 1–40 characters.

## Global Constraints

- No automated tests (owner's decision). Verify with `npm run format:check && npm run lint && npm run typecheck && npm run build`, the `node` check commands, and the curl/browser checks in each task.
- Repo docs and code comments in English; UI text in Vietnamese, exactly as in "UI copy".
- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code. Data loads render inside `<Suspense>` after `await connection()`; actions call `refresh()` after a successful write.
- Cost and split actions are public (no `requireHost()`), like Module 3's session actions.
- Money is an integer number of VND everywhere. Rounding is always **up** to the next multiple of 1.000, done with integer-safe arithmetic (`Math.ceil(a / (b * 1000)) * 1000`), never by rounding an already-rounded intermediate.
- Shares, totals and the fund are computed, never stored.
- Shuttle price is snapshotted onto the session when costs are saved (`shuttle_tube_price`, `shuttle_tube_size`); later price changes in admin do not touch saved sessions.
- Work on branch `feat/module-5-costs` from `main` (after Modules 3 and 4 are merged). Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Running migrations (test project only; production is automatic on merge) and pushing to GitHub are owner-gated: the executor asks first.

### UI copy (Vietnamese, exact)

| Where                                         | Text                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------ |
| Section heading                               | `Chi phí`                                                                            |
| Field labels                                  | `Tiền sân`, `Loại cầu`, `Số trái`                                                    |
| Placeholders                                  | `Ví dụ: 120k`; select's empty option `Chọn loại cầu`; count `Ví dụ: 5`               |
| Save costs button / pending                   | `Lưu chi phí` / `Đang lưu…`                                                          |
| No shuttle types exist                        | `Chưa có loại cầu nào, cần thêm trong trang quản lý.`                                |
| Cost lines                                    | `Tiền sân: {amount}`; `Cầu: {count} trái {typeName} = {amount}`; `{label}: {amount}` |
| Line for a cost not entered yet               | `Tiền sân: chưa nhập`; `Cầu: chưa nhập`                                              |
| Total line                                    | `Tổng: {total}`                                                                      |
| Surcharges heading                            | `Phụ phí`                                                                            |
| Surcharge inputs (`aria-label` / placeholder) | `Tên phụ phí` / `Ví dụ: Nước`; `Số tiền` / `Ví dụ: 30k`                              |
| Add surcharge button / pending                | `Thêm phụ phí` / `Đang thêm…`                                                        |
| Remove surcharge (`aria-label`)               | `Bỏ` (`Bỏ {label}`)                                                                  |
| Split button / pending                        | `Chia tiền` / `Đang chia…`                                                           |
| Split not possible yet                        | `Cần có tiền sân, tiền cầu và ít nhất 1 người đi để chia tiền.`                      |
| Share (after split)                           | `Mỗi người: {share}`                                                                 |
| Summary with leftover                         | `Thu {collected} từ {n} người, dư {surplus} vào quỹ.`                                |
| Summary without leftover                      | `Thu {collected} từ {n} người.`                                                      |
| Locked note                                   | `Đã chốt tiền. Bấm Mở lại nếu cần sửa.`                                              |
| Reopen button                                 | `Mở lại`                                                                             |
| Reopen confirmation                           | `Mở lại để sửa? Tiền chia sẽ bị hủy cho tới khi bấm Chia tiền lần nữa.`              |
| Reopen confirm buttons / pending              | `Mở lại` / `Đang mở…`, `Hủy`                                                         |
| Home: split tag on a session row              | `Đã chia tiền`                                                                       |
| Home: fund line                               | `Quỹ nhóm: {amount}`                                                                 |
| Error: court fee range                        | `Tiền sân phải từ 1.000 ₫ đến 10.000.000 ₫.`                                         |
| Error: money not understood                   | `Số tiền không hợp lệ, ví dụ 100000, 100.000 hoặc 100k.` (Module 4)                  |
| Error: type chosen, no count                  | `Nhập số trái.`                                                                      |
| Error: count given, no type                   | `Chọn loại cầu.`                                                                     |
| Error: count out of range                     | `Số trái phải từ 1 đến 100.`                                                         |
| Error: shuttle type removed meanwhile         | `Loại cầu này không còn, chọn loại khác.`                                            |
| Error: surcharge name empty / too long        | `Nhập tên phụ phí.` / `Tên phụ phí tối đa 40 ký tự.`                                 |
| Error: surcharge amount empty / range         | `Nhập số tiền.` / `Số tiền phải từ 1 ₫ đến 10.000.000 ₫.`                            |
| Error: session is split (any change)          | `Buổi này đã chốt tiền, bấm Mở lại để sửa.`                                          |
| Error: split with missing pieces (race)       | `Cần có tiền sân, tiền cầu và ít nhất 1 người đi để chia tiền.`                      |
| Error: session gone / other failure           | Module 3's `Buổi này không còn nữa.` / `Không lưu được, vui lòng thử lại.`           |
| Error: fund failed to load                    | `Không tải được quỹ nhóm.`                                                           |

## Review Focus

1. **The rounding itself.** 5 shuttles at 100.000/12 → 42.000; 12 → 100.000 (no rounding); 142.000 / 3 → 48.000 each, 144.000 collected, 2.000 to the fund; 144.000 / 3 → 48.000, 0 to the fund; 100.000 / 7 → 15.000 each, 5.000 to the fund. Pinned by Task 2 Step 1's check command and Task 3 Step 4 item 4.
2. **Changing anything after `Chia tiền`, including straight through REST.** Expected: ticking, adding/removing guests or surcharges, editing costs or the session, and deleting the session are all refused until `Mở lại`. Pinned by Task 1 Step 4 and Task 3 Step 4 items 6–7.
3. **Splitting with a missing court fee, no shuttles, or nobody ticked — including via REST.** Expected: refused. Pinned by Task 1 (constraint + trigger), Task 1 Step 4, Task 3 Step 4 item 3.
4. **The shuttle type's price changes after a session saved its shuttles, or the type is removed.** Expected: the session keeps the old price and still shows the type's name; a removed type can't be newly chosen but stays selected where it was. Pinned by Task 2 Step 3 (snapshot) and Task 3 Step 4 item 8.
5. **Reopen, change attendance, split again.** Expected: the fund on the home page drops on reopen and reflects the new leftover after the second split. Pinned by Task 3 Step 4 item 9.

---

## File Structure

| Path                                                   | Change | Responsibility                                                                  |
| ------------------------------------------------------ | ------ | ------------------------------------------------------------------------------- |
| `supabase/migrations/20261109200000_session_costs.sql` | Create | Cost columns, `session_surcharges`, new `session_is_open()`, split-lock trigger |
| `AGENTS.md`                                            | Modify | Lock rules                                                                      |
| `src/lib/money.ts`                                     | Modify | `roundUpToThousand`, `shuttleCost`, `splitBill`                                 |
| `src/features/costs/costs.ts`                          | Create | Cost types, `costsTotal`, `canSplit`, form parsers (pure)                       |
| `src/features/sessions/session.ts`                     | Modify | `splitAt` on summaries, `costs` on details                                      |
| `src/server/sessions.ts`                               | Modify | Load costs/split state, status `"split"`, error code `55000`, `getFundBalance`  |
| `src/server/costs.ts`                                  | Create | Cost, surcharge and split writes                                                |
| `src/features/costs/actions.ts`                        | Create | Public cost actions                                                             |
| `src/features/sessions/actions.ts`                     | Modify | Locked message for split sessions                                               |
| `src/features/costs/components/cost-section.tsx`       | Create | Server: composes the parts below for one session                                |
| `src/features/costs/components/cost-form.tsx`          | Create | Client: court fee + shuttle type + count                                        |
| `src/features/costs/components/surcharge-list.tsx`     | Create | Client: surcharge lines, remove, add form                                       |
| `src/features/costs/components/split-panel.tsx`        | Create | Client: total, `Chia tiền`, result, `Mở lại`                                    |
| `src/features/costs/components/fund-balance.tsx`       | Create | Server: `Quỹ nhóm` line                                                         |
| `src/features/sessions/components/*`                   | Modify | `locked` prop; split tag on home rows                                           |
| `src/app/page.tsx`                                     | Modify | Fund line                                                                       |

---

### Task 1: Cost columns, surcharges and the split lock

**Files:** Create `supabase/migrations/20261109200000_session_costs.sql`; Modify `AGENTS.md`

**Interfaces:**

- Consumes: `public.sessions`, `public.session_attendees`, `public.session_is_open()` (Module 3); `public.shuttle_types` (Module 4).
- Produces: `sessions.court_fee`, `shuttle_type_id`, `shuttle_count`, `shuttle_tube_price`, `shuttle_tube_size`, `split_at`; `public.session_surcharges (id, session_id, label, amount, created_at)`; SQLSTATE `55000` for "session is split", `23514` for "cannot split yet".

- [ ] **Step 1: Create branch** — `git switch -c feat/module-5-costs main`
- [ ] **Step 2: Write the migration** (exact):

```sql
-- Module 5: what a session cost, and the split lock.
alter table public.sessions
  add column court_fee integer check (court_fee between 1 and 10000000),
  add column shuttle_type_id uuid references public.shuttle_types (id),
  add column shuttle_count integer check (shuttle_count between 1 and 100),
  -- Price snapshot taken when the shuttles are saved; later edits to the type do not apply.
  add column shuttle_tube_price integer check (shuttle_tube_price between 1000 and 10000000),
  add column shuttle_tube_size integer check (shuttle_tube_size between 1 and 100),
  add column split_at timestamptz,
  add constraint sessions_shuttle_all_or_nothing check (
    num_nulls(shuttle_type_id, shuttle_count, shuttle_tube_price, shuttle_tube_size) in (0, 4)
  ),
  add constraint sessions_split_needs_costs check (
    split_at is null or (court_fee is not null and shuttle_count is not null)
  );

grant update (court_fee, shuttle_type_id, shuttle_count, shuttle_tube_price, shuttle_tube_size, split_at)
  on table public.sessions to anon, authenticated;

create table public.session_surcharges (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  label text not null check (label = btrim(label) and char_length(label) between 1 and 40),
  amount integer not null check (amount between 1 and 10000000),
  created_at timestamptz not null default now()
);

alter table public.session_surcharges enable row level security;

revoke all on table public.session_surcharges from anon, authenticated;
grant select on table public.session_surcharges to anon, authenticated;
grant insert (session_id, label, amount) on table public.session_surcharges to anon, authenticated;
grant delete on table public.session_surcharges to anon, authenticated;

create policy "anyone reads surcharges" on public.session_surcharges
  for select to anon, authenticated using (true);
create policy "anyone adds surcharges to an open session" on public.session_surcharges
  for insert to anon, authenticated with check (public.session_is_open(session_id));
create policy "anyone removes surcharges from an open session" on public.session_surcharges
  for delete to anon, authenticated using (public.session_is_open(session_id));

-- A split session is closed for attendance and surcharges too.
create or replace function public.session_is_open(p_session_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.sessions s
    where s.id = p_session_id and s.archived_at is null and s.split_at is null
  );
$$;

-- While split, the only allowed update is reopening (split_at back to null).
-- Splitting needs at least one attendee.
create function public.sessions_guard_split()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.split_at is not null and new.split_at is not null then
    raise exception 'session % is split; reopen it first', old.id using errcode = '55000';
  end if;
  if old.split_at is null and new.split_at is not null and not exists (
    select 1 from public.session_attendees a where a.session_id = new.id
  ) then
    raise exception 'session % has no attendees', new.id using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger sessions_guard_split
  before update on public.sessions
  for each row execute function public.sessions_guard_split();
```

- [ ] **Step 3 (owner-gated): Apply it to the test project** — with the CLI linked to the test project: `npx supabase db push --remote --dry-run` must list exactly this file, then `npx supabase db push --remote`. Never through the SQL Editor (see `AGENTS.md` → Database). The executor asks the owner before running it.
- [ ] **Step 4: Verify the lock through REST** (publishable key, same setup as Module 3; create a probe session `$SID` via `POST /rest/v1/sessions`):
  1. `PATCH sessions?id=eq.$SID` `{"split_at":"2026-11-09T00:00:00Z"}` → `"code":"23514"` (no court fee).
  2. `PATCH` `{"court_fee":120000,"shuttle_type_id":"<a type id>","shuttle_count":5,"shuttle_tube_price":100000,"shuttle_tube_size":12}` → 200. `PATCH` `{"split_at":…}` again → `"code":"23514"` (nobody ticked).
  3. `POST session_attendees` `{"session_id":"$SID","guest_name":"probe"}` → 201; `PATCH` `{"split_at":…}` → 200.
  4. `PATCH` `{"court_fee":1000}` → `"code":"55000"`; `PATCH` `{"archived_at":…}` → `"code":"55000"`; `POST session_attendees` `{"session_id":"$SID","guest_name":"probe2"}` → `"code":"42501"`; `POST session_surcharges` `{"session_id":"$SID","label":"x","amount":1000}` → `"code":"42501"`.
  5. `PATCH` `{"split_at":null}` → 200; then `PATCH` `{"archived_at":…}` → 200 (cleans up).
- [ ] **Step 5: Docs** — `AGENTS.md` "Database": a split session (`split_at` set) is read-only until reopened — `session_is_open()` closes attendance and surcharges, and the `sessions_guard_split` trigger rejects every other update; amounts (totals, shares, fund) are computed from the inputs, never stored.
- [ ] **Step 6: Verify** — static checks exit 0.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: add session costs, surcharges and split lock" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

### Task 2: Split math, cost data access and actions

**Files:** Modify `src/lib/money.ts`, `src/features/sessions/session.ts`, `src/server/sessions.ts`, `src/features/sessions/actions.ts`; Create `src/features/costs/costs.ts`, `src/server/costs.ts`, `src/features/costs/actions.ts`

**Interfaces:**

- Consumes: Module 3 (`getSessionStatus`, `SessionWriteResult`, `SessionDetail`, `ActionResult`), Module 4 (`parseVND`, `VND_MAX`, `ShuttleType`, `listActiveShuttleTypes`), `normalizeName`/`nameLength`.
- Produces:
  - `src/lib/money.ts`:
    - `roundUpToThousand(amount: number): number`
    - `shuttleCost(count: number, tubePrice: number, tubeSize: number): number` → `Math.ceil((count * tubePrice) / (tubeSize * 1000)) * 1000`
    - `type BillSplit = { total: number; people: number; share: number; collected: number; surplus: number }`
    - `splitBill(total: number, people: number): BillSplit` → `share = Math.ceil(total / (people * 1000)) * 1000`, `collected = share * people`, `surplus = collected - total`; throws if `people < 1`.
  - `src/features/costs/costs.ts` (pure):
    - `type Surcharge = { id: string; label: string; amount: number }`
    - `type SessionShuttles = { typeId: string; typeName: string; count: number; tubePrice: number; tubeSize: number }`
    - `type SessionCosts = { courtFee: number | null; shuttles: SessionShuttles | null; surcharges: Surcharge[] }`
    - `costsTotal(costs: SessionCosts): number` — court fee (or 0) + `shuttleCost` (or 0) + surcharges
    - `canSplit(costs: SessionCosts, attendeeCount: number): boolean` — court fee and shuttles present, `attendeeCount >= 1`
    - `type CostInput = { courtFee: number | null; shuttleTypeId: string | null; shuttleCount: number | null }`
    - `type CostFormValues = { courtFee: string; shuttleTypeId: string; shuttleCount: string }`
    - `parseCostForm(formData: FormData): { ok: true; input: CostInput } | { ok: false; error: string; values: CostFormValues }` — fields `court_fee`, `shuttle_type_id`, `shuttle_count`; every field may be blank (saved as `null`)
    - `SURCHARGE_LABEL_MAX_LENGTH = 40`
    - `parseSurchargeForm(formData: FormData): { ok: true; label: string; amount: number } | { ok: false; error: string; values: { label: string; amount: string } }` — fields `label`, `amount`
  - `src/features/sessions/session.ts`: `SessionSummary` gains `splitAt: string | null`; `SessionDetail` gains `costs: SessionCosts`.
  - `src/server/sessions.ts`: `getSessionStatus` returns `"open" | "split" | "missing"`; `SessionWriteResult` reasons gain `"locked"` (`55000`) and `"incomplete"` (`23514`); `getFundBalance(): Promise<number>` — throws on error.
  - `src/server/costs.ts` (`import "server-only"`), all returning `SessionWriteResult`:
    - `saveSessionCosts(sessionId: string, input: CostInput)` — reason `"not_found"` also when the chosen shuttle type is not active
    - `insertSurcharge(sessionId: string, label: string, amount: number)`
    - `deleteSurcharge(sessionId: string, surchargeId: string)`
    - `markSessionSplit(sessionId: string)`
    - `reopenSession(sessionId: string)`
  - `src/features/costs/actions.ts` (`"use server"`):
    - `type CostFormState = { error: string | null; values: CostFormValues }`
    - `type SurchargeFormState = { error: string | null; values: { label: string; amount: string } }`
    - `saveCosts(prev: CostFormState, formData: FormData): Promise<CostFormState>` — extra field `session_id`
    - `addSurcharge(prev: SurchargeFormState, formData: FormData): Promise<SurchargeFormState>` — extra field `session_id`
    - `removeSurcharge(sessionId: string, surchargeId: string): Promise<ActionResult>`
    - `splitCosts(sessionId: string): Promise<ActionResult>`
    - `reopenCosts(prev: ActionResult, formData: FormData): Promise<ActionResult>` — field `session_id`

- [ ] **Step 1: Money math** — add the three functions. Check:

Run: `node --input-type=module -e 'import { shuttleCost, splitBill } from "./src/lib/money.ts"; console.log(JSON.stringify([shuttleCost(5,100000,12), shuttleCost(12,100000,12), splitBill(142000,3), splitBill(144000,3), splitBill(100000,7)]))'`
Expected: `[42000,100000,{"total":142000,"people":3,"share":48000,"collected":144000,"surplus":2000},{"total":144000,"people":3,"share":48000,"collected":144000,"surplus":0},{"total":100000,"people":7,"share":15000,"collected":105000,"surplus":5000}]`

- [ ] **Step 2: `costs.ts`** — `parseCostForm`: court fee via `parseVND`: `empty` → `null`, `invalid` → money error, outside 1.000–`VND_MAX` → court range error. `shuttle_type_id` blank → `null`. `shuttle_count` blank → `null`, else `^\d+$` within 1–100 or `Số trái phải từ 1 đến 100.`. Type without count → `Nhập số trái.`; count without type → `Chọn loại cầu.`. `parseSurchargeForm`: label via `normalizeName` (empty → `Nhập tên phụ phí.`, > 40 → `Tên phụ phí tối đa 40 ký tự.`); amount via `parseVND` (`empty` → `Nhập số tiền.`, `invalid` → money error, outside 1–`VND_MAX` → surcharge range error).
- [ ] **Step 3: Server** —
  - `src/server/sessions.ts`: `listSessions` also selects `split_at`. `getSessionDetail` also selects the cost columns, `shuttle_types(name)` and `session_surcharges(id, label, amount, created_at)` (surcharges by `created_at`), and builds `costs` (`shuttles` from the snapshot columns plus the joined name, which is still readable after the type is archived). `getSessionStatus`: archived/unknown → `missing`, `split_at` set → `split`. `getFundBalance`: active sessions with `split_at` not null, same cost columns + `session_surcharges(amount)` + `session_attendees(count)`; sum `splitBill(costsTotal(costs), count).surplus`.
  - `src/server/costs.ts`: `saveSessionCosts` with a type id first reads that type (`archived_at` null; missing → `not_found`), then updates the session with the type id, count and the type's current `tube_price`/`tube_size`; with no type it nulls all four shuttle columns. Updates filter `.eq("id", sessionId).is("archived_at", null).is("split_at", null).select("id")` (`reopenSession` uses `.not("split_at", "is", null)` and sets `split_at: null`). `markSessionSplit` sets `split_at` to `new Date().toISOString()`. Zero rows → `not_found`; error codes as Module 3 plus `55000` → `locked`, `23514` → `incomplete`.
- [ ] **Step 4: Actions** — every cost action and every Module 3 session action first awaits `getSessionStatus`: `missing` → `Buổi này không còn nữa.`; `split` → `Buổi này đã chốt tiền, bấm Mở lại để sửa.` (except `reopenCosts`, which needs `split`; `open` there is a silent success). A write that fails with `closed`, `locked` or `not_found` re-reads the status and picks the message the same way, so a split that raced the write reads correctly. `not_found` from `saveSessionCosts` while the session is open → `Loại cầu này không còn, chọn loại khác.`. `incomplete` → the split-not-possible message. Success → `refresh()`.
- [ ] **Step 5: Verify** — static checks exit 0; Step 1's command still prints the expected line.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: add split math, cost data access and actions" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

### Task 3: Costs on the session page, fund on the home page

**Files:** Create the five `src/features/costs/components/*` files; Modify `session-detail.tsx`, `session-header.tsx`, `attendance-list.tsx`, `session-list.tsx`, `src/app/page.tsx`

**Interfaces:**

- Consumes: Task 2; `listActiveShuttleTypes`; Module 3 components.
- Produces: `CostSection({ session, shuttleTypes }: { session: SessionDetail; shuttleTypes: ShuttleType[] })`; `CostForm({ sessionId, costs, shuttleTypes })`; `SurchargeList({ sessionId, surcharges })`; `SplitPanel({ sessionId, costs, attendeeCount, splitAt })`; `FundBalance()`; `SessionHeader` and `AttendanceList` gain `locked: boolean`.

- [ ] **Step 1: Session page** — `SessionDetailView` also loads `listActiveShuttleTypes()` in the same `Promise.all`, passes `locked = session.splitAt !== null` to `SessionHeader` (hides `Sửa`/`Xóa buổi`) and `AttendanceList` (checkboxes disabled, guest `Bỏ` and add form hidden), and renders `CostSection` below attendance.
- [ ] **Step 2: Cost components** —
  - `CostSection`: heading `Chi phí`; the cost lines (always shown: entered amounts, or `chưa nhập`; each surcharge; `Tổng`); when open, `CostForm` and `SurchargeList` under them; always `SplitPanel` last.
  - `CostForm`: `Tiền sân` text input (`autoComplete="off"`, default = saved fee as plain digits or empty), native `<select name="shuttle_type_id">` styled like `Input` with the empty option `Chọn loại cầu` and one option per active type (`{name} · {pricePerShuttleLabel}/trái`) — if the session's saved type is not among them, add it as an extra option so the form shows what is saved; `Số trái` number input (1–100). No types at all → the no-types copy instead of the select and count. `Lưu chi phí` with pending label; error `role="alert"`.
  - `SurchargeList`: each surcharge with a `Bỏ` button (direct `removeSurcharge` call in a transition, disabled while pending); add form with the two inputs side by side on wide screens, stacked at phone width, and `Thêm phụ phí`.
  - `SplitPanel`: open → `Chia tiền` button, disabled with the not-possible copy under it when `!canSplit(costs, attendeeCount)`; calls `splitCosts` in a transition. Split → `Mỗi người: {share}` (large), the summary line, the locked note, and `Mở lại`, which turns into the reopen confirmation (form posting `reopenCosts`, `Hủy` autofocused). Use `splitBill(costsTotal(costs), attendeeCount)` for the numbers.
- [ ] **Step 3: Home** — `FundBalance`: `connection()`, `getFundBalance()` in try/catch (fund error copy), renders `Quỹ nhóm: {formatVND(amount)}`. Put it under the intro paragraph in `src/app/page.tsx` inside its own `<Suspense fallback="Đang tải…">`. `SessionList` rows show a small `Đã chia tiền` tag when `splitAt` is set.
- [ ] **Step 4: Verify** — static checks exit 0, then on `npx next dev -p 3100`, not logged in, test project with shuttle type `Yonex AS-30`, 100.000 ₫ / 12:
  1. New session → `Tiền sân: chưa nhập`, `Cầu: chưa nhập`, `Tổng: 0 ₫`, `Chia tiền` disabled with its hint.
  2. Enter `120k` → `Tiền sân: 120.000 ₫`. Pick `Yonex AS-30` + `5` → `Cầu: 5 trái Yonex AS-30 = 42.000 ₫`. Type only a count → `Chọn loại cầu.`. `1.5k` → money error, typed values kept.
  3. With nobody ticked, `Chia tiền` stays disabled. Tick two members and add one guest.
  4. Total is 162.000 ₫ → `Chia tiền` → `Mỗi người: 54.000 ₫`, `Thu 162.000 ₫ từ 3 người.`. `Mở lại` → confirm; add surcharge `Nước` `20k` → total 182.000 ₫ → `Chia tiền` → `Mỗi người: 61.000 ₫`, `Thu 183.000 ₫ từ 3 người, dư 1.000 ₫ vào quỹ.`. Home: `Quỹ nhóm: 1.000 ₫` and the row shows `Đã chia tiền`.
  5. While split: checkboxes disabled, no guest add/remove, no `Sửa`/`Xóa buổi`, no cost form or surcharge add/remove.
  6. Two tabs: split in tab A; in tab B (not refreshed) tick someone → `Buổi này đã chốt tiền, bấm Mở lại để sửa.`; `Lưu chi phí` in tab B → same message.
  7. A probe REST `PATCH` of `court_fee` on the split session → `"code":"55000"`.
  8. On `/admin` (logged in) change `Yonex AS-30` to 120.000 ₫ → the split session still shows `= 42.000 ₫`. Remove the type → that session still shows its name; a new session's select no longer offers it.
  9. `Mở lại` → home fund back to `0 ₫`; untick one person → `Chia tiền` → new share and leftover; home fund matches the new leftover.
  10. Phone width (~375 px): no horizontal scroll; the cost form and surcharge form fit.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: show session costs, split and group fund" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

After the tasks: superpowers:finishing-a-development-branch. Merge after Modules 3 and 4. The merge into `main` applies `20261109200000_session_costs.sql` to production automatically.
