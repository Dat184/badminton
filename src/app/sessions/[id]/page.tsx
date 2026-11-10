import type { Metadata } from "next";
import { Suspense } from "react";
import {
  SessionDetailSkeleton,
  SessionDetailView,
} from "@/features/sessions/components/session-detail";

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
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<SessionDetailSkeleton />}>
        <SessionPageContent params={params} />
      </Suspense>
    </main>
  );
}
