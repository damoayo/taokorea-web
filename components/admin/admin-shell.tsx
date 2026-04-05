"use client";

import { logout, type AuthUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/shop-listings", label: "Listings", icon: ClipboardList },
  { href: "/products", label: "Storefront", icon: Store },
];

const settingsItems = [
  { href: "/admin/settings/filter", label: "Filter", icon: Filter },
  { href: "/admin/settings/categories", label: "Categories", icon: Tag },
];

export default function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthUser;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await logout();
      } finally {
        router.replace("/login");
      }
    });
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside
        className={cn(
          "flex flex-col bg-gray-900 text-white transition-all duration-300",
          sidebarOpen ? "w-56" : "w-16"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-700 px-4">
          {sidebarOpen ? (
            <span className="text-sm font-bold tracking-wide">TaoKorea</span>
          ) : null}
          <button
            onClick={() => setSidebarOpen((value) => !value)}
            className="rounded p-1 hover:bg-gray-700"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto py-4">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-700",
                pathname.startsWith(href) && href !== "/"
                  ? "bg-gray-700 font-medium text-white"
                  : "text-gray-300"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen ? <span>{label}</span> : null}
            </Link>
          ))}

          <div className="mt-3 border-t border-gray-700 pt-3">
            {sidebarOpen ? (
              <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Settings
              </p>
            ) : (
              <div className="px-4 pb-1">
                <Settings size={14} className="text-gray-500" />
              </div>
            )}

            {settingsItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-700",
                  pathname.startsWith(href)
                    ? "bg-gray-700 font-medium text-white"
                    : "text-gray-300"
                )}
              >
                <Icon size={18} className="shrink-0" />
                {sidebarOpen ? <span>{label}</span> : null}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-white px-6 shadow-sm dark:bg-gray-800">
          <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Admin Console
          </h1>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((value) => !value)}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            >
              <span>{user.name || user.email}</span>
              <span className="text-xs text-gray-400">{user.role}</span>
            </button>

            {userMenuOpen ? (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
                  <button
                    onClick={handleLogout}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
