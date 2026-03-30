// ============================================================
// 파일 위치: app/(shop)/products/[id]/ProductDetailClient.tsx
// 역할: 상품 상세의 인터랙티브(interactive) 부분 담당
// ============================================================
// "use client" → 이 파일은 브라우저에서 실행돼.
// useState, onClick 같은 거 쓸 수 있어.
// ============================================================

"use client";

import { useState, useMemo } from "react";
import type { Product, ProductVariant } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Package,
  Truck,
  Minus,
  Plus,
  Heart,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";

// ── 상태 라벨 매핑 ──────────────────────────────────
// 백엔드에서 영문 상태값이 오면 → 한글 라벨 + 색상으로 변환
const STATUS_LABEL: Record<string, { label: string; class: string }> = {
  LISTED:   { label: "판매중", class: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  IMPORTED: { label: "준비중", class: "bg-blue-50 text-blue-700 border border-blue-200" },
  SOLD_OUT: { label: "품절",   class: "bg-red-50 text-red-700 border border-red-200" },
  HIDDEN:   { label: "비공개", class: "bg-gray-100 text-gray-600 border border-gray-200" },
};

// ── 가격 포맷 함수 ──────────────────────────────────
// 12345 → "12,345" 이렇게 쉼표 찍어줌
function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}

