import { DEV_ADMIN_COOKIE_NAME, getDevAdminUser, isDevAdminCredential, isDevAdminEnabled } from "@/lib/dev-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!isDevAdminEnabled()) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Development admin login is disabled." },
      },
      { status: 404 }
    );
  }

  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!email || !password || !isDevAdminCredential(email, password)) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Invalid admin credentials." },
      },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    success: true,
    data: getDevAdminUser(),
  });

  response.cookies.set(DEV_ADMIN_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
