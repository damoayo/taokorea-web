// ============================================================
// 파일 위치: app/(shop)/HomeClient.tsx
// 역할: 구매대행 셀러용 메인 페이지
// ============================================================
// 🔑 디자인 원칙:
//   - 뼈대는 깔끔, 디테일로 멋 부리기
//   - 상품 사진이 채워지면 자연스럽게 화려해지니까 바탕은 절제
//   - 선, 폰트 크기 위계, 아이콘 색상 변화, 미묘한 그라디언트로 밀도감
//   - 원색 X → 인디고/슬레이트 계열 톤온톤
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
  Eye,
} from "lucide-react";

// ══════════════════════════════════════════════════════
// 히어로 슬라이드 — 미묘한 배경 + 아이콘 장식
// ══════════════════════════════════════════════════════
const HERO_SLIDES = [
  {
    id: 1,
    title: "타오바오 신규 소싱 상품",
    subtitle: "매일 업데이트되는 중국 트렌드 상품을 바로 확인하세요",
    cta: "소싱 상품 보기",
    href: "/products",
    // 좌측 악센트 색상 + 배경 그라디언트 (아주 연한 톤)
    accentColor: "from-indigo-500 to-blue-500",
    bgTint: "from-indigo-50/80 to-transparent dark:from-indigo-950/30 dark:to-transparent",
    icon: <Search size={32} className="text-indigo-300 dark:text-indigo-700" />,
  },
  {
    id: 2,
    title: "마진율 자동 계산",
    subtitle: "환율·배송비·수수료를 반영한 예상 마진을 즉시 확인",
    cta: "수익 분석 보기",
    href: "/admin/products",
    accentColor: "from-emerald-500 to-teal-500",
    bgTint: "from-emerald-50/80 to-transparent dark:from-emerald-950/30 dark:to-transparent",
    icon: <TrendingUp size={32} className="text-emerald-300 dark:text-emerald-700" />,
  },
  {
    id: 3,
    title: "AI 자동 번역 & 이미지 한글화",
    subtitle: "상품명·옵션·상세 설명을 한국어로 자동 변환",
    cta: "번역 상품 확인",
    href: "/admin/products",
    accentColor: "from-sky-500 to-cyan-500",
    bgTint: "from-sky-50/80 to-transparent dark:from-sky-950/30 dark:to-transparent",
    icon: <Languages size={32} className="text-sky-300 dark:text-sky-700" />,
  },
];

