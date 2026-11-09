import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseEnv } from "@/server/supabase/env";

function redirectWithCookiesAndHeaders(
  url: URL,
  response: NextResponse,
  cacheHeaders: Record<string, string>,
): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  Object.entries(cacheHeaders).forEach(([k, v]) => {
    redirectResponse.headers.set(k, v);
  });
  return redirectResponse;
}

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });
  const cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        Object.assign(cacheHeaders, headers);
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(cacheHeaders).forEach(([k, v]) =>
          response.headers.set(k, v),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  if (!loggedIn && pathname.startsWith("/admin")) {
    return redirectWithCookiesAndHeaders(
      new URL("/login", request.url),
      response,
      cacheHeaders,
    );
  }

  if (loggedIn && pathname === "/login") {
    return redirectWithCookiesAndHeaders(
      new URL("/admin", request.url),
      response,
      cacheHeaders,
    );
  }

  return response;
}
