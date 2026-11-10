import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  Board,
  BoardBackLink,
  BoardBar,
  BoardTitle,
  PAGE_CONTAINER,
} from "@/components/ui/board";
import { LoadingLabel, Skeleton } from "@/components/ui/skeleton";
import { createSession } from "@/features/sessions/actions";
import { SessionForm } from "@/features/sessions/components/session-form";
import { todayInVietnam } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tạo buổi đánh",
};

async function NewSessionForm() {
  await connection();

  return (
    <SessionForm
      action={createSession}
      initialValues={{
        playDate: todayInVietnam(),
        startTime: "",
        venue: "",
      }}
      submitLabel="Tạo buổi"
      pendingLabel="Đang tạo…"
    />
  );
}

function NewSessionFormSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <LoadingLabel />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-17" />
        <Skeleton className="h-17" />
      </div>
      <Skeleton className="h-17" />
      <Skeleton className="h-11 w-32" />
    </div>
  );
}

export default function NewSessionPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Board>
        <BoardBar>
          <BoardBackLink href="/">Cầu lông</BoardBackLink>
        </BoardBar>
        <BoardTitle description="Chọn ngày, giờ và sân. Tạo xong, gửi link buổi vào nhóm để mọi người báo đi.">
          Tạo buổi đánh
        </BoardTitle>
      </Board>
      <div className={cn(PAGE_CONTAINER, "py-6")}>
        <div className="rounded-md border bg-card p-4 sm:p-6">
          <Suspense fallback={<NewSessionFormSkeleton />}>
            <NewSessionForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
