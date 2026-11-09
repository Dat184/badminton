import { connection } from "next/server";
import type { Member } from "@/features/members/member";
import { listActiveMembers } from "@/server/members";

// Read-only member list for visitors who are not signed in.
export async function PublicMemberList() {
  // Request time, so edits show up at once and the Supabase client's
  // session-expiry check (Date.now()) stays out of prerendering. Outside the
  // try: connection() rejects during prerendering and must not be caught.
  await connection();

  let members: Member[];
  try {
    members = await listActiveMembers();
  } catch (cause) {
    console.error("members: public list failed", cause);
    return (
      <p role="alert" className="text-sm text-destructive">
        Không tải được danh sách thành viên, vui lòng tải lại trang.
      </p>
    );
  }

  return (
    <section
      aria-labelledby="public-members-heading"
      className="flex flex-col gap-3"
    >
      <h2
        id="public-members-heading"
        className="text-xl font-semibold tracking-tight"
      >
        Thành viên ({members.length})
      </h2>
      {members.length === 0 ? (
        <p className="text-sm text-foreground/70">Chưa có thành viên nào.</p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {members.map((member) => (
            <li key={member.id} className="px-3 py-2 break-words">
              {member.nickname}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
