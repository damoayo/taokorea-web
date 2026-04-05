import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DEV_ADMIN_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/dev-auth";
import { normalizeRedirectPath } from "@/lib/redirect";

export function proxy(request: NextRequest) {
  const hasBackendSession = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  );
  const hasDevAdminSession = request.cookies.get(DEV_ADMIN_COOKIE_NAME)?.value === "1";
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !hasBackendSession && !hasDevAdminSession) {
    const loginUrl = new URL("/login", request.url);
    const redirectPath = normalizeRedirectPath(
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    loginUrl.searchParams.set("redirect", redirectPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
