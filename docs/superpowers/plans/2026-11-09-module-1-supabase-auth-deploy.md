# Module 1: Supabase, Host Login & First Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the app to Supabase, let the single host log in and out with email + password, protect `/admin`, and get the app deployed on Vercel from a private GitHub repo.

**Architecture:** Supabase Auth via `@supabase/ssr` cookie sessions. A Next.js `proxy.ts` (Next 16's renamed middleware) refreshes the session and does the optimistic redirect for `/admin` and `/login`; a server-side `requireHost()` check is the real gate and is called by every admin page and, from Module 2 on, every admin server action. Login/logout are server actions; the login form is a client component using `useActionState`.

**Tech Stack:** Next.js 16.4.5 (App Router, `cacheComponents: true`), React 19.3, `@supabase/ssr@^0.12.7`, `@supabase/supabase-js@^2.119.0`, shadcn/ui 4.23.0 (`base-nova`), Vercel (Hobby), GitHub via `gh`.

**Spec:** No separate spec. Scope agreed in chat on 2026-11-09: only the host logs in, and only to edit; anyone with a link can view (Module 4). Host account is email + password, created in the Supabase dashboard; no sign-up page. Database is Supabase. Deploy on Vercel. No automated tests.

## Global Constraints

- No automated tests (owner's decision). A task is verified by `npm run format:check && npm run lint && npm run typecheck && npm run build` plus the explicit curl/browser checks in its steps.
- Repo docs and code comments in English; user-facing UI text in Vietnamese, exactly as listed under "UI copy" below.
- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code. `cacheComponents` is on: any component that reads cookies (directly, through the Supabase server client, or through `requireHost()`) must render inside `<Suspense>` and never at a layout's top level — otherwise `next build` fails.
- Env var names exactly `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. No service-role / secret key anywhere in this module.
- Server-side auth checks use `supabase.auth.getClaims()`, never `getSession()`.
- Exactly one host account. Sign-ups stay disabled in Supabase; the app has no sign-up page.
- Add shadcn primitives only with `npx shadcn@4.23.0 add <name>`.
- Work on branch `feat/module-1-auth` created from `main`. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Creating the GitHub repo and pushing are outward-facing: the executor asks the owner before running them (Task 4).

### UI copy (Vietnamese, exact)

| Where                             | Text                                      |
| --------------------------------- | ----------------------------------------- |
| `/login` metadata title / heading | `Đăng nhập`                               |
| Field labels                      | `Email`, `Mật khẩu`                       |
| Submit button / while pending     | `Đăng nhập` / `Đang đăng nhập…`           |
| Error: empty field                | `Nhập email và mật khẩu.`                 |
| Error: wrong email or password    | `Email hoặc mật khẩu không đúng.`         |
| Error: anything else              | `Không đăng nhập được, vui lòng thử lại.` |
| `/admin` metadata title / heading | `Quản lý`                                 |
| Greeting                          | `Xin chào, {email}`                       |
| Suspense fallback                 | `Đang tải…`                               |
| Sign-out button                   | `Đăng xuất`                               |

## Review Focus

1. **Self sign-up through the public API.** The publishable key ships to every browser, so if Supabase sign-ups are on, anyone can create an account and become "authenticated" — which Module 2's database rules would otherwise trust. Expected: the sign-up endpoint refuses. Pinned by Task 0 Step 6.
2. **A stale, tampered or garbage session cookie on `/admin`.** Expected: redirect to `/login`, never a 500. Pinned by Task 2 Step 6.
3. **Refreshed session cookies lost on redirect.** When the proxy redirects, cookies Supabase just rotated must be copied onto the redirect response, or the host gets logged out at random. Pinned by Task 2 Step 3 (algorithm) and the Task 3 browser checklist (stay logged in across reloads).
4. **Wrong password, double submit, Supabase unreachable.** Expected: a Vietnamese error in the form, button disabled while pending, no crash. Pinned by Task 3 Steps 5–6.
5. **Missing env vars on Vercel.** Expected: a clear error naming the missing variable instead of a cryptic Supabase failure. Pinned by Task 2 Step 2 (`getSupabaseEnv` message) and Task 4 Step 6 (owner sets both vars for Production and Preview).

---

## File Structure

| Path                                                                     | Change              | Responsibility                                         |
| ------------------------------------------------------------------------ | ------------------- | ------------------------------------------------------ |
| `src/app/layout.tsx`, `src/app/globals.css`, `AGENTS.md`, `package.json` | Modify (Task 1)     | Module 0 review minors                                 |
| `.env.example`, `.gitignore`                                             | Create / Modify     | Document env vars; un-ignore the example               |
| `src/server/supabase/env.ts`                                             | Create              | Read + validate the two env vars                       |
| `src/server/supabase/server.ts`                                          | Create              | Supabase client for Server Components / Server Actions |
| `src/server/supabase/session.ts`                                         | Create              | `updateSession()` used by `src/proxy.ts`               |
| `src/proxy.ts`                                                           | Create              | Next proxy entry + matcher                             |
| `src/server/auth.ts`                                                     | Create              | `requireHost()` — the real auth gate                   |
| `src/features/auth/actions.ts`                                           | Create              | `signIn`, `signOut` server actions                     |
| `src/features/auth/components/login-form.tsx`                            | Create              | Client login form                                      |
| `src/features/auth/components/sign-out-button.tsx`                       | Create              | Sign-out form button                                   |
| `src/app/login/page.tsx`, `src/app/admin/page.tsx`                       | Create              | Routes                                                 |
| `src/components/ui/{input,label,card}.tsx`                               | Create (shadcn CLI) | UI primitives                                          |
| `vercel.json`                                                            | Create              | Pin functions to Singapore (`sin1`)                    |
| `README.md`, `AGENTS.md`                                                 | Modify              | Setup, env, deploy, auth conventions                   |

---

### Task 0: Owner setup in Supabase (manual, before Task 2)

The owner does Steps 1–5 in the browser; the executor does Step 6. If the executor reaches Task 2 without `.env.local`, stop and ask the owner.

- [ ] **Step 1 (owner):** supabase.com → New project: name `badminton`, region **Southeast Asia (Singapore)**, Free plan. Keep the database password somewhere safe (not in the repo).
- [ ] **Step 2 (owner):** Project Settings → API Keys: copy the Project URL and the **publishable** key (`sb_publishable_…`).
- [ ] **Step 3 (owner):** Authentication → Users → Add user → Create new user: the host's email + a strong password, tick **Auto Confirm User**.
- [ ] **Step 4 (owner):** Authentication → Sign In / Providers: turn **off** "Allow new users to sign up".
- [ ] **Step 5 (owner):** create `.env.local` in the repo root (already git-ignored):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

- [ ] **Step 6 (executor): verify sign-ups are refused**

Run: `set -a; . ./.env.local; set +a; curl -s -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/signup" -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" -H "Content-Type: application/json" -d '{"email":"signup-probe@example.com","password":"probe-Password-123"}'`
Expected: JSON containing `"error_code":"signup_disabled"`. If it returns a user instead: stop, ask the owner to delete `signup-probe@example.com` in Authentication → Users and redo Step 4.

---

### Task 1: Module 0 review minors

**Files:** Modify `src/app/layout.tsx:5`, `src/app/globals.css:10`, `AGENTS.md` (Conventions), `package.json` + `package-lock.json`

- [ ] **Step 1: Create the branch** — `git checkout -b feat/module-1-auth`
- [ ] **Step 2:** `src/app/layout.tsx:5` comment → `// Preload the vietnamese subset so diacritics (ạ, ế, ữ...) don't briefly render in the fallback font.`
- [ ] **Step 3:** `src/app/globals.css` → `--font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;`
- [ ] **Step 4:** `AGENTS.md` "No automated tests" bullet → verification list becomes `npm run format:check`, `npm run lint`, `npm run typecheck` and `npm run build`.
- [ ] **Step 5:** Move the shadcn CLI to devDependencies: `npm install -D shadcn@^4.23.0` (it is only needed at build time for `@import "shadcn/tailwind.css"`).
- [ ] **Step 6: Verify**

Run: `node -e 'const p=require("./package.json");console.log(!!p.devDependencies.shadcn, !!(p.dependencies||{}).shadcn)'`
Expected: `true false`
Run: `npm ls --depth=0 && npm run format:check && npm run lint && npm run typecheck && npm run build`
Expected: all exit 0.
Run: `grep -o -h -E -e '--font-sans:[^;}]*' .next/static/chunks/*.css | sort -u`
Expected: `--font-sans:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif` (minifier may drop spaces).

- [ ] **Step 7: Commit** — `git add -A && git commit -m "chore: apply module 0 review fixes" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

### Task 2: Supabase clients, proxy and the auth gate

**Files:** Create `.env.example`, `src/server/supabase/env.ts`, `src/server/supabase/server.ts`, `src/server/supabase/session.ts`, `src/proxy.ts`, `src/server/auth.ts`; Modify `.gitignore`, `package.json`, `package-lock.json`

**Interfaces:**

- Produces:
  - `getSupabaseEnv(): { url: string; publishableKey: string }` (`src/server/supabase/env.ts`)
  - `createSupabaseServerClient(): Promise<SupabaseClient>` (`src/server/supabase/server.ts`)
  - `updateSession(request: NextRequest): Promise<NextResponse>` (`src/server/supabase/session.ts`)
  - `type Host = { id: string; email: string }` and `requireHost(): Promise<Host>` (`src/server/auth.ts`) — redirects to `/login` when there is no valid session.

- [ ] **Step 1: Install** — `npm install @supabase/ssr@^0.12.7 @supabase/supabase-js@^2.119.0 server-only`
- [ ] **Step 2: `env.ts`** — `getSupabaseEnv()` reads both vars and throws `new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_URL")` (or `..._PUBLISHABLE_KEY`) when one is empty or unset. Reference each var as a literal `process.env.NEXT_PUBLIC_…` expression so Next inlines it.
- [ ] **Step 3: `session.ts`** — `updateSession(request)`, imported only by `src/proxy.ts`. Algorithm (the cookie juggling is the part the signature doesn't determine):

```ts
let response = NextResponse.next({ request });
const supabase = createServerClient(url, publishableKey, {
  cookies: {
    getAll: () => request.cookies.getAll(),
    setAll(cookiesToSet, headers) {
      cookiesToSet.forEach(({ name, value }) =>
        request.cookies.set(name, value),
      );
      response = NextResponse.next({ request });
      cookiesToSet.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options),
      );
      Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
    },
  },
});
const { data } = await supabase.auth.getClaims(); // call before any branching
const loggedIn = Boolean(data?.claims);
// !loggedIn && path starts with /admin → redirect /login
// loggedIn && path === /login        → redirect /admin
// Every redirect copies response.cookies.getAll() and the cache headers onto the redirect response.
return response;
```

- [ ] **Step 4: `src/proxy.ts`** — `export async function proxy(request: NextRequest) { return updateSession(request); }` with `export const config = { matcher: ["/admin/:path*", "/login"] }` (public pages never pay for a Supabase call).
- [ ] **Step 5: `server.ts` and `auth.ts`** (both start with `import "server-only"`)
  - `createSupabaseServerClient()`: `createServerClient` with `getAll` from `await cookies()` and a `setAll` that writes via `cookieStore.set` inside `try { … } catch {}` (Server Components can't set cookies; the proxy already refreshed them).
  - `requireHost()`: `getClaims()`; no claims → `redirect("/login")`; else return `{ id: claims.sub, email: claims.email ?? "" }`.
  - Add `!.env.example` after the `.env*` line in `.gitignore`; create `.env.example` with both var names and empty values.

- [ ] **Step 6: Verify** (needs Task 0's `.env.local`)

Run: `npm run format:check && npm run lint && npm run typecheck && npm run build`
Expected: all exit 0.
Run: `npx next dev -p 3100` in the background, wait for `Ready`, then:
`curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3100/admin`
Expected: `307 http://localhost:3100/login`
`curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Cookie: sb-x-auth-token=garbage" http://localhost:3100/admin`
Expected: `307 http://localhost:3100/login`
`curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/`
Expected: `200`. Stop the dev server.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: add supabase clients, session proxy and host auth gate" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

### Task 3: Login and admin pages

**Files:** Create `src/features/auth/actions.ts`, `src/features/auth/components/login-form.tsx`, `src/features/auth/components/sign-out-button.tsx`, `src/app/login/page.tsx`, `src/app/admin/page.tsx`; CLI creates `src/components/ui/{input,label,card}.tsx`

**Interfaces:**

- Consumes: `createSupabaseServerClient()`, `requireHost()`, `Host` (Task 2).
- Produces (`src/features/auth/actions.ts`, `"use server"`):
  - `type SignInState = { error: string | null }`
  - `signIn(prevState: SignInState, formData: FormData): Promise<SignInState>` — fields `email`, `password`
  - `signOut(): Promise<void>` — always ends in `redirect("/login")`

- [ ] **Step 1: Add primitives** — `npx -y shadcn@4.23.0 add input label card`
- [ ] **Step 2: `signIn`** — trim email; empty email or password → `{ error: "Nhập email và mật khẩu." }`. `signInWithPassword`; error with `code === "invalid_credentials"` → `{ error: "Email hoặc mật khẩu không đúng." }`; any other error → `{ error: "Không đăng nhập được, vui lòng thử lại." }`; success → `redirect("/admin")` (outside any try/catch, since `redirect` throws).
- [ ] **Step 3: `signOut`** — `supabase.auth.signOut()` then `redirect("/login")`.
- [ ] **Step 4: Components and pages**
  - `login-form.tsx` (`"use client"`): `useActionState(signIn, { error: null })`; email input `type="email" autoComplete="email" required`, password `type="password" autoComplete="current-password" required`; button disabled while `pending` with the pending label; error shown with `role="alert"`. Wrapped in a `Card`, centered, max width `sm`, mobile-first.
  - `sign-out-button.tsx`: `<form action={signOut}>` with a `Button variant="outline"`.
  - `/login/page.tsx`: static; metadata title `Đăng nhập`; renders `LoginForm`.
  - `/admin/page.tsx`: metadata title `Quản lý`; heading and `SignOutButton` in the static shell; `<Suspense fallback="Đang tải…">` around an async `HostGreeting` that calls `requireHost()` and renders `Xin chào, {email}`.
- [ ] **Step 5: Verify build** — `npm run format:check && npm run lint && npm run typecheck && npm run build` → all exit 0 (a build error about uncached data outside `<Suspense>` means a cookie read escaped the boundary).
- [ ] **Step 6: Browser checklist (owner types the password; executor may drive the browser)** on `npx next dev -p 3100`:
  1. Logged out, open `/admin` → lands on `/login`.
  2. Submit with the wrong password → `Email hoặc mật khẩu không đúng.`, still on `/login`; button shows `Đang đăng nhập…` and is disabled while submitting.
  3. Correct credentials → `/admin` shows `Xin chào, <host email>`.
  4. Reload `/admin` twice → still logged in. Open `/login` → sent back to `/admin`.
  5. `Đăng xuất` → `/login`; open `/admin` again → `/login`.
  6. Narrow the window to phone width (~375 px): form fits with no horizontal scroll.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: add host login and admin page" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

---

### Task 4: Deploy config, GitHub and Vercel

**Files:** Create `vercel.json`; Modify `package.json` (`engines`), `README.md`, `AGENTS.md`

- [ ] **Step 1:** `vercel.json` → `{ "$schema": "https://openapi.vercel.sh/vercel.json", "regions": ["sin1"] }` (functions next to the Singapore database). `package.json` → `"engines": { "node": "24.x" }`.
- [ ] **Step 2: Docs.** README gains "Setup" (Task 0 Steps 1–5 condensed; note that a Free Supabase project pauses after ~1 week without traffic and is restored from the dashboard) and "Deploy" (Vercel import, the two env vars for Production and Preview, region `sin1`). AGENTS.md gains an "Auth" section: only the host logs in; every admin page and every admin server action calls `requireHost()` first; the proxy is only an optimistic redirect; never use `getSession()` on the server; sign-ups must stay disabled; from Module 2 on, Postgres row-level-security write policies must check the host's user id, not just "authenticated".
- [ ] **Step 3: Verify** — `npm run format:check && npm run lint && npm run typecheck && npm run build` → all exit 0.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "chore: add vercel config, node engine and setup docs" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`
- [ ] **Step 5: GitHub (ask the owner first: account and repo name)** — default `gh repo create badminton --private --source . --remote origin`, then `git push -u origin main` and `git push -u origin feat/module-1-auth`.
      Expected: `gh repo view --json visibility -q .visibility` prints `PRIVATE`.
- [ ] **Step 6 (owner): Vercel** — vercel.com → Add New → Project → import the repo; add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for **Production and Preview**; Deploy. `main` becomes the production deployment; `feat/module-1-auth` gets a preview deployment.
- [ ] **Step 7 (owner): Preview check** — open the branch's preview URL (Vercel asks you to log in to Vercel for previews) and repeat Task 3 Step 6 items 1, 3 and 5.

After the branch is merged (superpowers:finishing-a-development-branch), push `main` and confirm on the production URL: `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://<prod-domain>/admin` → `307 https://<prod-domain>/login`.
