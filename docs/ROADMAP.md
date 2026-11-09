# Roadmap

The app is built as an MVP, one small module at a time. This file is the shared list of modules and who is working on what, for every developer and every AI agent working in this repo.

## How to use this file

1. **Before starting work**, pull `main` and read this table. Pick a module whose status is `Open` and whose dependencies are `Done` (or available on `main`, as noted).
2. **Claim it first**: in one small commit on `main`, set its status to `In progress`, put your GitHub handle under Owner and your branch name under Branch, and push. Then create the branch and start. Whoever pushes the claim first owns the module; if your push is rejected, pull and check again.
3. **A module without a plan needs one first.** Write it in `docs/superpowers/plans/` (same format as the existing plans) and get the owner's approval before writing code.
4. **When the branch is merged**, set the status to `Done` in the same merge or right after.
5. One module per person at a time. If you stop, set the row back to `Open` and say in the Notes column where you stopped.

Statuses: `Open`, `In progress`, `Done`, `Needs plan`.

## Modules

| Module | What it delivers                                                                                 | Status     | Owner  | Branch                   | Plan                                                                      | Depends on                                        |
| ------ | ------------------------------------------------------------------------------------------------ | ---------- | ------ | ------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------- |
| M0     | Project foundation (structure, tooling, shadcn/ui)                                               | Done       | Dat184 | —                        | [module 0](superpowers/plans/2026-11-09-module-0-foundation.md)           | —                                                 |
| M1     | Supabase, editor login, first Vercel deploy                                                      | Done       | Dat184 | —                        | [module 1](superpowers/plans/2026-11-09-module-1-supabase-auth-deploy.md) | M0                                                |
| M2     | Member list on `/admin`, public read access                                                      | Done       | Dat184 | —                        | [module 2](superpowers/plans/2026-11-09-module-2-member-list.md)          | M1                                                |
| M3     | Sessions: anyone creates a session and ticks themselves in/out without login; guests per session | Done       | Dat184 | `feat/module-3-sessions` | [module 3](superpowers/plans/2026-11-09-module-3-sessions.md)             | M2                                                |
| M4     | Shuttle types on `/admin` (name, tube price, shuttles per tube)                                  | Open       |        |                          | [module 4](superpowers/plans/2026-11-09-module-4-shuttle-types.md)        | `src/lib/names.ts` from M3 Task 2 being on `main` |
| M5     | Session costs (court, shuttles, surcharges), `Chia tiền` split rounded up to 1.000 ₫, group fund | Open       |        |                          | [module 5](superpowers/plans/2026-11-09-module-5-costs-and-split.md)      | M3, M4                                            |
| M6     | Mark "đã chuyển khoản" per person                                                                | Needs plan |        |                          | —                                                                         | M5                                                |
| M7     | Upload a payment QR image once and show it on session pages                                      | Needs plan |        |                          | —                                                                         | —                                                 |

### Open questions for modules without a plan

- **M6:** the shuttles are bought by a different member than the one who pays the court, so the shuttle share may be owed to that member. Who can mark someone as paid without logging in?
- **M7:** one QR for the whole group, or one per payee (court payer and shuttle buyer)? Needs Supabase Storage.

## Working in parallel

- Files several modules touch: `AGENTS.md`, `src/lib/money.ts`, `src/app/admin/page.tsx`, `src/app/page.tsx`. Keep edits there small and rebase on `main` before merging.
- Migrations run in filename order. Planned names: M3 `20261109180000_sessions.sql`, M4 `20261109190000_shuttle_types.sql`, M5 `20261109200000_session_costs.sql`. A new module uses a timestamp later than every file already on `main`, and modules with migrations merge into `main` in timestamp order (production rejects an older file once a newer one is applied).
- Migrations: on the test project with `npx supabase db push --remote` (ask the owner for access); production applies them automatically when they reach `main`. Never paste migration SQL into the SQL Editor. Details in `AGENTS.md` → Database.
- Merging into `main` deploys the app on Vercel and applies new migrations to the production database at the same time.
