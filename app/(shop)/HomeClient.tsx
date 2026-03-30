// ============================================================
// 파일 위치: app/(shop)/HomeClient.tsx
// 역할: 쇼핑몰 메인 페이지의 모든 인터랙티브 UI
// ============================================================
// 🔑 섹션 구성 (쿠팡/무신사 스타일):
//   1. 히어로 배너 슬라이더 (자동 재생 + 수동 전환)
//   2. 카테고리 바로가기 (아이콘 그리드)
//   3. 인기 상품 섹션
//   4. 프로모션 배너 (이벤트/할인)
//   5. 신상품 섹션
//   6. 하단 혜택 안내
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Product, Category } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  Clock,
  Headphones,
  ArrowRight,
  Flame,
  Sparkles,
  Tag,
} from "lucide-react";

// ══════════════════════════════════════════════════════
// 히어로 배너 데이터 (나중에 관리자 페이지에서 수정 가능하게 할 수 있어)
// ══════════════════════════════════════════════════════
const HERO_SLIDES = [
  {
    id: 1,
    title: "타오바오 인기상품\n최대 70% 할인",
    subtitle: "중국 직구, 이제 쉽고 빠르게",
    cta: "쇼핑하러 가기",          // CTA = Call To Action (버튼 텍스트)
    href: "/products",
    // 그라디언트 배경 (이미지 대신 사용 — 나중에 실제 배너 이미지로 교체)
    bgClass: "from-indigo-600 via-blue-600 to-cyan-500",
    emoji: "🛍️",
  },
  {
    id: 2,
    title: "신규 회원 혜택\n첫 구매 무료배송",
    subtitle: "지금 가입하면 5,000원 쿠폰 증정",
    cta: "혜택 받기",
    href: "/products",
    bgClass: "from-rose-500 via-pink-500 to-fuchsia-500",
    emoji: "🎁",
  },
  {
    id: 3,
    title: "주간 베스트\nTOP 100",
    subtitle: "이번 주 가장 많이 팔린 상품",
    cta: "랭킹 보기",
    href: "/products",
    bgClass: "from-amber-500 via-orange-500 to-red-500",
    emoji: "🏆",
  },
];

// ══════════════════════════════════════════════════════
// 카테고리 기본 아이콘 매핑
// ══════════════════════════════════════════════════════
// 카테고리에 icon이 없을 때 이름으로 추측해서 이모지 배정
const CATEGORY_ICONS: Record<string, string> = {
  "의류": "👕", "여성의류": "👗", "남성의류": "👔",
  "전자기기": "📱", "가전": "🖥️", "디지털": "💻",
  "뷰티": "💄", "화장품": "💅", "스킨케어": "🧴",
  "식품": "🍜", "음식": "🍱", "간식": "🍪",
  "가구": "🛋️", "인테리어": "🏠", "리빙": "🪴",
  "유아동": "👶", "아기": "🍼", "키즈": "🧸",
  "스포츠": "⚽", "운동": "🏋️", "아웃도어": "🏕️",
  "가방": "👜", "잡화": "🧢", "악세사리": "💍",
  "자동차": "🚗", "펫": "🐾", "반려동물": "🐶",
};

// 카테고리 이름에서 아이콘 추측
function getCategoryIcon(name: string, icon?: string): string {
  if (icon) return icon; // DB에 아이콘이 이미 있으면 그거 쓰기
  // 카테고리 이름에 포함된 키워드로 매칭
  for (const [keyword, emoji] of Object.entries(CATEGORY_ICONS)) {
    if (name.includes(keyword)) return emoji;
  }
  return "📦"; // 못 찾으면 기본 아이콘
}

// ══════════════════════════════════════════════════════
// 프로모션 배너 데이터
// ══════════════════════════════════════════════════════
const PROMO_BANNERS = [
  {
    id: 1,
    title: "타임딜",
    desc: "매일 오전 10시, 한정수량 특가",
    icon: <Clock size={24} />,
    bgClass: "from-violet-500 to-purple-600",
    href: "/products",
  },
  {
    id: 2,
    title: "브랜드 위크",
    desc: "인기 브랜드 최대 50% 할인",
    icon: <Tag size={24} />,
    bgClass: "from-emerald-500 to-teal-600",
    href: "/products",
  },
];

