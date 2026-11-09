# Badminton

Schedule badminton sessions and split the court, water and shuttlecock costs across the group. Built with Next.js and Supabase, deployed on Vercel.

## Setup

1. Create a Free Supabase project in **Southeast Asia (Singapore)**.
2. Copy the Project URL and the publishable key (`sb_publishable_...`) from **Project Settings → API Keys**.
3. Create the editor account(s) in **Authentication → Users → Add user** (with **Auto Confirm User** enabled). Anyone can view the app without logging in; any of these accounts can edit everything.
4. Apply the migrations with the Supabase CLI: `npx supabase login`, `npx supabase link --project-ref <project-ref>`, then `npx supabase db push --remote`. Do not paste them into the SQL Editor (see `AGENTS.md` → Database).
5. Turn off **"Allow new users to sign up"** in **Authentication → Sign In / Providers**.
6. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

> **Two projects:** use a separate test project in `.env.local` for local development (keep the CLI linked to it) and keep production for Vercel. New migrations go to the test project with `npx supabase db push --remote`; production gets them automatically when they reach `main`, through the Supabase GitHub integration (production project → **Integrations → GitHub**, production branch `main`).

> **Note:** A Free Supabase project pauses after ~1 week without traffic and is restored from the dashboard.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy

1. Import the repository in [Vercel](https://vercel.com).
2. Set the environment variables for both **Production** and **Preview**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Deploy. Serverless functions are pinned to region `sin1` (Singapore) via `vercel.json` to stay close to the database.

A push to `main` deploys the app on Vercel and, at the same time, applies any new migration to the production database.

## Commands

| Command                | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start the dev server                    |
| `npm run build`        | Production build (same as Vercel)       |
| `npm run start`        | Serve the production build              |
| `npm run lint`         | Run ESLint                              |
| `npm run typecheck`    | Type-check with TypeScript              |
| `npm run format`       | Format all files with Prettier          |
| `npm run format:check` | Check formatting without changing files |

Folder structure and code conventions: see [AGENTS.md](./AGENTS.md). Modules and who is working on what: see [docs/ROADMAP.md](./docs/ROADMAP.md).
