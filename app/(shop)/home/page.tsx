// ============================================================
// 파일 위치: app/(shop)/home/page.tsx
// 역할: 쇼핑몰 메인 페이지 (서버 컴포넌트 - 데이터 fetch)
// ============================================================
// 🔑 이 파일은 서버에서 실행돼.
//    API로 상품/카테고리 데이터를 가져온 뒤
//    HomeClient(클라이언트 컴포넌트)에 넘겨주는 게 전부야.
// ============================================================

import { getProducts, getCategories, type Product, type Category } from "@/lib/api";
import HomeClient from "../HomeClient";

export default async function ShopMainPage() {
  // --- 서버에서 데이터 미리 가져오기 ---
  // 에러가 나도 빈 배열로 처리 (백엔드 안 켜져 있을 수도 있으니까)

  let popularProducts: Product[] = [];   // 인기 상품 (판매량 높은 순)
  let newProducts: Product[] = [];       // 신상품 (최근 등록 순)
  let categories: Category[] = [];       // 카테고리 목록

  try {
    // 인기 상품: 판매중(LISTED) 상품 중 앞에서 8개
    const popularResult = await getProducts({ status: "LISTED", size: 8 });
    popularProducts = popularResult.content;
  } catch { /* 백엔드 미실행 시 빈 배열 */ }

  try {
    // 신상품: 판매중(LISTED) 상품 중 2페이지(=최근 등록)에서 8개
    // TODO: 백엔드에 sort=createdAt,desc 파라미터 추가하면 더 정확해짐
    const newResult = await getProducts({ status: "LISTED", size: 8, page: 1 });
    newProducts = newResult.content;
    // 2페이지가 비어있으면 인기상품으로 대체 (상품 수가 적을 때)
    if (newProducts.length === 0) newProducts = popularProducts;
  } catch {
    newProducts = popularProducts; // fallback
  }

  try {
    categories = await getCategories();
  } catch { /* 빈 배열 */ }

  return (
    <HomeClient
      popularProducts={popularProducts}
      newProducts={newProducts}
      categories={categories}
    />
  );
}
