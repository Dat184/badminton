import type { Metadata } from "next";
import {
  Board,
  BoardBackLink,
  BoardBar,
  BoardTitle,
  PAGE_CONTAINER,
} from "@/components/ui/board";
import { LoginForm } from "@/features/auth/components/login-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Đăng nhập",
  // Editing pages are not linked anywhere; keep them out of search results too.
  // (No robots.txt entry: that file is public and would advertise the paths.)
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col pb-10">
      <Board>
        <BoardBar>
          <BoardBackLink href="/">Trang chủ</BoardBackLink>
        </BoardBar>
        <BoardTitle description="Dành cho người quản lý danh sách thành viên.">
          Đăng nhập
        </BoardTitle>
      </Board>
      <div className={cn(PAGE_CONTAINER, "py-6")}>
        <LoginForm />
      </div>
    </main>
  );
}
