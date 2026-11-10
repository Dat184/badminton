import { ScoreTile } from "@/components/ui/score-tile";
import { AddMemberForm } from "@/features/members/components/add-member-form";
import { MemberRow } from "@/features/members/components/member-row";
import type { Member } from "@/features/members/member";
import { requireHost } from "@/server/auth";
import { listActiveMembers } from "@/server/members";

export async function MemberSection() {
  await requireHost();

  let members: Member[];
  try {
    members = await listActiveMembers();
  } catch (cause) {
    console.error("members: list failed", cause);
    return (
      <p role="alert" className="text-sm font-medium text-destructive">
        Không tải được danh sách thành viên, vui lòng tải lại trang.
      </p>
    );
  }

  return (
    <section aria-labelledby="members-heading" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2
            id="members-heading"
            className="text-[1.375rem] leading-tight font-bold"
          >
            Thành viên
          </h2>
          <p className="text-sm text-muted-foreground">
            Người trong danh sách sẽ hiện ở mọi buổi để tự báo đi.
          </p>
        </div>
        <p className="flex shrink-0 items-center gap-2">
          <ScoreTile value={members.length} size="count" tone="score" />
          <span className="text-sm leading-tight font-semibold text-muted-foreground">
            người
          </span>
          <span className="sr-only">{members.length} thành viên</span>
        </p>
      </div>
      <AddMemberForm />
      {members.length === 0 ? (
        <p className="rounded-md border border-dashed border-input/50 bg-card px-4 py-6 text-center text-[0.9375rem] text-muted-foreground">
          Chưa có thành viên nào. Thêm biệt danh từng người ở ô phía trên.
        </p>
      ) : (
        <ul className="flex flex-col divide-y overflow-hidden rounded-md border bg-card">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </ul>
      )}
    </section>
  );
}
