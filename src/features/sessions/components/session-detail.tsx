import { connection } from "next/server";
import type { Member } from "@/features/members/member";
import { AttendanceList } from "@/features/sessions/components/attendance-list";
import { SessionHeader } from "@/features/sessions/components/session-header";
import type { SessionDetail } from "@/features/sessions/session";
import { listActiveMembers } from "@/server/members";
import { getSessionDetail } from "@/server/sessions";

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
      <p role="alert" className="text-sm text-destructive">
        Không tải được buổi đánh, vui lòng tải lại trang.
      </p>
    );
  }

  if (!session) {
    return (
      <p className="text-sm text-foreground/70">
        Không tìm thấy buổi đánh này.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SessionHeader
        session={{
          id: session.id,
          playDate: session.playDate,
          startTime: session.startTime,
          venue: session.venue,
          attendeeCount: session.attendeeCount,
        }}
      />
      <AttendanceList
        sessionId={session.id}
        members={members}
        attendees={session.attendees}
      />
    </div>
  );
}
