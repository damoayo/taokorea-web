// ============================================================
// 파일 위치: app/(shop)/HomeClient.tsx
// 역할: 구매대행 셀러용 메인 페이지 (소싱 도구)
// ============================================================
// 🔑 이 사이트의 사용자 = 구매대행 셀러
//    - 타오바오 상품을 탐색하고
//    - 마진이 되는 상품을 골라서
//    - 한국 쇼핑몰(쿠팡, 스마트스토어 등)에 올리는 사람들
//
// 그래서 "할인", "장바구니", "무료배송" 같은 소비자 용어 대신
// "소싱", "마진율", "상품 등록", "번역 완료" 같은 셀러 용어를 씀
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Product, Category } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Clock,
  Package,
  Languages,
  ImagePlus,
  Search,
  BarChart3,
  Boxes,
  Zap,
  Globe,
  ShieldCheck,
} from "lucide-react";

// ══════════════════════════════════════════════════════
// 히어로 슬라이드 — 셀러 관점 메시지
// ══════════════════════════════════════════════════════
const HERO_SLIDES = [
  {
    id: 1,
    // 셀러가 관심 있는 건 "소싱할 상품이 있느냐"
    title: "타오바오 신규 소싱 상품",
    subtitle: "매일 업데이트되는 중국 트렌드 상품을 바로 확인하세요",
    cta: "소싱 상품 보기",
    href: "/products",
    accent: "border-l-4 border-indigo-500",
  },
  {
    id: 2,
    // 셀러가 가장 관심 있는 건 "마진이 남느냐"
    title: "마진율 자동 계산",
    subtitle: "환율·배송비·수수료를 반영한 예상 마진을 즉시 확인",
    cta: "수익 분석 보기",
    href: "/admin/products",
    accent: "border-l-4 border-emerald-500",
  },
  {
    id: 3,
    // 셀러의 큰 고민 = 중국어 번역 + 이미지 한글화
    title: "AI 자동 번역 & 이미지 한글화",
    subtitle: "상품명·옵션·상세 설명을 한국어로 자동 변환",
    cta: "번역 상품 확인",
    href: "/admin/products",
    accent: "border-l-4 border-sky-500",
  },
];

// ══════════════════════════════════════════════════════
// 카테고리 아이콘 매핑 (셀러 관점)
// ══════════════════════════════════════════════════════
const CATEGORY_ICONS: Record<string, string> = {
  "의류": "👕", "여성의류": "👗", "남성의류": "👔",
  "전자기기": "📱", "가전": "🖥️", "디지털": "💻",
  "뷰티": "💄", "화장품": "💅", "스킨케어": "🧴",
  "식품": "🍜", "음식": "🍱", "간식": "🍪",
  "가구": "🛋️", "인테리어": "🏠", "리빙": "🪴",
  "유아동": "👶", "키즈": "🧸",
  "스포츠": "⚽", "아웃도어": "🏕️",
  "가방": "👜", "잡화": "🧢", "악세사리": "💍",
  "자동차": "🚗", "펫": "🐾",
};

function getCategoryIcon(name: string, icon?: string): string {
  if (icon) return icon;
  for (const [keyword, emoji] of Object.entries(CATEGORY_ICONS)) {
    if (name.includes(keyword)) return emoji;
  }
  return "📦";
}

