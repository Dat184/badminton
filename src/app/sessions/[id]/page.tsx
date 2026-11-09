import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SessionDetailView } from "@/features/sessions/components/session-detail";

export const metadata: Metadata = {
  title: "Buổi đánh",
};

async function SessionPageContent({
  params,
}: {
  params: PageProps<"/sessions/[id]">["params"];
}) {
  const { id } = await params;
  return <SessionDetailView id={id} />;
}

export default function SessionDetailPage({
  params,
}: PageProps<"/sessions/[id]">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
      <Link
        href="/"
        className="w-fit text-sm text-foreground/70 hover:text-foreground"
      >
        ← Trang chủ
      </Link>
      <Suspense fallback="Đang tải…">
        <SessionPageContent params={params} />
      </Suspense>
    </main>
  );
}
