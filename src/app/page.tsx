import { Suspense } from "react";
import { PublicMemberList } from "@/features/members/components/public-member-list";
import { SessionList } from "@/features/sessions/components/session-list";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Cầu lông</h1>
        <p className="text-foreground/70">
          Lên lịch đánh cầu và chia tiền sân, nước, cầu cho cả nhóm.
        </p>
      </div>
      <Suspense fallback="Đang tải…">
        <SessionList />
      </Suspense>
      <Suspense fallback="Đang tải…">
        <PublicMemberList />
      </Suspense>
    </main>
  );
}
