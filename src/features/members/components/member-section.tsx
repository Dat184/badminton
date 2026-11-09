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
      <p role="alert" className="text-sm text-destructive">
        Không tải được danh sách thành viên, vui lòng tải lại trang.
      </p>
    );
  }

  return (
    <section aria-labelledby="members-heading" className="flex flex-col gap-3">
      <h2 id="members-heading" className="text-xl font-semibold tracking-tight">
        Thành viên ({members.length})
      </h2>
      <AddMemberForm />
      {members.length === 0 ? (
        <p className="text-sm text-foreground/70">Chưa có thành viên nào.</p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </ul>
      )}
    </section>
  );
}