// ══════════════════════════════════════════════════════
// 상품 카드 — 셀러가 볼 정보 위주 (마진율, 원가, 번역 상태 등)
// ══════════════════════════════════════════════════════
function ProductCard({ product, rank }: { product: Product; rank?: number }) {
  // 마진율 계산 (단순 공식: (판매가 - 원가환산) / 판매가 * 100)
  // 실제로는 환율·배송비 반영해야 하지만, 표시용으로 대략 계산
  const estimatedCostKrw = product.originalPriceCny * 190; // 대략 환율
  const marginRate = product.sellingPriceKrw > 0
    ? Math.round(((product.sellingPriceKrw - estimatedCostKrw) / product.sellingPriceKrw) * 100)
    : 0;

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer h-full border border-gray-200 dark:border-gray-700">
        {/* 이미지 */}
        <div className="aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden relative">
          {product.mainImageUrl ? (
            <img
              src={product.mainImageUrl}
              alt={product.titleKo ?? product.titleOriginal}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
              📦
            </div>
          )}
          {/* 순위 (인기 상품에서만) */}
          {rank !== undefined && (
            <div className={`absolute top-1.5 left-1.5 w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
              rank <= 3
                ? "bg-gray-900 text-white"
                : "bg-gray-600/70 text-white"
            }`}>
              {rank}
            </div>
          )}
          {/* 번역 완료 표시 */}
          {product.titleKo && (
            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-white/90 dark:bg-gray-900/90 rounded text-[10px] font-medium text-indigo-600 flex items-center gap-0.5">
              <Languages size={10} />
              번역
            </div>
          )}
        </div>

        {/* 텍스트 */}
        <CardContent className="p-2.5 space-y-1.5">
          {product.categoryName && (
            <p className="text-[11px] text-gray-400 truncate">{product.categoryName}</p>
          )}
          <p className="text-sm font-medium line-clamp-2 text-gray-800 dark:text-gray-200 leading-snug min-h-[2.5rem]">
            {product.titleKo ?? product.titleOriginal}
          </p>
          {/* 가격 영역 — 셀러는 원가와 판매가 둘 다 본다 */}
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                ₩{product.sellingPriceKrw?.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400">
                ¥{product.originalPriceCny}
              </span>
            </div>
            {/* 마진율 표시 */}
            {marginRate > 0 && (
              <div className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
                marginRate >= 30
                  ? "text-emerald-600"   // 마진 30% 이상 = 좋음
                  : marginRate >= 15
                  ? "text-amber-600"     // 15~30% = 보통
                  : "text-gray-400"      // 15% 미만 = 낮음
              }`}>
                <TrendingUp size={11} />
                마진 {marginRate}%
              </div>
            )}
          </div>
          {/* 판매량 */}
          {product.salesVolume > 0 && (
            <p className="text-[11px] text-gray-400">
              판매 {product.salesVolume.toLocaleString()}건
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// ══════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════
export default function HomeClient({
  popularProducts,
  newProducts,
  categories,
}: {
  popularProducts: Product[];
  newProducts: Product[];
  categories: Category[];
}) {
  // ── 히어로 슬라이더 ───────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // 5초마다 자동 전환 (셀러 도구니까 좀 더 느리게)
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="space-y-10 -mt-8">

      {/* ═══════════════════════════════════════════════
          섹션 1: 히어로 — 차분한 카드 슬라이더
          원색 그라디언트 대신 흰/회색 카드 + 포인트 라인
          ═══════════════════════════════════════════════ */}
      <section className="relative -mx-4 overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <div key={slide.id} className="w-full flex-shrink-0 px-4">
              <Link href={slide.href}>
                <div className={`rounded-xl bg-gray-50 dark:bg-gray-900 ${slide.accent} p-8 md:p-10 min-h-[160px] md:min-h-[200px] flex items-center hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors`}>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      {slide.title}
                    </h2>
                    <p className="text-gray-500 mt-1.5 text-sm md:text-base">
                      {slide.subtitle}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {slide.cta}
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* 좌우 화살표 */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center hover:bg-gray-50 transition z-10"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center hover:bg-gray-50 transition z-10"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>

        {/* 인디케이터 */}
        <div className="flex justify-center gap-1.5 mt-4">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? "bg-gray-800 dark:bg-gray-200 w-5"
                  : "bg-gray-300 dark:bg-gray-600 w-1.5"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          섹션 2: 핵심 기능 안내 (셀러가 이 도구로 뭘 할 수 있는지)
          ═══════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: <Search size={20} />,
            title: "상품 소싱",
            desc: "타오바오 상품 자동 수집",
            color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950",
          },
          {
            icon: <Languages size={20} />,
            title: "AI 번역",
            desc: "상품명·설명 자동 한글화",
            color: "text-sky-500 bg-sky-50 dark:bg-sky-950",
          },
          {
            icon: <ImagePlus size={20} />,
            title: "이미지 번역",
            desc: "중국어 이미지 한글 변환",
            color: "text-violet-500 bg-violet-50 dark:bg-violet-950",
          },
          {
            icon: <Boxes size={20} />,
            title: "다채널 등록",
            desc: "쿠팡·스마트스토어·11번가",
            color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
              {item.icon}
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════
          섹션 3: 카테고리 바로가기
          ═══════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              카테고리별 소싱
            </h2>
            <Link
              href="/products"
              className="text-xs text-gray-400 hover:text-indigo-500 flex items-center gap-0.5 transition"
            >
              전체보기 <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-1 group py-2"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:scale-105 transition-all duration-200">
                  {getCategoryIcon(cat.nameKo, cat.icon)}
                </div>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center truncate w-full group-hover:text-indigo-600 transition">
                  {cat.nameKo}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          섹션 4: 인기 소싱 상품
          ═══════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <BarChart3 size={18} className="text-gray-400" />
            인기 소싱 상품
          </h2>
          <Link
            href="/products"
            className="text-xs text-gray-400 hover:text-indigo-500 flex items-center gap-0.5 transition"
          >
            더보기 <ChevronRight size={12} />
          </Link>
        </div>
        {popularProducts.length === 0 ? (
          <EmptySection message="소싱 상품을 준비중입니다" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {popularProducts.map((p, idx) => (
              <ProductCard key={p.id} product={p} rank={idx + 1} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════
          섹션 5: 셀러 도구 안내 배너 (프로모션 대신)
          ═══════════════════════════════════════════════ */}
      <section className="grid sm:grid-cols-2 gap-3">
        <Link href="/admin/products">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors bg-white dark:bg-gray-900">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-500 flex items-center justify-center flex-shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                  원클릭 상품 등록
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  번역된 상품을 쿠팡·스마트스토어에 바로 등록하세요
                </p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/admin/settings/filter">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors bg-white dark:bg-gray-900">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                  마진 필터 설정
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  최소 마진율·판매가 기준을 설정하고 자동 필터링
                </p>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ═══════════════════════════════════════════════
          섹션 6: 신규 입고 상품
          ═══════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Clock size={18} className="text-gray-400" />
            신규 입고
          </h2>
          <Link
            href="/products"
            className="text-xs text-gray-400 hover:text-indigo-500 flex items-center gap-0.5 transition"
          >
            더보기 <ChevronRight size={12} />
          </Link>
        </div>
        {newProducts.length === 0 ? (
          <EmptySection message="신규 상품을 준비중입니다" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {newProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════
          섹션 7: 하단 — 서비스 특징 (셀러 관점)
          ═══════════════════════════════════════════════ */}
      <section className="border-t border-gray-100 dark:border-gray-800 pt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: <Globe size={20} />,       title: "타오바오 직연동", desc: "실시간 상품 동기화" },
            { icon: <Languages size={20} />,   title: "AI 자동 번역",   desc: "Gemini 기반 번역" },
            { icon: <Package size={20} />,     title: "다채널 관리",     desc: "한 곳에서 일괄 관리" },
            { icon: <ShieldCheck size={20} />, title: "안전한 데이터",   desc: "암호화·보안 처리" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 빈 상태 컴포넌트
// ══════════════════════════════════════════════════════
function EmptySection({ message }: { message: string }) {
  return (
    <div className="text-center py-14 text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
      <p className="text-2xl mb-1.5">📦</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
