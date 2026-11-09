import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/server/supabase/server";

export type Host = {
  id: string;
  email: string;
};

export async function requireHost(): Promise<Host> {
  // The auth check runs only at request time. Without this, the dev-time App Shell
  // validation (partialPrefetching) resolves cookies and then trips over the
  // Date.now() that getClaims() uses to check token expiry.
  await connection();
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
