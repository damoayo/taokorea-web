import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            TaoKorea Shop
          </Link>

          <div className="flex items-center gap-2 flex-1 max-w-sm mx-6">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                placeholder="상품 검색..."
                className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 TaoKorea Shop. 타오바오 공식 파트너샵</p>
        </div>
      </footer>
    </div>
  );
}