// ══════════════════════════════════════════════════════
// 상품 카드 컴포넌트 (인기상품 + 신상품에서 재사용)
// ══════════════════════════════════════════════════════
function ProductCard({ product, rank }: { product: Product; rank?: number }) {
  return (
    <Link href={`/products/${product.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full border-0 shadow-sm">
        {/* 이미지 영역 */}
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
          {product.mainImageUrl ? (
            <img
              src={product.mainImageUrl}
              alt={product.titleKo ?? product.titleOriginal}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
              📦
            </div>
          )}
          {/* 순위 뱃지 (rank가 넘어온 경우만 표시) */}
          {rank !== undefined && (
            <div className={`absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
              rank <= 3 ? "bg-red-500" : "bg-gray-800/70"
            }`}>
              {rank}
            </div>
          )}
          {/* 품절 오버레이 */}
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                품절
              </span>
            </div>
          )}
        </div>

        {/* 텍스트 영역 */}
        <CardContent className="p-3 space-y-1.5">
          {/* 카테고리 (있으면 표시) */}
          {product.categoryName && (
            <p className="text-xs text-gray-400 truncate">{product.categoryName}</p>
          )}
          {/* 상품명 */}
          <p className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-gray-100 leading-snug min-h-[2.5rem]">
            {product.titleKo ?? product.titleOriginal}
          </p>
          {/* 가격 */}
          <p className="text-base font-bold text-gray-900 dark:text-white">
            {product.sellingPriceKrw?.toLocaleString()}
            <span className="text-sm font-normal text-gray-500 ml-0.5">원</span>
          </p>
          {/* 판매량 */}
          {product.salesVolume > 0 && (
            <p className="text-xs text-gray-400">
              {product.salesVolume.toLocaleString()}개 구매
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
  // ── 히어로 슬라이더 상태 ───────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);

  // 다음/이전 슬라이드 이동
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // 자동 슬라이드 (4초마다 다음으로)
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    // 컴포넌트 사라지면 타이머 정리 (메모리 누수 방지)
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="space-y-10 -mt-8">
      {/* ═══════════════════════════════════════════════
          섹션 1: 히어로 배너 슬라이더
          ═══════════════════════════════════════════════ */}
      <section className="relative -mx-4 overflow-hidden">
        {/* 슬라이드 컨테이너 */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <div key={slide.id} className="w-full flex-shrink-0 px-4">
              <Link href={slide.href}>
                <div className={`relative rounded-2xl bg-gradient-to-r ${slide.bgClass} p-8 md:p-12 min-h-[200px] md:min-h-[280px] flex items-center overflow-hidden`}>
                  {/* 배경 장식 (큰 이모지) */}
                  <span className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 text-[80px] md:text-[120px] opacity-20 select-none">
                    {slide.emoji}
                  </span>
                  {/* 텍스트 */}
                  <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white whitespace-pre-line leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-white/80 mt-2 text-sm md:text-base">
                      {slide.subtitle}
                    </p>
                    <span className="inline-flex items-center gap-1.5 mt-4 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white/30 transition">
                      {slide.cta}
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* 좌우 화살표 (PC에서만 보임) */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow-md items-center justify-center hover:bg-white transition z-10"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow-md items-center justify-center hover:bg-white transition z-10"
        >
          <ChevronRight size={20} />
        </button>

        {/* 하단 인디케이터 (동그라미) */}
        <div className="flex justify-center gap-2 mt-4">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? "bg-indigo-600 w-6"    // 현재 슬라이드 → 넓은 바
                  : "bg-gray-300 w-2 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          섹션 2: 카테고리 바로가기 (아이콘 그리드)
          ═══════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              카테고리
            </h2>
            <Link
              href="/products"
              className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-0.5 transition"
            >
              전체보기 <ChevronRight size={14} />
            </Link>
          </div>
          {/* 가로 스크롤 가능한 아이콘 그리드 */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-1.5 group"
              >
                {/* 아이콘 원 */}
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-2xl group-hover:bg-indigo-50 group-hover:scale-105 transition-all duration-200 border border-gray-100 dark:border-gray-700">
                  {getCategoryIcon(cat.nameKo, cat.icon)}
                </div>
                {/* 카테고리 이름 */}
                <span className="text-xs text-gray-600 dark:text-gray-400 text-center truncate w-full group-hover:text-indigo-600 transition">
                  {cat.nameKo}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          섹션 3: 인기 상품 (🔥 HOT)
          ═══════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Flame size={20} className="text-red-500" />
            인기 상품
          </h2>
          <Link
            href="/products"
            className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-0.5 transition"
          >
            더보기 <ChevronRight size={14} />
          </Link>
        </div>
        {popularProducts.length === 0 ? (
          <EmptySection message="인기 상품을 준비중입니다" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {popularProducts.map((p, idx) => (
              <ProductCard key={p.id} product={p} rank={idx + 1} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════
          섹션 4: 프로모션 배너
          ═══════════════════════════════════════════════ */}
      <section className="grid sm:grid-cols-2 gap-3">
        {PROMO_BANNERS.map((banner) => (
          <Link key={banner.id} href={banner.href}>
            <div className={`relative rounded-xl bg-gradient-to-r ${banner.bgClass} p-6 text-white hover:shadow-lg transition-shadow overflow-hidden`}>
              {/* 배경 장식 원 */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute right-8 bottom-8 w-16 h-16 rounded-full bg-white/10" />
              {/* 내용 */}
              <div className="relative z-10 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  {banner.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{banner.title}</h3>
                  <p className="text-sm text-white/80 mt-0.5">{banner.desc}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════
          섹션 5: 신상품 (✨ NEW)
          ═══════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles size={20} className="text-amber-500" />
            신상품
          </h2>
          <Link
            href="/products"
            className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-0.5 transition"
          >
            더보기 <ChevronRight size={14} />
          </Link>
        </div>
        {newProducts.length === 0 ? (
          <EmptySection message="신상품을 준비중입니다" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {newProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════
          섹션 6: 하단 혜택 안내 (Trust badges)
          무신사/쿠팡 하단에 항상 있는 그 "무료배송, 안전결제" 띠
          ═══════════════════════════════════════════════ */}
      <section className="border-t border-b py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <Truck size={22} />,       title: "무료배송",     desc: "전 상품 무료배송" },
            { icon: <Shield size={22} />,      title: "안전결제",     desc: "SSL 보안 결제" },
            { icon: <Clock size={22} />,       title: "빠른배송",     desc: "7~15일 배송" },
            { icon: <Headphones size={22} />,  title: "고객센터",     desc: "평일 09:00~18:00" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-500 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 빈 상태 컴포넌트 (상품 없을 때)
// ══════════════════════════════════════════════════════
function EmptySection({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl">
      <p className="text-3xl mb-2">🛍️</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
