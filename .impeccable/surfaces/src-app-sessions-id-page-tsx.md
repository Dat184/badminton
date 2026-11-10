---
version: 1
slug: "src-app-sessions-id-page-tsx"
primary_target: "src/app/sessions/[id]/page.tsx"
related_targets:
  [
    "src/app/page.tsx",
    "src/app/sessions/new/page.tsx",
    "src/app/admin/page.tsx",
    "src/app/login/page.tsx",
  ]
---

# App shell and session page

## Scope

Mode: Operate. Whole-app redesign: session page (primary), home, new session, admin member list, login. Mobile-first (phones opening a link from the group chat); organizer also uses a desktop browser.

## Audience and job

Players tap a session link in Zalo/Messenger to see when and where, and to tick themselves in or out without logging in. The organizer creates sessions and keeps the member list. Date, time and venue must lead the session page (owner's answer). The owner allowed copy changes when they are clearer. The owner ruled out a dark/neon gaming look and heavy, slow effects.

## Constraints

Keep every function, route, server action and auth rule as is. Vietnamese UI text. Money later (Module 5) shows as integer VND; the per-person share will use the score tile.

## Direction contract

THESIS: The session link reads like the court scoreboard: date, time and headcount as big flip-card numerals at a glance, everything else a calm standard working list. It refuses the grey shadcn card stack and the dark sporty app.

OWN-WORLD: A cobalt board band (#1E3FAE) heads every screen and holds white ring-bound flip tiles with a hinge hairline and heavy condensed numerals (Archivo at 62% width, 800). Cool aluminium ground (#EDF0F5), white panels with 1px hairlines, 6px corners on everything, no shadows. Be Vietnam Pro for all text; board headings (weekday, page titles, the "Cầu lông" wordmark) are amended to the numerals' face at 78% width so they belong to the board, and it renders Vietnamese diacritics cleanly. Members who have not ticked read "Đi?", never a claimed "Không đi"; guests read as going. Score red (#D92D20) only on the screen's one live number and on confirming a delete.

STORY: Someone taps the chat link, reads when and where off the board, taps their own name, sees the headcount flip, and leaves.

FIRST VIEWPORT: Session page at 390px. Board band: back link "Cầu lông" with Sửa / Xóa buổi at right; weekday heading; DD/MM tiles at board size; HH:MM tiles at count size; venue line. Below on the ground: "Ai đi?" with red headcount tiles at right, then a roster panel of 56px rows, each a one-tap Đi / Đi? toggle, then the add-guest field. The primary action is tapping your own row.

FORM: Bảng lật điểm (manual flip scoreboard), candidate 4 of 7 on the ordered list; seed:a3e61e48640afd27. Signature move: the headcount tile flips (about 220ms) when attendance changes; reduced motion snaps. Raises: red reserved for the live number; one tile component at three fixed sizes; one corner language and 1px hairlines; a 4px spacing cell; hierarchy by scale contrast, not boxes; the next session stays full size on home.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Module 5 cost section and split result: inherits the board and tiles (share in score red); not built here.
- Live tile preview while picking a date in the session form: optional, not in this pass.
- Desktop: tiles step up one size at `lg` and the column widens to 672px; layout stays a single column.
