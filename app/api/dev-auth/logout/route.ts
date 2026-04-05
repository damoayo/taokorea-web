import { DEV_ADMIN_COOKIE_NAME } from "@/lib/dev-auth";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    data: null,
  });

  response.cookies.delete(DEV_ADMIN_COOKIE_NAME);

  return response;
}
