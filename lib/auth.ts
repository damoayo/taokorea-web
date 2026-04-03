import "server-only";

import { BASE_URL, type AuthUser } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE_NAME = "SELLERHUB_SESSION";

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
