import "server-only";

import { BASE_URL, type AuthUser } from "@/lib/api";
import { DEV_ADMIN_COOKIE_NAME, SESSION_COOKIE_NAME, getDevAdminUser, isDevAdminSession } from "@/lib/dev-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface AuthSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

function buildCookieHeader(items: { name: string; value: string }[]) {
  return items.map(({ name, value }) => `${name}=${value}`).join("; ");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const devAdminSession = cookieStore.get(DEV_ADMIN_COOKIE_NAME)?.value;

  if (isDevAdminSession(devAdminSession)) {
    return getDevAdminUser();
  }

  if (!session) {
    return null;
  }

  const response = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      cookie: buildCookieHeader(cookieStore.getAll()),
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Auth check failed with status ${response.status}`);
  }

  const payload = (await response.json()) as AuthSuccessResponse<AuthUser>;
  return payload.data;
}

export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return user;
}
