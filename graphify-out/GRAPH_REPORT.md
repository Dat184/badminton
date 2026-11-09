# Graph Report - badminton  (2026-11-09)

## Corpus Check
- Corpus is ~11,800 words - fits in a single context window. You may not need a graph.

## Summary
- 272 nodes · 530 edges · 15 communities (12 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.87)
- Token cost: 108,047 input · 0 output

## Community Hubs (Navigation)
- Project Rules & Conventions
- Admin & Member Management
- Login & UI Primitives
- shadcn Config
- TypeScript Config
- Runtime Dependencies
- Dev Tooling Dependencies
- Supabase Session Proxy
- Package Metadata
- npm Scripts
- ESLint Config
- Root Layout
- Prettier Config
- Vercel Config
- React Types

## God Nodes (most connected - your core abstractions)
1. `Badminton App Project Guide (AGENTS.md)` - 22 edges
2. `Module 1: Supabase, Host Login & First Deploy Plan` - 22 edges
3. `Module 0: Cleanup & Foundation Plan` - 20 edges
4. `Module 2: Member List Plan` - 19 edges
5. `compilerOptions` - 16 edges
6. `next` - 13 edges
7. `Button()` - 13 edges
8. `createSupabaseServerClient()` - 13 edges
9. `LoginForm()` - 12 edges
10. `requireHost()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `MemberRow()` --implements--> `Member Row Modes (view / edit / confirm, no browser confirm())`  [EXTRACTED]
  src/features/members/components/member-row.tsx → docs/superpowers/plans/2026-11-09-module-2-member-list.md
- `updateSession()` --implements--> `Stale or Tampered Session Cookie Redirects to /login (never 500)`  [INFERRED]
  src/server/supabase/session.ts → docs/superpowers/plans/2026-11-09-module-1-supabase-auth-deploy.md
- `HostGreeting()` --implements--> `cacheComponents: Cookie Reads Must Render Inside <Suspense>`  [EXTRACTED]
  src/app/admin/page.tsx → docs/superpowers/plans/2026-11-09-module-1-supabase-auth-deploy.md
- `shadcn/ui Init (CLI 4.23.0, base-nova preset, Base UI)` --references--> `Button()`  [EXTRACTED]
  docs/superpowers/plans/2026-11-09-module-0-foundation.md → src/components/ui/button.tsx
- `parseNickname()` --implements--> `Nickname Normalization Rules (NFC, trim, collapse spaces, 1-30 code points)`  [EXTRACTED]
  src/features/members/member.ts → docs/superpowers/plans/2026-11-09-module-2-member-list.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Supabase Cookie-session Auth Flow** — src_proxy_proxy, src_server_supabase_session_updatesession, src_server_supabase_server_createsupabaseserverclient, src_server_auth_requirehost, src_features_auth_actions_signin, src_features_auth_actions_signout, docs_superpowers_plans_2026_11_09_module_1_supabase_auth_deploy_supabase_ssr_cookie_sessions [EXTRACTED 1.00]
- **Member List Write Path** — src_features_members_actions_addmember, src_features_members_actions_renamemember, src_features_members_actions_removemember, src_features_members_member_parsenickname, src_server_members_insertmember, src_server_members_updatemembernickname, src_server_members_archivemember, src_server_auth_requirehost, supabase_migrations_20261109140000_members_public_members [EXTRACTED 1.00]
- **Module-by-module Delivery Plans** — docs_superpowers_plans_2026_11_09_module_0_foundation_module_0_foundation_plan, docs_superpowers_plans_2026_11_09_module_1_supabase_auth_deploy_module_1_supabase_auth_deploy_plan, docs_superpowers_plans_2026_11_09_module_2_member_list_module_2_member_list_plan, docs_superpowers_plans_2026_11_09_module_0_foundation_module_roadmap, docs_superpowers_plans_2026_11_09_module_0_foundation_superpowers_plan_execution [INFERRED 0.95]

## Communities (15 total, 3 thin omitted)

### Community 0 - "Project Rules & Conventions"
Cohesion: 0.06
Nodes (31): Badminton App Project Guide (AGENTS.md), @/ Import Alias (points to src/), Per-person Cost Split (court, water, shuttlecock), Stack: Next.js 16, Tailwind v4, shadcn/ui base-nova, Supabase, Vercel, Two Supabase Projects (test in .env.local, production on Vercel), CLAUDE.md (@AGENTS.md import), Branch per Module with Co-Authored-By Commits, Module 0: Cleanup & Foundation Plan (+23 more)

### Community 1 - "Admin & Member Management"
Cohesion: 0.11
Nodes (34): Member Write Error Mapping (23505 duplicate, 22P02 / zero rows not_found), nextConfig, next, server-only, AdminPage(), HostGreeting(), metadata, HomePage() (+26 more)

### Community 2 - "Login & UI Primitives"
Cohesion: 0.10
Nodes (28): Login Error Handling (Vietnamese errors, button disabled while pending), @base-ui/react@^1.9.0, @base-ui/react, cn, react, LoginPage(), metadata, Button() (+20 more)

### Community 3 - "shadcn Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 5 - "Runtime Dependencies"
Cohesion: 0.12
Nodes (16): dependencies, class-variance-authority@^0.7.1, cn@^0.5.2, lucide-react@^1.70.0, next@16.4.5, react@19.3.0, react-dom@19.3.0, server-only@^0.0.1 (+8 more)

### Community 6 - "Dev Tooling Dependencies"
Cohesion: 0.15
Nodes (13): devDependencies, prettier@^3.9.10, prettier-plugin-tailwindcss@^0.8.1, shadcn@^4.23.0, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/react-dom@^19, prettier (+5 more)

### Community 7 - "Supabase Session Proxy"
Cohesion: 0.24
Nodes (7): Stale or Tampered Session Cookie Redirects to /login (never 500), @supabase/ssr, config, proxy(), getSupabaseEnv(), redirectWithCookiesAndHeaders(), updateSession()

### Community 8 - "Package Metadata"
Cohesion: 0.20
Nodes (9): @types/node@^24.19.2, typescript@^5, engines, node, name, private, version, @types/node (+1 more)

### Community 9 - "npm Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, format, format:check, lint, start, typecheck

### Community 10 - "ESLint Config"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.5, eslint, eslint-config-next

### Community 11 - "Root Layout"
Cohesion: 0.33
Nodes (3): geistMono, geistSans, metadata

## Knowledge Gaps
- **5 isolated node(s):** `Per-person Cost Split (court, water, shuttlecock)`, `@/ Import Alias (points to src/)`, `CLAUDE.md (@AGENTS.md import)`, `Free Supabase Project Pauses After ~1 Week Idle`, `Supabase Auth via @supabase/ssr Cookie Sessions`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 83 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Admin & Member Management` to `Login & UI Primitives`, `Runtime Dependencies`, `Supabase Session Proxy`, `Package Metadata`, `Root Layout`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Module 2: Member List Plan` (e.g. with `Branch per Module with Co-Authored-By Commits` and `cacheComponents: Cookie Reads Must Render Inside <Suspense>`) actually correct?**
  _`Module 2: Member List Plan` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Per-person Cost Split (court, water, shuttlecock)`, `@/ Import Alias (points to src/)`, `CLAUDE.md (@AGENTS.md import)` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Project Rules & Conventions` be split into smaller, more focused modules?**
  _Cohesion score 0.058173076923076925 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Login & UI Primitives` to `Package Metadata`, `Admin & Member Management`, `Runtime Dependencies`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `Admin & Member Management` be split into smaller, more focused modules?**
  _Cohesion score 0.11378353376503238 - nodes in this community are weakly interconnected._
- **Why does `Module 1: Supabase, Host Login & First Deploy Plan` connect `Project Rules & Conventions` to `Login & UI Primitives`, `Supabase Session Proxy`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._