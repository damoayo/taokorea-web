"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  Menu,
  X,
  Settings,
  Filter,
  Tag,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/products", label: "상품 관리", icon: Package },
  { href: "/admin/orders",         label: "주문 관리",      icon: ShoppingCart },
  { href: "/admin/shop-listings",  label: "등록 상품 관리", icon: ClipboardList },
  { href: "/products", label: "쇼핑몰 보기", icon: Store },
];

const settingsItems = [
  { href: "/admin/settings/filter",     label: "수익성 필터", icon: Filter },
  { href: "/admin/settings/categories", label: "카테고리",    icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-gray-900 text-white transition-all duration-300",
          sidebarOpen ? "w-56" : "w-16"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-gray-700">
          {sidebarOpen && (
            <span className="text-sm font-bold tracking-wide">SellerHub</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-gray-700"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-700",
                pathname.startsWith(href) && href !== "/"
                  ? "bg-gray-700 text-white font-medium"
                  : "text-gray-300"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}

          {/* 설정 섹션 */}
          <div className="pt-3 mt-3 border-t border-gray-700">
            {sidebarOpen && (
              <p className="px-4 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">설정</p>
            )}
            {!sidebarOpen && (
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
                    ? "bg-gray-700 text-white font-medium"
                    : "text-gray-300"
                )}
              >
                <Icon size={18} className="shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between bg-white dark:bg-gray-800 border-b px-6 shadow-sm">
          <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            관리자 패널
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>admin</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
