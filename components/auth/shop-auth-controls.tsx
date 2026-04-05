"use client";

import { logout, type AuthUser } from "@/lib/api";
import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function ShopAuthControls({
  user,
}: {
  user: AuthUser | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await logout();
      } finally {
        router.replace("/login");
        router.refresh();
      }
    });
  }

  if (!user) {
    return (
      <Link
        href="/login?redirect=/products"
        className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      >
        <LogIn size={16} />
        <span className="hidden lg:inline">로그인</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 pl-2">
      <div className="hidden rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-600 md:block">
        {user.name || user.email}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut size={16} />
        <span>{isPending ? "로그아웃 중..." : "로그아웃"}</span>
      </button>
    </div>
  );
}
