import type { Metadata } from "next";
import { Suspense } from "react";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { MemberSection } from "@/features/members/components/member-section";
import { requireHost } from "@/server/auth";

export const metadata: Metadata = {
  title: "Quản lý",
  robots: { index: false, follow: false },
};

async function HostGreeting() {
  const host = await requireHost();
  return <p className="text-foreground/70">Xin chào, {host.email}</p>;
}

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Quản lý</h1>
        <SignOutButton />
      </div>
      <Suspense fallback="Đang tải…">
        <HostGreeting />
      </Suspense>
      <Suspense fallback="Đang tải…">
        <MemberSection />
      </Suspense>
    </main>
  );
}
