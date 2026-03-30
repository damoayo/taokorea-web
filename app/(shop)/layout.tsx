// ============================================================
// 파일 위치: app/(shop)/layout.tsx
// 역할: 쇼핑몰(셀러 소싱 도구) 공통 레이아웃
// ============================================================
// 🔑 변경 사항:
//   - "TaoKorea Shop" → "TaoKorea" (셀러 도구)
//   - 장바구니 제거
//   - 셀러 관점 네비게이션 (소싱, 관리)
//   - 푸터 보강 (사업자 정보 등)
// ============================================================

import { Search, LayoutDashboard, Boxes, Settings } from "lucide-react";
import Link from "next/link";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* ── 헤더 ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
          {/* 로고 */}
          <Link href="/home" className="flex items-center gap-2">
            {/* 로고 마크 — 작은 사각형 아이콘 */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-black tracking-tighter">T</span>
            </div>
            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
              Tao<span className="text-indigo-500">Korea</span>
            </span>
          </Link>

          {/* 검색 — 가운데 */}
          <div className="hidden sm:flex items-center flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
              />
              <input
                type="search"
                placeholder="상품명, 카테고리 검색..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 placeholder:text-gray-300 dark:placeholder:text-gray-600 transition"
              />
            </div>
          </div>

          {/* 네비게이션 — 오른쪽 */}
          <nav className="flex items-center gap-1">
            <NavLink href="/products" icon={<Boxes size={16} />} label="소싱" />
            <NavLink href="/admin/dashboard" icon={<LayoutDashboard size={16} />} label="관리" />
            <NavLink href="/admin/settings/filter" icon={<Settings size={16} />} label="설정" />
          </nav>
        </div>
      </header>

      {/* ── 본문 ─────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* ── 푸터 ─────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* 상단 — 로고 + 링크 */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-[10px] font-black">T</span>
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Tao<span className="text-indigo-500">Korea</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                타오바오 상품을 한국 마켓에 연결하는
                구매대행 셀러 전용 소싱 플랫폼
              </p>
            </div>
            <div className="flex gap-8 text-xs text-gray-400">
              <div className="space-y-2">
                <p className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">서비스</p>
                <Link href="/products" className="block hover:text-indigo-500 transition">상품 소싱</Link>
                <Link href="/admin/products" className="block hover:text-indigo-500 transition">상품 관리</Link>
                <Link href="/admin/shop-listings" className="block hover:text-indigo-500 transition">등록 관리</Link>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">지원</p>
                <Link href="#" className="block hover:text-indigo-500 transition">이용가이드</Link>
                <Link href="#" className="block hover:text-indigo-500 transition">FAQ</Link>
                <Link href="#" className="block hover:text-indigo-500 transition">문의하기</Link>
              </div>
            </div>
          </div>
          {/* 하단 — 저작권 + 구분선 */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-5 flex flex-col sm:flex-row justify-between gap-2">
            <p className="text-[11px] text-gray-400">
              © 2025 TaoKorea. All rights reserved.
            </p>
            <div className="flex gap-4 text-[11px] text-gray-400">
              <Link href="#" className="hover:text-gray-600 transition">이용약관</Link>
              <Link href="#" className="hover:text-gray-600 transition">개인정보처리방침</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── 네비게이션 링크 컴포넌트 ─────────────────────────
// 헤더 우측 네비 버튼 (아이콘 + 라벨)
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
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors"
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
}
