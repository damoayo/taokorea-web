// ============================================================
// 파일 위치: app/(shop)/products/[id]/page.tsx
// 역할: 쇼핑몰 상품 상세 페이지 (고객이 보는 화면)
// ============================================================
// 🔑 주요 기능:
//   1. 이미지 갤러리 (메인 + 서브 이미지 썸네일 클릭 전환)
//   2. 옵션(변형) 선택 UI
//   3. 수량 조절 (+/- 버튼)
//   4. 상품 설명 탭 (한국어 / 원문)
//   5. 장바구니 / 바로구매 버튼
// ============================================================

import { getProduct } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductDetailClient from "./ProductDetailClient";

// --- 서버 컴포넌트 (데이터 fetch 담당) ---
// Next.js에서 페이지 컴포넌트는 서버에서 실행돼.
// DB에서 상품 데이터를 가져온 뒤, 클라이언트 컴포넌트에 넘겨주는 역할이야.
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 백엔드 API에서 상품 상세 정보를 가져옴
  let product;
  try {
    product = await getProduct(Number(id));
  } catch {
    // 상품이 없거나 API 에러면 404 페이지로 보냄
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* 🔙 목록으로 돌아가기 링크 */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <ArrowLeft size={16} />
        상품 목록으로
      </Link>

      {/* 🎯 여기서 클라이언트 컴포넌트로 넘김
          (이미지 전환, 옵션 선택, 수량 변경은 브라우저에서 처리해야 하니까) */}
      <ProductDetailClient product={product} />
    </div>
  );
}
