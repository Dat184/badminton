<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project: badminton app

An app for a badminton group: the organizer creates a session, ticks who came, enters the court, water and shuttlecock costs, and the app splits the total per person. Members open a shared link to see what they owe and mark themselves as paid. Only the organizer logs in, and only to edit.

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

### Auth

- Only the host logs in. Sign-ups must stay disabled in Supabase.
- Every admin page and every admin server action calls `requireHost()` first.
- The proxy (`src/proxy.ts`) is only an optimistic redirect; it does not replace server-side authorization checks.
- Never use `getSession()` on the server (use `supabase.auth.getClaims()`).
- From Module 2 on, Postgres row-level-security write policies must check the host's user id, not just "authenticated".
