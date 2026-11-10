import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { cn } from "cn";

/** Page width shared by the board band and the content under it. */
export const PAGE_CONTAINER =
  "mx-auto w-full max-w-xl px-4 sm:px-6 lg:max-w-2xl";

/**
 * The cobalt band at the top of every page: the scoreboard. It runs the full
 * width of the screen; its content keeps the page's column.
 */
export function Board({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-board text-board-foreground">
      <div className={cn(PAGE_CONTAINER, "pt-2 pb-6", className)}>
        {children}
      </div>
    </div>
  );
}

/** The board's first row: a way back on the left, page actions on the right. */
export function BoardBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3">
      {children}
    </div>
  );
}

export function BoardBackLink({
  href,
  children,
}: {
  href: React.ComponentProps<typeof Link>["href"];
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-md pr-2 pl-1 text-[0.9375rem] font-semibold text-board-foreground outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-board-foreground"
    >
      <ChevronLeft className="size-5" aria-hidden />
      {children}
    </Link>
  );
}

/** Large board heading for pages whose board has no tiles. */
export function BoardTitle({
  children,
  description,
}: {
  children: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <h1 className="board-heading text-[2rem] leading-tight text-balance">
        {children}
      </h1>
      {description ? (
        <p className="text-[0.9375rem] text-board-muted">{description}</p>
      ) : null}
    </div>
  );
}
