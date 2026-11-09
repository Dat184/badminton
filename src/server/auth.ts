import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/server/supabase/server";

export type Host = {
  id: string;
  email: string;
};

export async function requireHost(): Promise<Host> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect("/login");
  }

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
  };
}
