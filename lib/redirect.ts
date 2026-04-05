export function normalizeRedirectPath(
  value: string | string[] | undefined,
  fallback = "/admin/dashboard"
) {
  const redirectPath = Array.isArray(value) ? value[0] : value;

  if (!redirectPath) {
    return fallback;
  }

  if (!redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return fallback;
  }

  return redirectPath;
}
