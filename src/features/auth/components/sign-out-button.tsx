import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" size="sm" variant="board">
        <LogOut aria-hidden />
        Đăng xuất
      </Button>
    </form>
  );
}
