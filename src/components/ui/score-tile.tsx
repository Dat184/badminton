"use client";

import { useState } from "react";
import { cn } from "cn";

type TileSize = "board" | "count" | "row";
type TileTone = "card" | "score" | "board";

// One tile, three fixed sizes. Each tile is one scoreboard card holding one
// number, like the ring-bound cards on a court flip scoreboard.
const sizeClasses: Record<TileSize, string> = {
  board:
    "h-19 min-w-16 px-1.5 text-[4rem] lg:h-27 lg:min-w-23 lg:text-[5.75rem]",
  count:
    "h-13 min-w-11 px-1 text-[2.5rem] lg:h-16 lg:min-w-14 lg:text-[3.125rem]",
  row: "h-11 min-w-10 px-1 text-[1.875rem]",
};

const ringClasses: Record<TileSize, string> = {
  board: "top-1.5 size-1.5",
  count: "top-1 size-1",
  row: "hidden",
};

const toneClasses: Record<TileTone, string> = {
  card: "bg-tile text-tile-foreground",
  score: "bg-tile text-score ring-1 ring-border ring-inset",
  board: "bg-board text-board-foreground",
};

type ScoreTileProps = {
  value: string | number;
  size?: TileSize;
  tone?: TileTone;
  className?: string;
};

/**
 * A scoreboard card showing one number. Decorative: give the reader the same
 * information as text next to it (for example in an `sr-only` span).
 * When `value` changes after the first render, the card flips into place.
 */
export function ScoreTile({
  value,
  size = "board",
  tone = "card",
  className,
}: ScoreTileProps) {
  const text = String(value);
  // Remember the previous value during render (React's "storing information
  // from previous renders" pattern) so only real changes flip, not page load.
  const [shown, setShown] = useState(text);
  const [flips, setFlips] = useState(0);
  if (shown !== text) {
    setShown(text);
    setFlips((count) => count + 1);
  }

  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-md leading-none",
        sizeClasses[size],
        toneClasses[tone],
        className,
      )}
    >
      <span
        // A new key remounts the numeral, which replays the flip animation.
        key={flips}
        className={cn(
          "tile-numerals block origin-top translate-y-[0.02em]",
          flips > 0 && "motion-safe:animate-tile-flip",
        )}
      >
        {text}
      </span>
      {/* The hinge line where the card folds over its rings. */}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[var(--tile-hinge)]" />
      <span
        className={cn(
          "pointer-events-none absolute left-1/4 rounded-full bg-[var(--tile-hinge)]",
          ringClasses[size],
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute right-1/4 rounded-full bg-[var(--tile-hinge)]",
          ringClasses[size],
        )}
      />
    </span>
  );
}

/** The `:` or `/` between two tiles, sized to sit with them. */
export function TileSeparator({
  children,
  size = "board",
  className,
}: {
  children: string;
  size?: TileSize;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "tile-numerals inline-block leading-none opacity-70",
        size === "board" && "px-0.5 text-[2.75rem] lg:text-[4rem]",
        size === "count" && "px-0.5 text-[1.75rem] lg:text-[2.25rem]",
        size === "row" && "text-[1.25rem]",
        className,
      )}
    >
      {children}
    </span>
  );
}
