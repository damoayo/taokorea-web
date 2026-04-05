import ShopAuthControls from "@/components/auth/shop-auth-controls";
import { getCurrentUser } from "@/lib/auth";
import { Boxes, LayoutDashboard, Search, Settings } from "lucide-react";
import Link from "next/link";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
          <Link href="/home" className="flex shrink-0 items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white">
              T
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">TaoKorea</p>
              <p className="text-[11px] text-slate-500">SellerHub storefront</p>
            </div>
          </Link>

          <div className="hidden flex-1 md:block">
            <div className="relative mx-auto max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                placeholder="상품명 또는 카테고리 검색"
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>

          <nav className="ml-auto flex items-center gap-1">
            <NavLink href="/products" icon={<Boxes size={16} />} label="상품" />
            <NavLink
              href="/admin/dashboard"
              icon={<LayoutDashboard size={16} />}
              label="관리"
            />
            <NavLink
              href="/admin/settings/filter"
              icon={<Settings size={16} />}
              label="설정"
            />
            <ShopAuthControls user={user} />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white">
                T
              </div>
              <span className="text-sm font-semibold">TaoKorea</span>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-500">
              중국 소싱 상품을 빠르게 확인하고 운영할 수 있는 SellerHub 쇼핑
              뷰입니다.
            </p>
          </div>

          <div className="space-y-3 text-sm text-slate-500">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Browse
            </p>
            <Link href="/products" className="block transition hover:text-slate-900">
              상품 소싱
            </Link>
            <Link
              href="/admin/products"
              className="block transition hover:text-slate-900"
            >
              상품 관리
            </Link>
            <Link
              href="/admin/shop-listings"
              className="block transition hover:text-slate-900"
            >
              등록 관리
            </Link>
          </div>

          <div className="space-y-3 text-sm text-slate-500">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Support
            </p>
            <p>신규 가입 및 SNS 가입은 로그인 페이지에서 안내합니다.</p>
            <p>로그인 후에는 상단 메뉴에서 바로 로그아웃할 수 있습니다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

