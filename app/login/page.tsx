import LoginFormRestored from "@/components/auth/login-form-restored";
import { getCurrentUser } from "@/lib/auth";
import { normalizeRedirectPath } from "@/lib/redirect";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = normalizeRedirectPath(redirectParam);

  if (user?.role === "ADMIN") {
    redirect(redirectTo);
  }

  return <LoginFormRestored redirectTo={redirectTo} />;
}
