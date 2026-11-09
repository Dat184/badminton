import Link from "next/link";
import { connection } from "next/server";
import { buttonVariants } from "@/components/ui/button";
import type { SessionSummary } from "@/features/sessions/session";
import { formatSessionWhen } from "@/lib/dates";
import { listSessions } from "@/server/sessions";

export async function SessionList() {
  // Request time so new sessions and attendance edits show up immediately.
  // Outside the try: connection() rejects during prerendering and must not be caught.
  await connection();

  let sessions: SessionSummary[];
  try {
    sessions = await listSessions();
  } catch (cause) {
    console.error("sessions: list failed", cause);
    return (
      <p role="alert" className="text-sm text-destructive">
        Không tải được buổi đánh, vui lòng tải lại trang.
      </p>
    );
  }

  return (
    <section aria-labelledby="sessions-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2
          id="sessions-heading"
          className="text-xl font-semibold tracking-tight"
        >
          Buổi đánh
        </h2>
        <Link href="/sessions/new" className={buttonVariants({ size: "sm" })}>
          Tạo buổi
        </Link>
      </div>
      {sessions.length === 0 ? (
        <p className="text-sm text-foreground/70">Chưa có buổi nào.</p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={`/sessions/${session.id}`}
                className="flex flex-col gap-0.5 px-3 py-2 transition-colors hover:bg-muted/50"
              >
                <span className="font-medium break-words">
                  {formatSessionWhen(session)}
                </span>
                <span className="text-sm text-foreground/70">
                  {session.attendeeCount} người đi
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
