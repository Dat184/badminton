import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
  // Editing pages are not linked anywhere; keep them out of search results too.
  // (No robots.txt entry: that file is public and would advertise the paths.)
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <LoginForm />
    </main>
  );
}
