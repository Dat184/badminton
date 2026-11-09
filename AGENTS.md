<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project: badminton app

An app for a badminton group: the organizer creates a session, ticks who came, enters the court, water and shuttlecock costs, and the app splits the total per person. It is an internal app: anyone can view everything (members, sessions, costs) without logging in; anyone can create sessions and tick attendance without logging in; logging in is for the member list and (Module 4) shuttle types, and any signed-in account can edit everything.

Stack: Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui (`base-nova` preset, Base UI primitives), Supabase (from Module 1), deployed on Vercel.

### Folder structure

```
src/
  app/             Routing only: page, layout, loading, error, route. Keep thin; call into features/.
  components/ui/   Shared, domain-agnostic UI primitives from shadcn/ui.
                   Add more with `npx shadcn@4.23.0 add <name>`.
  features/<name>/ One folder per feature (e.g. groups, sessions, billing) holding its
                   components, server actions and logic.
  lib/             Pure shared helpers with no React or database dependency (money, dates...).
  server/          Server-only code: database client and queries. Never import from client components.
public/            Static files (icons, images).
```

### Conventions

- Import through the `@/` alias (points to `src/`), e.g. `import { formatVND } from "@/lib/money"`.
- Money is always an integer number of VND; format only for display with `formatVND`.
- No automated tests in this project. Verify changes with `npm run format:check`, `npm run lint`, `npm run typecheck` and `npm run build`.
- Docs and code comments in the repo are written in English. User-facing UI text is Vietnamese.
- Commands: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`, `npm run format`, `npm run format:check`.
- Modules, their status and who is working on them: [docs/ROADMAP.md](docs/ROADMAP.md). Read it before starting any work and claim a module there first, as it describes.

### Auth

- Accounts are created by the owner in the Supabase dashboard. Sign-ups must stay disabled: with shared editing, being signed in is the only gate for writes.
- Viewing needs no login. Editing pages (`/admin`, `/login`) are not linked from public pages and are marked `noindex`; do not list them in a `robots.txt`.
- Every admin page and every admin server action calls `requireHost()` first.
- Session pages and session actions are public on purpose and never call `requireHost()`.
- The proxy (`src/proxy.ts`) is only an optimistic redirect; it does not replace server-side authorization checks.
- Never use `getSession()` on the server (use `supabase.auth.getClaims()`).
- Rows are not owned per account: there is no `host_id`, and every signed-in account edits the same data.

### Database

- Schema changes are new timestamped SQL files in `supabase/migrations/`. Never edit a file that has already been applied to either project; add a new one.
- There are two Supabase projects: **test** (the one in `.env.local`, used by `npm run dev`, and the Supabase CLI's linked project) and **production** (the Vercel env vars).
  - Test: apply new files with `npx supabase db push --remote` (check first with `npx supabase db push --remote --dry-run`). Without `--remote`, CLI v3 targets a local Docker stack.
  - Production: the Supabase GitHub integration applies new files automatically on every push to `main`. Nobody applies them by hand.
  - Never paste migration SQL into the Supabase SQL Editor. SQL run by hand is not recorded in `supabase_migrations.schema_migrations`, so the next automated run replays it and fails (`42P07 ... already exists`). If it happened anyway, record it with `npx supabase migration repair --status applied <version>`; never drop tables to "fix" it.
  - Merge migrations into `main` in timestamp order: the integration rejects a file older than the newest one already applied. If a newer migration reached `main` first, rename yours to a later timestamp before merging (and `migration repair` the old version on the test project).
  - Agents run migration commands only when the owner asks, only against the test project, and never `supabase db reset`.
- Every table enables row-level security, grants `anon` and `authenticated` `SELECT` (everything is public to view); login-gated tables (`members`, later `shuttle_types`) grant writes to `authenticated` only and their write policies check `(select auth.uid()) is not null`; public-write tables (`sessions`, `session_attendees`, and Module 5's cost tables) grant `anon` and `authenticated` only the columns the app writes, and attendance-like rows may change only while `public.session_is_open(session_id)` is true; `session_attendees` is the only table with a `DELETE` grant (unticking); sessions are archived, never deleted.
- Read policies use `using (true)`.
- Members are archived (`archived_at`), never deleted; past sessions keep their names.
