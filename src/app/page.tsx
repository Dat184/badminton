import { Suspense } from "react";
import { PAGE_CONTAINER } from "@/components/ui/board";
import {
  PublicMemberList,
  PublicMemberListSkeleton,
} from "@/features/members/components/public-member-list";
import {
  SessionsOverview,
  SessionsOverviewSkeleton,
} from "@/features/sessions/components/session-list";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col pb-10">
      <Suspense fallback={<SessionsOverviewSkeleton />}>
        <SessionsOverview />
      </Suspense>
      <div className={cn(PAGE_CONTAINER, "pt-8")}>
        <Suspense fallback={<PublicMemberListSkeleton />}>
          <PublicMemberList />
        </Suspense>
      </div>
    </main>
  );
}
