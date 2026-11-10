import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Board, BoardBar, PAGE_CONTAINER } from "@/components/ui/board";
import { buttonVariants } from "@/components/ui/button";
import { ScoreTile } from "@/components/ui/score-tile";
import { LoadingLabel, Skeleton } from "@/components/ui/skeleton";
import { SessionScoreboard } from "@/features/sessions/components/session-scoreboard";
import type { SessionSummary } from "@/features/sessions/session";
import { sessionDateParts, todayInVietnam } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { listSessions } from "@/server/sessions";

function HomeBoardBar() {
  return (
    <BoardBar>
      <h1 className="board-heading text-[1.75rem] leading-none">Cầu lông</h1>
      <Link
        href="/sessions/new"
        className={buttonVariants({ variant: "board-solid", size: "sm" })}
      >
        <Plus aria-hidden />
        Tạo buổi
      </Link>
    </BoardBar>
  );
}

function HomeBoardIntro() {
  return (
    <p className="mt-2 max-w-[34ch] text-[0.9375rem] text-board-muted">
      Lên lịch đánh cầu và chia tiền sân, nước, cầu cho cả nhóm.
    </p>
  );
}

function byPlayTimeAscending(a: SessionSummary, b: SessionSummary): number {
  const aKey = `${a.playDate} ${a.startTime ?? "99:99"}`;
  const bKey = `${b.playDate} ${b.startTime ?? "99:99"}`;
  return aKey.localeCompare(bKey);
}

/** The board on the home page plus the session lists under it. */
export async function SessionsOverview() {
  // Request time so new sessions and attendance edits show up immediately.
  // Outside the try: connection() rejects during prerendering and must not be caught.
  await connection();
  const today = todayInVietnam();

  let sessions: SessionSummary[];
  try {
    sessions = await listSessions();
  } catch (cause) {
    console.error("sessions: list failed", cause);
    return (
      <Board>
        <HomeBoardBar />
        <HomeBoardIntro />
        <p
          role="alert"
          className="mt-6 rounded-md bg-board-deep p-4 text-[0.9375rem] font-medium"
        >
          Không tải được buổi đánh, vui lòng tải lại trang.
        </p>
      </Board>
    );
  }

  return <SessionsOverviewView sessions={sessions} today={today} />;
}

/** The home board and lists for already-loaded sessions. */
export function SessionsOverviewView({
  sessions,
  today,
}: {
  sessions: SessionSummary[];
  today: string;
}) {
  const upcoming = sessions
    .filter((session) => session.playDate >= today)
    .sort(byPlayTimeAscending);
  const past = sessions.filter((session) => session.playDate < today);
  const [next, ...later] = upcoming;

  return (
    <>
      <Board>
        <HomeBoardBar />
        <HomeBoardIntro />
        {next ? (
          <NextSessionCard session={next} today={today} />
        ) : (
          <div className="mt-6 flex flex-col items-start gap-3 rounded-md bg-board-deep p-4">
            <p className="text-lg font-semibold">Chưa có buổi nào sắp tới.</p>
            <p className="text-[0.9375rem] text-board-muted">
              Tạo một buổi rồi gửi link vào nhóm chat để mọi người báo đi.
            </p>
          </div>
        )}
      </Board>

      {later.length > 0 || past.length > 0 ? (
        <div className={cn(PAGE_CONTAINER, "flex flex-col gap-8 pt-6")}>
          {later.length > 0 ? (
            <SessionGroup
              id="later-sessions-heading"
              title="Sắp tới"
              sessions={later}
              today={today}
            />
          ) : null}
          {past.length > 0 ? (
            <SessionGroup
              id="past-sessions-heading"
              title="Đã đánh"
              sessions={past}
              today={today}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function NextSessionCard({
  session,
  today,
}: {
  session: SessionSummary;
  today: string;
}) {
  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group mt-6 block rounded-md bg-board-deep p-4 transition-colors outline-none hover:bg-[color-mix(in_srgb,var(--board-deep),black_12%)] focus-visible:ring-2 focus-visible:ring-board-foreground"
    >
      <SessionScoreboard
        heading="h2"
        playDate={session.playDate}
        startTime={session.startTime}
        venue={session.venue}
        today={today}
      />
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-board-line pt-4">
        <span className="flex items-center gap-2">
          <ScoreTile value={session.attendeeCount} size="count" tone="score" />
          <span className="text-[0.9375rem] font-semibold">người đi</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[0.9375rem] font-semibold">
          Xem và báo đi
          <ChevronRight
            className="size-5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}

function SessionGroup({
  id,
  title,
  sessions,
  today,
}: {
  id: string;
  title: string;
  sessions: SessionSummary[];
  today: string;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-lg font-bold">
        {title}
      </h2>
      <ul className="flex flex-col divide-y overflow-hidden rounded-md border bg-card">
        {sessions.map((session) => (
          <li key={session.id}>
            <SessionRow session={session} today={today} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SessionRow({
  session,
  today,
}: {
  session: SessionSummary;
  today: string;
}) {
  const date = sessionDateParts(session.playDate);
  const showYear = date.year !== Number(today.slice(0, 4));
  const details = [session.startTime, session.venue]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="flex min-h-16 items-center gap-3 py-2.5 pr-3 pl-3 transition-colors outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
    >
      <ScoreTile value={date.day} size="row" tone="board" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold break-words">
          {date.weekday}, {date.day}/{date.month}
          {showYear ? `/${date.year}` : null}
        </span>
        <span className="text-sm break-words text-muted-foreground">
          {details || "Chưa có giờ và sân"}
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-muted-foreground tabular-nums">
        {session.attendeeCount} người
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </Link>
  );
}

/** Placeholder with the home page's shape while sessions load. */
export function SessionsOverviewSkeleton() {
  return (
    <>
      <Board>
        <HomeBoardBar />
        <HomeBoardIntro />
        <div className="mt-6 flex flex-col gap-4 rounded-md bg-board-deep p-4">
          <LoadingLabel />
          <span className="block h-7 w-28 rounded-md bg-white/15" />
          <div className="flex gap-6">
            <span className="block h-19 w-36 rounded-md bg-white/15" />
            <span className="block h-19 w-36 rounded-md bg-white/15" />
          </div>
          <span className="block h-6 w-44 rounded-md bg-white/15" />
        </div>
      </Board>
      <div className={cn(PAGE_CONTAINER, "flex flex-col gap-3 pt-6")}>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
    </>
  );
}
