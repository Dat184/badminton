# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Players (members of one small group, about 6 people, one court).** They open a session link the organizer drops into the group chat (Zalo/Messenger), on a phone, to say whether they are coming. Later (Module 5) they open the same link to see how much they owe. They never log in.
- **The organizer.** Creates sessions, keeps the member list, enters court and shuttle costs. Often does this at home on a computer; uses the editing pages (`/admin`, `/login`) that are not linked from public pages.

## Product Purpose

An internal app for one badminton group: the organizer creates a session, members tick who is coming, the organizer enters court, water and shuttlecock costs, and the app splits the total per person. Success is that a session link in the group chat is enough: anyone can see who is coming and what they owe, with no login and no spreadsheet.

## Positioning

Built for one specific small group, not a booking platform or a club manager. It is trust-based: anyone with the link can tick attendance and (from Module 5) enter costs; only the member list and shuttle types need a login, and any signed-in account edits everything.

## Operating Context

- Entry point is almost always a link shared in a group chat, opened in a phone browser; secondary use is the organizer on a desktop browser at home.
- Sessions are ad hoc: a date, an optional start time, an optional venue name.
- The group is small (about 6 regular members, one court), with occasional guests added per session by name.
- Money is in VND, always whole numbers, shown as e.g. `65.000 ₫`. Module 5 rounds each share up to the thousand and puts the leftover in a group fund.

## Capabilities and Constraints

- Public, no login: view everything; create sessions; edit/delete a session; tick members in or out; add or remove guests on a session.
- Login (accounts created by the owner, sign-ups disabled): manage the member list (add, rename, archive). Module 4 adds shuttle types (name, tube price, shuttles per tube).
- Planned: Module 5 session costs (court, shuttles, surcharges), the `Chia tiền` split that locks a session, `Mở lại` to unlock, and a group fund on the home page. Module 6 marks "đã chuyển khoản" per person; Module 7 shows a payment QR image on session pages.
- Members are archived, never deleted; past sessions keep their names. Sessions are archived, never deleted.
- Editing pages are `noindex` and not linked from public pages.
- Stack: Next.js 16 App Router, Tailwind CSS v4, shadcn/ui (`base-nova`, Base UI primitives), Supabase, Vercel. UI text is Vietnamese; code and docs are English.

## Brand Commitments

- The name is simply "Cầu lông". The group has no logo, name or colors of its own.
- Voice: plain, friendly Vietnamese between friends; short labels (`Tạo buổi`, `Ai đi?`, `Bỏ`, `Chia tiền`).

## Evidence on Hand

- Real content is the group's own data in Supabase: member nicknames, sessions, attendance. No imagery, testimonials or marketing claims exist; none should be invented.

## Product Principles

1. The link is the product: a session page must make sense to someone who just tapped it in a chat, with no context and no login.
2. One tap to answer "am I coming?"; ticking must feel instant and be impossible to misread.
3. Money is exact and legible: integer VND, clearly who owes what.
4. Small group, low ceremony: no accounts for players, no features a six-person group does not need.
5. Trust, but make mistakes recoverable: confirmations for destructive actions, nothing is hard-deleted.

## Accessibility & Inclusion

- Vietnamese diacritics must render in the chosen fonts without fallback flashes.
- Phone-first touch targets (at least 44px) for ticking and buttons.
