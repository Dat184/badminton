import { cn } from "cn";

/** A quiet placeholder block shown while data loads. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block animate-pulse rounded-md bg-muted motion-reduce:animate-none",
        className,
      )}
    />
  );
}

/** Loading text for screen readers, paired with skeleton blocks. */
export function LoadingLabel({
  children = "Đang tải…",
}: {
  children?: string;
}) {
  return (
    <span role="status" className="sr-only">
      {children}
    </span>
  );
}
