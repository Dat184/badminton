import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { createSession } from "@/features/sessions/actions";
import { SessionForm } from "@/features/sessions/components/session-form";
import { todayInVietnam } from "@/lib/dates";

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

export default function NewSessionPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="w-fit text-sm text-foreground/70 hover:text-foreground"
        >
          ← Trang chủ
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Tạo buổi đánh</h1>
      </div>
      <Suspense fallback="Đang tải…">
        <NewSessionForm />
      </Suspense>
    </main>
  );
}
