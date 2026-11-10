import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Board,
  BoardBackLink,
  BoardBar,
  BoardTitle,
  PAGE_CONTAINER,
} from "@/components/ui/board";
import { LoadingLabel, Skeleton } from "@/components/ui/skeleton";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { MemberSection } from "@/features/members/components/member-section";
import { cn } from "@/lib/utils";
import { requireHost } from "@/server/auth";

export const metadata: Metadata = {
  title: "Quản lý",
  robots: { index: false, follow: false },
};

async function HostGreeting() {
  const host = await requireHost();
  return <>Đang đăng nhập: {host.email}</>;
}

function MemberSectionSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <LoadingLabel />
      <Skeleton className="h-13 w-40" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className="flex flex-1 flex-col pb-10">
      <Board>
        <BoardBar>
          <BoardBackLink href="/">Trang chủ</BoardBackLink>
          <SignOutButton />
        </BoardBar>
        <BoardTitle
          description={
            <Suspense fallback={<span className="opacity-0">…</span>}>
              <HostGreeting />
            </Suspense>
          }
        >
          Quản lý
        </BoardTitle>
      </Board>
      <div className={cn(PAGE_CONTAINER, "py-6")}>
        <Suspense fallback={<MemberSectionSkeleton />}>
          <MemberSection />
        </Suspense>
      </div>
    </main>
  );
}
