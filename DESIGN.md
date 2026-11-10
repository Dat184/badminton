---
name: Cầu lông
description: A court flip scoreboard for one small badminton group, read off a phone from a chat link.
colors:
  board-cobalt: "#1e3fae"
  board-deep: "#17328c"
  board-muted: "#c9d3f5"
  board-line: "rgb(255 255 255 / 0.28)"
  score-red: "#d92d20"
  destructive: "#b42318"
  secondary-wash: "#e3e8f6"
  aluminium-ground: "#edf0f5"
  panel-white: "#ffffff"
  accent-hover: "#f2f4f8"
  muted-fill: "#e4e8ef"
  hairline: "#d5dae3"
  input-stroke: "#8a93a6"
  placeholder: "#5d6578"
  muted-ink: "#4a5263"
  ink: "#12151c"
  tile-hinge: "rgb(18 21 28 / 0.18)"
typography:
  display:
    fontFamily: "Archivo, Be Vietnam Pro, sans-serif"
    fontSize: "4rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0em"
    fontFeature: "tnum, lnum"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo, Be Vietnam Pro, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 78"
  title:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.25
  title-sm:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  body-row:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1
rounded:
  sm: "4px"
  md: "6px"
spacing:
  cell: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  board:
    backgroundColor: "{colors.board-cobalt}"
    textColor: "{colors.panel-white}"
    padding: "8px 16px 24px"
  board-panel:
    backgroundColor: "{colors.board-deep}"
    textColor: "{colors.panel-white}"
    rounded: "{rounded.md}"
    padding: "16px"
  score-tile-board:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.md}"
    height: "76px"
    width: "64px"
  score-tile-count:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "52px"
    width: "44px"
  score-tile-score:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.score-red}"
    rounded: "{rounded.md}"
    height: "52px"
    width: "44px"
  score-tile-row:
    backgroundColor: "{colors.board-cobalt}"
    textColor: "{colors.panel-white}"
    rounded: "{rounded.md}"
    height: "44px"
    width: "40px"
  button-primary:
    backgroundColor: "{colors.board-cobalt}"
    textColor: "{colors.panel-white}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.board-deep}"
  button-secondary:
    backgroundColor: "{colors.secondary-wash}"
    textColor: "{colors.board-cobalt}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.accent-hover}"
  button-ghost-hover:
    backgroundColor: "{colors.muted-fill}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.panel-white}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-board:
    textColor: "{colors.panel-white}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  button-board-solid:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.board-cobalt}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  button-board-solid-hover:
    backgroundColor: "{colors.secondary-wash}"
  input:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  list-panel:
    backgroundColor: "{colors.panel-white}"
    rounded: "{rounded.md}"
  list-row-hover:
    backgroundColor: "{colors.accent-hover}"
  attendance-toggle-on:
    backgroundColor: "{colors.board-cobalt}"
    textColor: "{colors.panel-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "44px"
    width: "104px"
  attendance-toggle-off:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.muted-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "44px"
    width: "104px"
  chip-name:
    backgroundColor: "{colors.muted-fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "6px 10px"
  chip-status-on-board:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.board-cobalt}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
---

# Design System: Cầu lông

## Overview

**Creative North Star: "The Court Flip Scoreboard"**

Every screen is headed by the cobalt board you would find beside a community court: a full-width band holding white, ring-bound flip cards with heavy condensed numerals. When and where a session happens, and how many people are coming, are read off that board at a glance, the way you read a score from across the hall. Below the board, the page drops to a cool aluminium ground with white panels and turns into a calm, standard working list: names, rows, toggles, fields.

Hierarchy comes from scale contrast rather than boxes. The board numerals are the loudest thing in the system, the board heading is the second voice, and everything under the band is quiet, regular-weight Vietnamese text in a single sans. Density is phone-first and generous: 44px minimum targets, 56px roster rows, a narrow single column that widens only slightly on desktop.

The material is flat and printed, not lit. Depth is a change of ground (cobalt band, deep-cobalt inset panel, aluminium page, white panel), never a shadow. One 6px corner language and 1px hairlines run through every component. Red is scarce on purpose: it marks the one live number on a screen and the act of confirming a delete.

