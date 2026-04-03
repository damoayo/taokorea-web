import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "SELLERHUB_SESSION";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  );
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
