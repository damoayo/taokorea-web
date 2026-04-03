import LoginForm from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  return <LoginForm />;
}