**Key Characteristics:**

- A full-bleed cobalt board band opens every page; its content keeps the page column.
- Numbers that matter (date, time, headcount, later the per-person share) sit in flip tiles; prose never imitates them.
- Archivo, condensed on its width axis, belongs to the board; Be Vietnam Pro carries all other text.
- Flat surfaces, 1px hairlines, 6px corners everywhere, no shadows.
- Score red appears at most once per screen as a live number, plus the delete confirmation.
- Tile changes flip into place; reduced motion snaps.

## Colors

A two-ground palette: saturated cobalt for the board and primary action, cool aluminium greys for the working page, and one reserved red.

### Primary

- **Board Cobalt** (board-cobalt): The board band behind every page header, the primary button, the ticked "Đi" toggle, the row-size date tile, focus rings, caret and native date/time accent. Also the browser `themeColor`, so phone chrome continues the band.
- **Deep Cobalt** (board-deep): Inset panels on the board (the home page's next-session card, empty and error notices on the board) and the primary button's hover.
- **Board Mist** (board-muted): Secondary text on the board (intros, "Chưa có giờ", "Chưa chọn sân") and the text selection highlight.
- **Board Line** (board-line): Hairlines and outlines on the board: board-variant button borders, the divider inside the next-session card, the "Đã qua" status outline.
- **Cobalt Wash** (secondary-wash): Secondary buttons (e.g. "Thêm") with cobalt text, and the hover of white buttons on the board.

### Secondary

- **Score Red** (score-red): The numeral colour of the one live number on a screen, set in a white tile with a hairline ring (headcount on the session page and the next-session card, member count on admin).
- **Delete Red** (destructive): The destructive button that confirms a delete, error text, invalid-field strokes and the inline alert's border.

### Neutral

- **Aluminium Ground** (aluminium-ground): The page background under the board.
- **Panel White** (panel-white): Panels, list containers, inputs, outline buttons, and the flip tiles themselves.
- **Accent Hover** (accent-hover): Row hover and focus fill inside white panels; outline button hover.
- **Muted Fill** (muted-fill): Name chips, the "Khách" tag, ghost hover, skeleton blocks, disabled inputs.
- **Hairline** (hairline): Every 1px border and list divider on the ground.
- **Input Stroke** (input-stroke): Input borders (full strength) and outline/toggle borders (at 60%).
- **Placeholder** (placeholder): Input placeholder text.
- **Muted Ink** (muted-ink): Supporting text, unticked names, "Đi?" toggle text, counts in list rows.
- **Ink** (ink): Body text and tile numerals.
- **Tile Hinge** (tile-hinge): The hinge hairline across each tile's middle and its ring holes.

### Named Rules

**The One Live Number Rule.** Score red is the numeral colour of at most one tile per screen, the number that changes because of what people do. The only other red is the destructive confirmation and error feedback. Never use red for decoration, emphasis or headings.

**The Board Holds the Cobalt Rule.** Large cobalt fields belong to the board band and its inset panels. On the aluminium ground, cobalt appears only as small solid controls (primary button, ticked toggle, row tile) and text.

## Typography

**Display Font:** Archivo (variable, width axis), falling back to Be Vietnam Pro
**Body Font:** Be Vietnam Pro (400, 500, 600, 700), with ui-sans-serif and system-ui
**Label Font:** Be Vietnam Pro

**Character:** A heavy, condensed scoreboard face for numerals and board headings against a friendly, open Vietnamese-first sans for everything people read. Both load the `vietnamese` subset so diacritics never flash in a fallback.

### Hierarchy

- **Display** (Archivo 800, width 62%, tabular lining figures, 4rem rising to 5.75rem at lg; count size 2.5rem to 3.125rem; row size 1.875rem): Flip-tile numerals only. Separators (`/`, `:`) use the same face at about two-thirds size and 70% opacity.
- **Headline** (Archivo 800, width 78%, -0.01em, 1.75rem to 2.25rem at lg; 2rem for page titles; leading 1 to 1.25): Board headings only: the weekday, page titles on the board, and the "Cầu lông" wordmark. The wider cut keeps Vietnamese diacritics clear.
- **Title** (Be Vietnam Pro 700, 1.375rem, 1.25): Section headings on the ground ("Ai đi?", "Thành viên"); 1.125rem for list group headings ("Sắp tới", "Đã đánh") and panel titles.
- **Body** (Be Vietnam Pro 400, 0.9375rem, 1.5): Default running text, descriptions and board intros (capped near 34ch on the board). Venue on the board is 1.125rem 600.
- **Body Row** (Be Vietnam Pro 600, 1rem): Names in roster and member rows; unticked names drop to 500 in muted ink.
- **Label** (Be Vietnam Pro 600, 0.875rem): Form labels, button text at small size, counts, helper text (helper at 400 in muted ink).

### Named Rules

**The Board Face Rule.** Archivo appears only on the board (headings) and inside tiles (numerals). Text on the aluminium ground is always Be Vietnam Pro.

**The Real Numbers Rule.** Tiles hold short numbers only: day, month, hour, minute, a count, and from Module 5 the per-person share as integer VND formatted with `formatVND`. Every tile is decorative (`aria-hidden`) and is paired with the same information as text for screen readers.

## Layout

A single centred column: max 36rem (xl) widening to 42rem at the lg breakpoint, with 16px side padding (24px from sm). The board band runs full width while its content keeps that column; it pads 8px above the bar and 24px below.

The board opens with a bar at least 48px tall: a back link ("Cầu lông", chevron left) or the wordmark on the left, page actions on the right. Under it sit the heading and tiles with 16px between groups; date tiles and time tiles sit 24px apart and wrap on narrow screens.

Content under the board starts 24px down (32px on home) and stacks sections 16px to 32px apart. Spacing is built on a 4px cell; observed steps are 4, 8, 12, 16, 24 and 32px. Lists are one bordered panel divided by hairlines, not separate cards. Rows are 56px minimum on the roster, 64px on session lists; every tap target is at least 44px.

## Elevation & Depth

The system is flat. There are no shadows anywhere. Depth is conveyed by tonal grounds: the cobalt band, a deeper cobalt for panels set into it, the aluminium page, and white panels with a 1px hairline. The only "lift" is the flip tile's own construction: a hinge hairline and two ring holes in hinge grey that make it read as a physical card.

### Named Rules

**The Printed Board Rule.** Surfaces never cast shadows. To separate a surface, change its ground or give it a 1px hairline.

## Shapes

One corner language: 6px on buttons, inputs, panels, list containers, tiles, toggles and inset board panels. Only small tags and chips (name chips, "Khách", the relative-day status chip) step down to 4px. Borders are 1px hairlines; empty states use a dashed hairline. Lists clip their rows inside a single rounded panel.

## Components

### Flip Tile (signature)

A ring-bound scoreboard card holding one number, at three fixed sizes and three tones.

- **Sizes:** board (76px tall, 64px min wide; 108px by 92px at lg) for the date; count (52 by 44; 64 by 56 at lg) for time and headcount; row (44 by 40, no ring holes) for the date in list rows.
- **Tones:** card (white tile, ink numeral) on the board; score (white tile, score-red numeral, inset hairline ring) for the one live number; board (cobalt tile, white numeral) in list rows on the ground.
- **Detail:** a 1px hinge line across the middle and two small ring holes at a quarter in from each side (board and count sizes).
- **Motion:** when the value changes after first render, the numeral flips down from the top (rotateX -88deg to 0 in 320px perspective, 240ms, cubic-bezier(0.16, 1, 0.3, 1)). Page load does not flip. Reduced motion snaps.

### Board

- **Band:** board cobalt, full bleed, white text, holding the bar, heading, tiles and venue line.
- **Inset panel:** deep cobalt, 6px corners, 16px padding, used for the next-session card on home and for notices on the board; hover darkens it by 12% black.
- **Panels opened on the board:** edit and delete-confirm open as a white panel (16px padding) inside the band, replacing the scoreboard; focus returns to the opening button when they close, and the delete confirmation focuses "Hủy".

### Buttons

- **Shape:** gently squared (6px), 44px tall by default (48px large), semibold 0.9375rem text, 6px icon gap; pressing nudges down 1px.
- **Primary:** board cobalt with white text; hover deep cobalt.
- **Secondary:** cobalt wash with cobalt text; hover mixes in 10% cobalt.
- **Outline:** white with a 60% input-stroke border; hover full border and accent fill. Ghost: text only, muted fill on hover.
- **Destructive:** delete red with white text; only to confirm a delete.
- **On the board:** board (transparent, board-line outline, white text, 10% white hover) for page actions like "Sửa" and "Xóa buổi"; board-solid (white with cobalt text, wash on hover) for the one primary action on the board ("Tạo buổi").
- **Focus:** 2px ring in cobalt with 2px offset; on the board the ring is white with a cobalt offset.

### Attendance Toggle

- **Shape:** a 104px by 44px pill at the right of a 56px roster row; the whole row is the label for a hidden checkbox.
- **Ticked:** solid board cobalt, white bold "Đi" with a check icon; the name goes to ink 600.
- **Unticked:** white with a 60% input-stroke border, muted "Đi?"; the name drops to muted ink 500. An unticked member reads "Đi?", never a claimed "Không đi". Guests always read as ticked.
- **States:** optimistic flip on tap; pending rows dim to 60% and show a wait cursor; row hover and keyboard focus fill with accent hover, focus adds an inset 2px cobalt outline.

### Cards / Containers

- **Corner Style:** 6px.
- **Background:** panel white on the aluminium ground.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px hairline; lists divide rows with hairlines inside one panel.
- **Internal Padding:** 16px (12px compact; 24px for form panels from sm).

### Inputs / Fields

- **Style:** white, 1px input-stroke border, 6px corners, 44px tall, 12px side padding, 16px text (keeps iOS from zooming).
- **Hover / Focus:** border darkens on hover; focus turns the border cobalt with a 2px cobalt ring at 25%.
- **Error / Disabled:** invalid fields take a delete-red border and 20% red ring, with a red 0.875rem message below; disabled fields fill muted at 60% opacity.

### Chips

- **Name chip:** muted fill, ink 600 0.875rem text, 4px corners; members on home wrap inside one white panel.
- **Tag:** "Khách" beside a guest's name, muted fill, muted ink, 0.75rem.
- **Status on the board:** relative-day chip beside the weekday ("Hôm nay", "Còn 4 ngày"): white with cobalt text; "Đã qua" is outlined in board line with mist text.

### Inline Alert

- A white panel with a 30% delete-red border and red message text, carrying its own recovery action as an outline button ("Tải lại"). Errors on the board use a deep-cobalt panel instead.

### Navigation

- No nav bar. The board bar's left slot is a back link (chevron plus "Cầu lông", semibold, 44px target, 10% white hover) or, on home, the "Cầu lông" wordmark as the board heading. Editing pages are reached directly, not linked.

## Do's and Don'ts

### Do:

- **Do** open every page with the full-width cobalt board band, keeping its content in the page column.
- **Do** put the numbers people come to read (date, time, headcount, a per-person share in integer VND) in flip tiles at one of the three sizes, with a text equivalent for screen readers.
- **Do** give score red to at most one live number per screen, in the score tone tile.
- **Do** use 6px corners and 1px hairlines on every surface; 4px only for small chips and tags.
- **Do** keep tap targets at least 44px and roster rows at least 56px.
- **Do** set board headings in Archivo at 78% width and 800; tile numerals at 62% width and 800 with tabular figures.
- **Do** separate surfaces by ground (cobalt, deep cobalt, aluminium, white) and hairlines.
- **Do** let a changed tile flip in about 240ms and snap under reduced motion.

### Don't:

- **Don't** add box shadows to any surface; the board is printed, not lit.
- **Don't** use red for headings, emphasis, icons or decoration.
- **Don't** set Archivo on the aluminium ground or use tiles for prose and labels.
- **Don't** stack separate grey cards for list items; one hairline-divided panel holds a list.
- **Don't** label an unticked member "Không đi"; they read "Đi?".
- **Don't** introduce a second corner radius or mix rounded-full pills into controls.
