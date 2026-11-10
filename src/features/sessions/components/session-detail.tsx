import { connection } from "next/server";
import type { ReactNode } from "react";
import {
  Board,
  BoardBackLink,
  BoardBar,
  PAGE_CONTAINER,
} from "@/components/ui/board";
import { Skeleton, LoadingLabel } from "@/components/ui/skeleton";
import type { Member } from "@/features/members/member";
import { AttendanceList } from "@/features/sessions/components/attendance-list";
import { SessionHeader } from "@/features/sessions/components/session-header";
import type { SessionDetail } from "@/features/sessions/session";
import { todayInVietnam } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { listActiveMembers } from "@/server/members";
import { getSessionDetail } from "@/server/sessions";

function SessionMessage({
  title,
  children,
  alert = false,
}: {
  title: string;
  children: ReactNode;
  alert?: boolean;
}) {
  return (
    <Board>
      <BoardBar>
        <BoardBackLink href="/">Cầu lông</BoardBackLink>
      </BoardBar>
      <div
        className="mt-4 flex flex-col gap-2"
        role={alert ? "alert" : undefined}
      >
        <h1 className="board-heading text-[1.75rem] leading-tight">{title}</h1>
        <p className="text-[0.9375rem] text-board-muted">{children}</p>
      </div>
    </Board>
  );
}

export async function SessionDetailView({ id }: { id: string }) {
  // Request time so attendance and session edits show up immediately.
  // Outside the try: connection() rejects during prerendering and must not be caught.
  await connection();

  let session: SessionDetail | null;
  let members: Member[];
  try {
    [session, members] = await Promise.all([
      getSessionDetail(id),
      listActiveMembers(),
    ]);
  } catch (cause) {
    console.error("sessions: detail failed", cause);
    return (
      <SessionMessage title="Không tải được buổi đánh" alert>
        Vui lòng tải lại trang.
      </SessionMessage>
    );
  }

  if (!session) {
    return (
      <SessionMessage title="Không tìm thấy buổi đánh">
        Buổi này có thể đã bị xóa. Xem các buổi khác ở trang chủ.
      </SessionMessage>
    );
  }

  return (
    <>
      <SessionHeader
        session={{
          id: session.id,
          playDate: session.playDate,
          startTime: session.startTime,
          venue: session.venue,
          attendeeCount: session.attendeeCount,
        }}
        today={todayInVietnam()}
      />
      <div className={cn(PAGE_CONTAINER, "py-6")}>
        <AttendanceList
          sessionId={session.id}
          members={members}
          attendees={session.attendees}
        />
      </div>
    </>
  );
}

/** Placeholder with the session page's shape while it loads. */
export function SessionDetailSkeleton() {
  return (
    <>
      <Board>
        <BoardBar>
          <BoardBackLink href="/">Cầu lông</BoardBackLink>
        </BoardBar>
        <div className="mt-4 flex flex-col gap-4">
          <LoadingLabel />
          <span className="block h-7 w-28 rounded-md bg-white/15" />
          <div className="flex gap-6">
            <span className="block h-19 w-36 rounded-md bg-white/15" />
            <span className="block h-19 w-36 rounded-md bg-white/15" />
          </div>
          <span className="block h-6 w-44 rounded-md bg-white/15" />
        </div>
      </Board>
      <div className={cn(PAGE_CONTAINER, "flex flex-col gap-4 py-6")}>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-64 w-full" />
      </div>
    </>
  );
}
