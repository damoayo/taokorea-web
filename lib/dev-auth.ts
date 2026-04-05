import type { AuthUser } from "@/lib/api";

export const SESSION_COOKIE_NAME = "SELLERHUB_SESSION";
export const DEV_ADMIN_COOKIE_NAME = "SELLERHUB_DEV_ADMIN";

const DEV_ADMIN_EMAIL = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL;
const DEV_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD;

export function isDevAdminEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    Boolean(DEV_ADMIN_EMAIL && DEV_ADMIN_PASSWORD)
  );
}

export function isDevAdminCredential(email: string, password: string) {
  return (
    isDevAdminEnabled() &&
    email === DEV_ADMIN_EMAIL &&
    password === DEV_ADMIN_PASSWORD
  );
}

export function isDevAdminSession(sessionValue?: string) {
  return isDevAdminEnabled() && sessionValue === "1";
}

export function getDevAdminUser(): AuthUser {
  return {
    id: 0,
    email: DEV_ADMIN_EMAIL ?? "admin@taokorea.com",
    name: "Development Admin",
    role: "ADMIN",
  };
}