// ══════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════
export default function ProductDetailClient({
  product,
}: {
  product: Product;
}) {
  // ── 상태(state) 관리 ──────────────────────────────
  // 현재 보고 있는 이미지 인덱스 (0부터 시작)
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  // 선택한 옵션(변형)의 ID
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  // 구매 수량
  const [quantity, setQuantity] = useState(1);
  // 찜(좋아요) 눌렀는지
  const [isWished, setIsWished] = useState(false);
  // 상품 설명 펼침/접힘
  const [descExpanded, setDescExpanded] = useState(false);
  // 원문 보기 토글
  const [showOriginal, setShowOriginal] = useState(false);

  // ── 이미지 목록 만들기 ────────────────────────────
  // 메인 이미지 + 서브 이미지(images 배열)를 합쳐서 하나의 배열로 만듦
  const allImages = useMemo(() => {
    const imgs: string[] = [];
    // 1) 메인 이미지가 있으면 맨 앞에
    if (product.mainImageUrl) imgs.push(product.mainImageUrl);
    // 2) 추가 이미지들 (images 배열)
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        // 메인 이미지와 중복되면 스킵
        if (img.imageUrl !== product.mainImageUrl) {
          imgs.push(img.imageUrl);
        }
      });
    }
    return imgs;
  }, [product]);

  // ── 파생 값들 ─────────────────────────────────────
  const status = STATUS_LABEL[product.status] ?? { label: product.status, class: "" };
  const isSoldOut = product.status === "SOLD_OUT" || product.stockQuantity === 0;
  // 선택된 옵션 객체
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  // 최종 가격 (옵션 선택 시 옵션 가격 반영)
  const displayPrice = selectedVariant?.priceCny
    ? product.sellingPriceKrw // TODO: 옵션별 가격 계산 로직 추가 가능
    : product.sellingPriceKrw;

  // ── 수량 조절 ─────────────────────────────────────
  const handleQuantity = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      // 최소 1개, 최대 재고 수량까지
      if (next < 1) return 1;
      if (next > product.stockQuantity) return product.stockQuantity;
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════
          상단: 이미지 갤러리 + 상품 정보 (2컬럼)
          ═══════════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
        {/* ─── 왼쪽: 이미지 갤러리 ─── */}
        <div className="space-y-3">
          {/* 메인 이미지 (크게 보이는 부분) */}
          <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden relative group">
            {allImages.length > 0 ? (
              <img
                src={allImages[selectedImageIdx]}
                alt={product.titleKo ?? product.titleOriginal}
                className="w-full h-full object-cover transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
                📦
              </div>
            )}

            {/* 이미지 인디케이터 (이미지가 2장 이상일 때만 표시) */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === selectedImageIdx
                        ? "bg-white w-5"   // 현재 선택된 이미지 → 길쭉한 흰색
                        : "bg-white/50"     // 나머지 → 반투명
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 썸네일 목록 (이미지가 2장 이상일 때만 표시) */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === selectedImageIdx
                      ? "border-indigo-500 ring-2 ring-indigo-200"  // 선택됨
                      : "border-gray-200 hover:border-gray-400"     // 미선택
                  }`}
                >
                  <img
                    src={url}
                    alt={`상품 이미지 ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── 오른쪽: 상품 정보 ─── */}
        <div className="space-y-5">
          {/* 상태 뱃지 + 제목 */}
          <div>
            <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full mb-3 ${status.class}`}>
              {status.label}
            </span>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
              {product.titleKo ?? product.titleOriginal}
            </h1>
            {/* 한국어 번역이 있으면 원문도 작게 표시 */}
            {product.titleKo && product.titleOriginal && (
              <p className="text-sm text-gray-400 mt-1.5 line-clamp-1">
                {product.titleOriginal}
              </p>
            )}
          </div>

          {/* 판매/리뷰 정보 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {product.salesVolume > 0 && (
              <span className="flex items-center gap-1">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                판매 {product.salesVolume.toLocaleString()}개
              </span>
            )}
            {product.categoryName && (
              <span className="text-gray-400">
                {product.categoryName}
              </span>
            )}
          </div>

          <Separator />

          {/* ── 가격 영역 ── */}
          <div>
            <p className="text-sm text-gray-500 mb-1">판매가</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-indigo-600">
                {formatPrice(displayPrice)}
                <span className="text-lg ml-0.5">원</span>
              </p>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              원가: ¥{product.originalPriceCny}
            </p>
          </div>

          <Separator />

          {/* ── 옵션(변형) 선택 ── */}
          {/* variants 배열이 있고 1개 이상이면 옵션 선택 UI 표시 */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                옵션 선택
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(
                      // 이미 선택된 거 다시 누르면 해제
                      selectedVariantId === variant.id ? null : variant.id
                    )}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                      selectedVariantId === variant.id
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "border-gray-200 hover:border-gray-400 text-gray-700 dark:text-gray-300 dark:border-gray-600"
                    } ${
                      // 재고 없는 옵션은 비활성화
                      variant.stock === 0 ? "opacity-40 line-through cursor-not-allowed" : ""
                    }`}
                    disabled={variant.stock === 0}
                  >
                    {/* 옵션 이름 표시 (이미지가 있으면 작은 썸네일도) */}
                    <span className="flex items-center gap-2">
                      {variant.imageUrl && (
                        <img
                          src={variant.imageUrl}
                          alt={variant.optionName ?? ""}
                          className="w-6 h-6 rounded object-cover"
                        />
                      )}
                      {variant.optionName ?? `옵션 ${variant.id}`}
                    </span>
                  </button>
                ))}
              </div>
              {/* 선택된 옵션 정보 */}
              {selectedVariant && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-indigo-600">
                  <Check size={14} />
                  <span>
                    {selectedVariant.optionName}
                    {selectedVariant.stock !== undefined && (
                      <span className="text-gray-400 ml-1">(재고 {selectedVariant.stock}개)</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── 수량 선택 ── */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              수량
            </p>
            <div className="flex items-center gap-1">
              {/* 마이너스 버튼 */}
              <button
                onClick={() => handleQuantity(-1)}
                disabled={quantity <= 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition dark:border-gray-600 dark:hover:bg-gray-800"
              >
                <Minus size={16} />
              </button>
              {/* 수량 표시 */}
              <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                {quantity}
              </span>
              {/* 플러스 버튼 */}
              <button
                onClick={() => handleQuantity(1)}
                disabled={quantity >= product.stockQuantity}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition dark:border-gray-600 dark:hover:bg-gray-800"
              >
                <Plus size={16} />
              </button>
              <span className="text-sm text-gray-400 ml-2">
                (재고 {product.stockQuantity}개)
              </span>
            </div>
          </div>

          {/* ── 배송 / 부가 정보 ── */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
              <Truck size={16} className="text-indigo-500" />
              <span>배송비 무료 · 해외직구 (7~15일 소요)</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
              <Package size={16} className="text-indigo-500" />
              <span>안전포장 · 통관대행 포함</span>
            </div>
            {product.sellerNick && (
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <span className="w-4 h-4 flex items-center justify-center text-xs">🏪</span>
                <span>판매자: {product.sellerNick}</span>
              </div>
            )}
          </div>

          {/* ── 구매 버튼 영역 ── */}
          <div className="flex gap-2">
            {/* 찜하기 */}
            <button
              onClick={() => setIsWished(!isWished)}
              className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${
                isWished
                  ? "border-red-300 bg-red-50 text-red-500"
                  : "border-gray-200 hover:border-gray-400 text-gray-400 dark:border-gray-600"
              }`}
            >
              <Heart size={20} fill={isWished ? "currentColor" : "none"} />
            </button>

            {/* 장바구니 */}
            <button
              disabled={isSoldOut}
              className="flex-1 h-12 rounded-xl text-sm font-semibold border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition disabled:opacity-40 disabled:cursor-not-allowed dark:hover:bg-indigo-950"
            >
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart size={18} />
                장바구니
              </span>
            </button>

            {/* 바로구매 */}
            <button
              disabled={isSoldOut}
              className="flex-1 h-12 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSoldOut ? "품절" : `바로구매 · ${formatPrice(displayPrice * quantity)}원`}
            </button>
          </div>

          {/* 총 금액 (수량 2개 이상일 때만) */}
          {quantity > 1 && !isSoldOut && (
            <p className="text-right text-sm text-gray-500">
              총 금액: <span className="font-bold text-indigo-600">{formatPrice(displayPrice * quantity)}원</span>
              <span className="text-gray-400"> ({quantity}개)</span>
            </p>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          하단: 상품 설명 영역
          ═══════════════════════════════════════════════ */}
      <Separator />

      <div>
        {/* 탭 헤더 */}
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            상품 상세
          </h2>
          {/* 한국어/원문 토글 (원문이 있을 때만) */}
          {product.description && product.descriptionKo && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="text-sm text-indigo-500 hover:text-indigo-700 transition"
            >
              {showOriginal ? "🇰🇷 한국어로 보기" : "🇨🇳 원문 보기"}
            </button>
          )}
        </div>

        {/* 설명 내용 */}
        <div className="relative">
          <div
            className={`prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap ${
              // 접힘 상태면 최대 높이 제한 + 그라디언트 오버레이
              !descExpanded ? "max-h-80 overflow-hidden" : ""
            }`}
          >
            {/* 한국어 번역이 있으면 우선 표시, 원문 토글 시 원문 표시 */}
            {showOriginal
              ? (product.description ?? "상품 설명이 없습니다.")
              : (product.descriptionKo ?? product.description ?? "상품 설명이 없습니다.")
            }
          </div>

          {/* 더보기/접기 버튼 + 그라디언트 */}
          {(product.description || product.descriptionKo) && (
            <>
              {/* 접힘 상태일 때 하단 그라디언트 */}
              {!descExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none" />
              )}
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="relative z-10 w-full mt-2 py-2.5 text-sm text-indigo-500 hover:text-indigo-700 font-medium flex items-center justify-center gap-1 transition"
              >
                {descExpanded ? (
                  <>접기 <ChevronUp size={16} /></>
                ) : (
                  <>더보기 <ChevronDown size={16} /></>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