// ══════════════════════════════════════════════════════
// 카테고리 아이콘 매핑
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
// 상품 카드 — 마진율 + 번역 상태 + 호버 효과
// ══════════════════════════════════════════════════════
function ProductCard({ product, rank }: { product: Product; rank?: number }) {
  const estimatedCostKrw = product.originalPriceCny * 190;
  const marginRate = product.sellingPriceKrw > 0
    ? Math.round(((product.sellingPriceKrw - estimatedCostKrw) / product.sellingPriceKrw) * 100)
    : 0;

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="rounded-xl border border-gray-150 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 hover:shadow-lg hover:border-gray-250 dark:hover:border-gray-700 transition-all duration-300 h-full">
        {/* 이미지 */}
        <div className="aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden relative">
          {product.mainImageUrl ? (
            <img
              src={product.mainImageUrl}
              alt={product.titleKo ?? product.titleOriginal}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200 dark:text-gray-700 text-4xl">
              📦
            </div>
          )}

          {/* 호버 시 오버레이 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

          {/* 순위 뱃지 */}
          {rank !== undefined && (
            <div className={`absolute top-2 left-2 w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center shadow-sm ${
              rank <= 3
                ? "bg-gray-900 text-white"
                : "bg-white/90 text-gray-600 border border-gray-200"
            }`}>
              {rank}
            </div>
          )}

          {/* 번역 완료 표시 */}
          {product.titleKo && (
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-md text-[10px] font-medium text-indigo-500 flex items-center gap-0.5 shadow-sm">
              <Languages size={9} />
              KO
            </div>
          )}

          {/* 품절 */}
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-white/60 dark:bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">품절</span>
            </div>
          )}
        </div>

        {/* 텍스트 */}
        <div className="p-3 space-y-1.5">
          {product.categoryName && (
            <p className="text-[10px] text-gray-400 tracking-wide uppercase">{product.categoryName}</p>
          )}
          <p className="text-[13px] font-medium line-clamp-2 text-gray-800 dark:text-gray-200 leading-[1.4] min-h-[2.3rem]">
            {product.titleKo ?? product.titleOriginal}
          </p>

          {/* 가격 + 마진 */}
          <div className="pt-1 border-t border-gray-100 dark:border-gray-800 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                ₩{product.sellingPriceKrw?.toLocaleString()}
              </span>
              <span className="text-[11px] text-gray-400 tabular-nums">
                ¥{product.originalPriceCny}
              </span>
            </div>
            <div className="flex items-center justify-between">
              {marginRate > 0 && (
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums ${
                  marginRate >= 30 ? "text-emerald-500"
                  : marginRate >= 15 ? "text-amber-500"
                  : "text-gray-400"
                }`}>
                  <TrendingUp size={10} />
                  {marginRate}%
                </span>
              )}
              {product.salesVolume > 0 && (
                <span className="text-[10px] text-gray-400 tabular-nums">
                  {product.salesVolume.toLocaleString()}건 판매
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ══════════════════════════════════════════════════════
// 섹션 헤더 컴포넌트 — 일관된 스타일 + 얇은 구분선
// ══════════════════════════════════════════════════════
function SectionHeader({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        {/* 아이콘 앞에 미세한 수직 바 */}
        <div className="w-0.5 h-4 rounded-full bg-indigo-400" />
        <span className="text-gray-400">{icon}</span>
        <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-xs text-gray-400 hover:text-indigo-500 flex items-center gap-0.5 transition"
        >
          전체보기 <ChevronRight size={12} />
        </Link>
      )}
    </div>
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
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="space-y-12 -mt-8">

      {/* ═══════════════════════════════════════════════
          섹션 1: 히어로 슬라이더
          연한 배경 틴트 + 우측 장식 아이콘 + 좌측 악센트 라인
          ═══════════════════════════════════════════════ */}
      <section className="relative -mx-4 overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <div key={slide.id} className="w-full flex-shrink-0 px-4">
              <Link href={slide.href}>
                <div className={`relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 min-h-[170px] md:min-h-[210px] flex items-center hover:border-gray-200 dark:hover:border-gray-700 transition-colors`}>
                  {/* 배경 그라디언트 틴트 */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgTint}`} />
                  {/* 좌측 악센트 바 (그라디언트) */}
                  <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b ${slide.accentColor}`} />
                  {/* 우측 장식 아이콘 */}
                  <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 opacity-30">
                    {slide.icon}
                  </div>
                  {/* 텍스트 */}
                  <div className="relative z-10 pl-7 pr-4 py-8 md:py-10">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {slide.title}
                    </h2>
                    <p className="text-gray-500 mt-1.5 text-sm">
                      {slide.subtitle}
                    </p>
                    <span className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-indigo-600 dark:text-indigo-400 group/cta">
                      {slide.cta}
                      <ArrowRight size={14} className="group-hover/cta:translate-x-0.5 transition-transform" />
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
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-sm items-center justify-center hover:bg-white transition z-10"
        >
          <ChevronLeft size={16} className="text-gray-500" />
        </button>
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-sm items-center justify-center hover:bg-white transition z-10"
        >
          <ChevronRight size={16} className="text-gray-500" />
        </button>

        {/* 인디케이터 */}
        <div className="flex justify-center gap-1.5 mt-4">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? "bg-indigo-500 w-5 h-1.5"
                  : "bg-gray-200 dark:bg-gray-700 w-1.5 h-1.5 hover:bg-gray-300"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          섹션 2: 핵심 기능 — 카드에 미묘한 호버 + 아이콘 배경
          ═══════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: <Search size={18} />,
            title: "상품 소싱",
            desc: "타오바오 상품 자동 수집",
            iconBg: "bg-indigo-50 text-indigo-500 dark:bg-indigo-950 dark:text-indigo-400",
            hoverBorder: "hover:border-indigo-200 dark:hover:border-indigo-800",
          },
          {
            icon: <Languages size={18} />,
            title: "AI 번역",
            desc: "상품명·설명 자동 한글화",
            iconBg: "bg-sky-50 text-sky-500 dark:bg-sky-950 dark:text-sky-400",
            hoverBorder: "hover:border-sky-200 dark:hover:border-sky-800",
          },
          {
            icon: <ImagePlus size={18} />,
            title: "이미지 번역",
            desc: "중국어 이미지 한글 변환",
            iconBg: "bg-violet-50 text-violet-500 dark:bg-violet-950 dark:text-violet-400",
            hoverBorder: "hover:border-violet-200 dark:hover:border-violet-800",
          },
          {
            icon: <Boxes size={18} />,
            title: "다채널 등록",
            desc: "쿠팡·스마트스토어·11번가",
            iconBg: "bg-emerald-50 text-emerald-500 dark:bg-emerald-950 dark:text-emerald-400",
            hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-800",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 ${item.hoverBorder} transition-colors cursor-default`}
          >
            <div className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center mb-3`}>
              {item.icon}
            </div>
            <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
              {item.title}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════
          섹션 3: 카테고리 바로가기
          ═══════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section>
          <SectionHeader
            icon={<Boxes size={15} />}
            title="카테고리별 소싱"
            href="/products"
          />
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-1.5 group py-2"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-xl group-hover:border-indigo-200 dark:group-hover:border-indigo-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:scale-105 transition-all duration-200">
                  {getCategoryIcon(cat.nameKo, cat.icon)}
                </div>
                <span className="text-[11px] text-gray-500 text-center truncate w-full group-hover:text-indigo-500 transition">
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
        <SectionHeader
          icon={<BarChart3 size={15} />}
          title="인기 소싱 상품"
          href="/products"
        />
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
          섹션 5: 셀러 도구 배너 — 얇은 테두리 + 미세 호버
          ═══════════════════════════════════════════════ */}
      <section className="grid sm:grid-cols-2 gap-3">
        <Link href="/admin/products">
          <div className="group rounded-xl border border-gray-150 dark:border-gray-800 p-5 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all bg-white dark:bg-gray-900">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Zap size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
                  원클릭 상품 등록
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  번역된 상품을 쿠팡·스마트스토어에 바로 등록
                </p>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
            </div>
          </div>
        </Link>
        <Link href="/admin/settings/filter">
          <div className="group rounded-xl border border-gray-150 dark:border-gray-800 p-5 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all bg-white dark:bg-gray-900">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <TrendingUp size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
                  마진 필터 설정
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  최소 마진율·판매가 기준 설정하고 자동 필터링
                </p>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
            </div>
          </div>
        </Link>
      </section>

      {/* ═══════════════════════════════════════════════
          섹션 6: 신규 입고
          ═══════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={<Clock size={15} />}
          title="신규 입고"
          href="/products"
        />
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
          섹션 7: 하단 서비스 특징 — 얇은 상단 선 + 아이콘 그라디언트
          ═══════════════════════════════════════════════ */}
      <section className="relative pt-10">
        {/* 구분선 대신 미묘한 그라디언트 라인 */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <Globe size={18} />,       title: "타오바오 직연동",  desc: "실시간 상품 동기화" },
            { icon: <Languages size={18} />,   title: "AI 자동 번역",    desc: "Gemini 기반 정확한 번역" },
            { icon: <Package size={18} />,     title: "다채널 관리",      desc: "한 곳에서 일괄 관리" },
            { icon: <ShieldCheck size={18} />, title: "안전한 데이터",    desc: "암호화·보안 처리" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300 tracking-tight">{item.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
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
    <div className="text-center py-14 text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
      <p className="text-2xl mb-1.5 opacity-50">📦</p>
      <p className="text-xs">{message}</p>
    </div>
  );
}
