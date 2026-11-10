import { connection } from "next/server";
import { LoadingLabel, Skeleton } from "@/components/ui/skeleton";
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
      <p role="alert" className="text-sm font-medium text-destructive">
        Không tải được danh sách thành viên, vui lòng tải lại trang.
      </p>
    );
  }

  return (
    <section
      aria-labelledby="public-members-heading"
      className="flex flex-col gap-3"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="public-members-heading" className="text-lg font-bold">
          Thành viên
        </h2>
        <span className="text-sm font-semibold text-muted-foreground tabular-nums">
          {members.length} người
        </span>
      </div>
      {members.length === 0 ? (
        <p className="rounded-md border border-dashed border-input/50 bg-card px-4 py-6 text-center text-[0.9375rem] text-muted-foreground">
          Nhóm chưa có thành viên nào.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2 rounded-md border bg-card p-3">
          {members.map((member) => (
            <li
              key={member.id}
              className="rounded-sm bg-muted px-2.5 py-1.5 text-sm font-semibold break-words"
            >
              {member.nickname}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function PublicMemberListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <LoadingLabel />
      <Skeleton className="h-6 w-28" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
