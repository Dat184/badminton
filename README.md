# Badminton

Schedule badminton sessions and split the court, water and shuttlecock costs across the group. Built with Next.js and Supabase, deployed on Vercel.

## Setup

1. Create a Free Supabase project in **Southeast Asia (Singapore)**.
2. Copy the Project URL and the publishable key (`sb_publishable_...`) from **Project Settings → API Keys**.
3. Create the single host user in **Authentication → Users → Add user** (with **Auto Confirm User** enabled). Never delete this user later: the member list belongs to its user id and is deleted with it. If the password is lost, reset it from the same screen instead.
4. In the **SQL Editor**, run each file in `supabase/migrations/` in filename order.
5. Turn off **"Allow new users to sign up"** in **Authentication → Sign In / Providers**.
6. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

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

Folder structure and code conventions: see [AGENTS.md](./AGENTS.md).
