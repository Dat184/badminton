# Module 0: Cleanup & Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current uncommitted scaffold into a clean, committed foundation: no test tooling, shadcn/ui installed, English docs.

**Architecture:** Next.js 16 App Router with all application code under `src/` (`app/` routing only, `components/ui/` shadcn primitives, `features/<name>/` per-feature code, `lib/` pure helpers, `server/` server-only code). No product features in this module.

**Tech Stack:** Next.js 16.4.5, React 19.3, Tailwind CSS v4 (via `@tailwindcss/turbopack` loader, no PostCSS), shadcn CLI 4.23.0 (preset `base-nova`, Base UI primitives), Prettier 3 + `prettier-plugin-tailwindcss`, npm, Node 24.

**Spec:** No separate spec. Scope agreed in chat on 2026-11-09 (Module 0 of: 0 foundation → 1 Supabase + host login + Vercel deploy → 2 member list → 3 sessions + costs + equal split → 4 public view + self-mark paid → 5 QR upload).

## Global Constraints

- No automated tests in this app (owner's decision). Verification = `npm run lint`, `npm run typecheck`, `npm run build`, `npm run format:check`, plus the explicit checks in each task.
- All documentation inside the repo (README, AGENTS.md, docs/, code comments) is written in English. User-facing UI text stays Vietnamese.
- Money is always an integer number of VND; format only for display (`formatVND`).
- Import alias `@/*` → `./src/*`. Do not move `public/`, config files or `.env*` into `src/`.
- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code (Next 16 differs from older versions).
- Work on branch `chore/module-0-foundation`, created from `main`. Every commit message ends with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Vietnamese diacritics (ạ, ế, ữ) must render in Geist: shadcn init writes the self-referencing `--font-sans: var(--font-sans);`, which silently breaks the font. Pinned by Task 3 Step 3 and Step 6.
2. Brainstorm mockups in `.superpowers/` must never be committed. Pinned by Task 1 Step 3.
3. A phone set to dark mode must still show readable text: the old `prefers-color-scheme` block is replaced by shadcn's class-based `.dark`, so the app is light-only until a theme toggle exists. Pinned by Task 3 Step 4.
4. Vercel installs from `package-lock.json`: after removing and adding packages, the lockfile must match `package.json`. Pinned by `npm ls --depth=0` in Tasks 2 and 3.
5. Prettier rewrites shadcn's generated files (it adds semicolons); the reformatted files must still build. Pinned by Task 3 Step 5 → Step 6 order.

---

## File Structure

| Path                                         | Change                       | Responsibility                                                |
| -------------------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| `.gitignore`                                 | Modify                       | Add `.superpowers/`                                           |
| `package.json`, `package-lock.json`          | Modify                       | Drop Vitest deps + `test`/`test:run` scripts; add shadcn deps |
| `vitest.config.mts`, `src/lib/money.test.ts` | Delete                       | Test tooling removed                                          |
| `components.json`                            | Create (by shadcn CLI)       | shadcn config                                                 |
| `src/lib/utils.ts`                           | Create (by shadcn CLI)       | Re-exports `cn`                                               |
| `src/components/ui/button.tsx`               | Create (by shadcn CLI)       | First UI primitive (used by Module 1 login form)              |
| `src/components/ui/.gitkeep`                 | Delete                       | Folder no longer empty                                        |
| `src/app/globals.css`                        | Modify (by CLI + manual fix) | shadcn theme tokens; font fix                                 |
| `src/app/layout.tsx`, `src/lib/money.ts`     | Modify                       | Comments translated to English                                |
| `README.md`, `AGENTS.md`                     | Modify                       | English, describe final state                                 |

---

### Task 1: Commit the existing scaffold on a branch

The working tree already holds the earlier scaffold (app moved to `src/`, Prettier, Vitest, Vietnamese docs). Commit it as-is so later tasks have reviewable diffs.

**Files:**

- Modify: `.gitignore` (append at end)

**Interfaces:**

- Produces: branch `chore/module-0-foundation` with a clean working tree.

- [ ] **Step 1: Create the branch**

Run: `git checkout -b chore/module-0-foundation`
Expected: `Switched to a new branch 'chore/module-0-foundation'`

- [ ] **Step 2: Ignore brainstorm files** — append to `.gitignore`:

```
# superpowers brainstorm mockups
.superpowers/
```

- [ ] **Step 3: Verify ignore + checks**

Run: `git status --short --untracked-files=all | grep -c superpowers/brainstorm`
Expected: `0`
Run: `npm run lint && npm run typecheck && npm run build`
Expected: all exit 0; build lists route `/`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: move app into src/, add prettier, restructure folders

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: `git status --short` prints nothing.

---

### Task 2: Remove test tooling

**Files:**

- Delete: `vitest.config.mts`, `src/lib/money.test.ts`
- Modify: `package.json` (deps + scripts), `package-lock.json`

**Interfaces:**

- Consumes: Task 1 branch.
- Produces: `package.json` scripts exactly: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`. `src/lib/money.ts` keeps `formatVND(amount: number): string`.

- [ ] **Step 1: Uninstall** — `npm uninstall vitest vite-tsconfig-paths`. Keep `@types/node@^24` (matches the Node 24 runtime).
- [ ] **Step 2: Delete** `vitest.config.mts` and `src/lib/money.test.ts`; remove the `test` and `test:run` entries from `package.json` `scripts`.
- [ ] **Step 3: Verify**

Run: `grep -rn -i vitest --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude-dir=docs --exclude-dir=.superpowers . ; npm ls --depth=0`
Expected: grep prints nothing except possibly AGENTS.md/README.md lines (fixed in Task 4); `npm ls` exits 0 with no `missing`/`extraneous`.
Run: `npm run lint && npm run typecheck && npm run build`
Expected: all exit 0.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove vitest test tooling

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Install shadcn/ui

**Files:**

- Create (CLI): `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`
- Modify: `src/app/globals.css`, `package.json`, `package-lock.json`
- Delete: `src/components/ui/.gitkeep`

**Interfaces:**

- Produces: `import { Button } from "@/components/ui/button"`; `import { cn } from "@/lib/utils"` (re-export of the `cn` package from github.com/shadcn-ui/cn). Add more primitives later with `npx shadcn@4.23.0 add <name>`.

- [ ] **Step 1: Run the CLI** — `npx -y shadcn@4.23.0 init -d` (defaults = template `next`, preset `base-nova`).
      Expected output ends with `Project initialization completed.` and lists `src/components/ui/button.tsx`, `src/lib/utils.ts`. It adds deps `@base-ui/react`, `class-variance-authority`, `cn`, `lucide-react`, `shadcn`, `tw-animate-css` (`shadcn` is a runtime dep because `globals.css` imports `shadcn/tailwind.css`).

- [ ] **Step 2: Delete** `src/components/ui/.gitkeep`.

- [ ] **Step 3: Fix the font token** in the `@theme inline` block of `src/app/globals.css`:
  - `--font-sans: var(--font-sans);` → `--font-sans: var(--font-geist-sans);`
  - Leave `--font-heading: var(--font-sans);` as is (it resolves once `--font-sans` is fixed).
  - Delete the standalone (unlayered) `body { font-family: var(--font-sans), Arial, Helvetica, sans-serif; }` rule; `@layer base` already applies `font-sans` to `html`.

- [ ] **Step 4: Check dark-mode leftovers**

Run: `grep -n "prefers-color-scheme" src/app/globals.css`
Expected: no output (only shadcn's `.dark { … }` block remains; app is light-only).

- [ ] **Step 5: Format** — `npm run format`, then `npm run format:check`
      Expected: `All matched files use Prettier code style!`

- [ ] **Step 6: Verify**

Run: `npm ls --depth=0 && npm run lint && npm run typecheck && npm run build`
Expected: all exit 0.
Run: `grep -o -h -E -- '--font-sans:[^;}]*' .next/static/chunks/*.css | sort -u`
Expected: `--font-sans:var(--font-geist-sans)` (and nothing self-referencing).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add shadcn/ui (base-nova) with button primitive

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: English docs and comments

**Files:**

- Modify: `README.md`, `AGENTS.md` (only the part after `<!-- END:nextjs-agent-rules -->`; never edit inside the managed block), `src/app/layout.tsx` (comment above `geistSans`), `src/lib/money.ts` (doc comments)

**Interfaces:**

- Consumes: final state from Tasks 2–3.

- [ ] **Step 1: Rewrite `README.md` in English** — one-line description (badminton session scheduling + splitting court/water/shuttlecock costs, Next.js + Supabase + Vercel), "Run locally" (`npm install`, `npm run dev` → http://localhost:3000), a commands table with exactly the 7 scripts from Task 2, and a pointer to `AGENTS.md` for structure and conventions.

- [ ] **Step 2: Rewrite the project section of `AGENTS.md` in English.** It must state:
  - What the app is (one paragraph) and the stack: Next.js 16 App Router, Tailwind v4, shadcn/ui (`base-nova`, Base UI), Supabase (from Module 1), Vercel.
  - The `src/` folder map (same five folders as the current Vietnamese version), noting `components/ui/` holds shadcn primitives added via `npx shadcn@4.23.0 add <name>`.
  - Conventions: `@/` alias; money as integer VND, display with `formatVND`; no automated tests, verify with lint/typecheck/build; repo docs and code comments in English, UI text in Vietnamese; the commands list (no test commands).

- [ ] **Step 3: Translate comments** in `src/app/layout.tsx` and `src/lib/money.ts` to English (meaning unchanged: Geist needs the `vietnamese` subset so diacritics don't fall back to another font; money is stored as integer VND and formatted only for display; example `65000 → "65.000 ₫"`).

- [ ] **Step 4: Verify**

Run: `grep -rn -P "[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]" README.md AGENTS.md src/lib/money.ts src/app/layout.tsx`
Expected: only Vietnamese inside string literals/UI copy or the `formatVND` example output (e.g. `"Cầu lông"` metadata in `layout.tsx`); no Vietnamese prose in docs or comments.
Run: `npm run format:check && npm run lint && npm run typecheck && npm run build`
Expected: all exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: rewrite README and AGENTS.md in English

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: `git log --oneline main..HEAD` shows 4 commits; `git status --short` is empty.
