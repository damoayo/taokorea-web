"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DataGrid, {
  Column,
  Paging,
  Pager,
  SearchPanel,
  FilterRow,
  HeaderFilter,
  Sorting,
  Export,
} from "devextreme-react/data-grid";
import { getProducts, createShopListing, Product, PLATFORM_META } from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  IMPORTED:  { label: "가져옴",   cls: "bg-slate-100 text-slate-700 border-slate-300" },
  APPROVED:  { label: "승인됨",   cls: "bg-blue-100 text-blue-700 border-blue-300" },
  LISTED:    { label: "판매중",   cls: "bg-green-100 text-green-700 border-green-300" },
  SUSPENDED: { label: "일시중지", cls: "bg-amber-100 text-amber-700 border-amber-300" },
  SOLD_OUT:  { label: "품절",     cls: "bg-red-100 text-red-700 border-red-300" },
  HIDDEN:    { label: "숨김",     cls: "bg-gray-100 text-gray-500 border-gray-300" },
  REJECTED:  { label: "거절됨",   cls: "bg-rose-100 text-rose-700 border-rose-300" },
};

const PLATFORMS = Object.entries(PLATFORM_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  // ── 다이얼로그 상태 ────────────────────────────────
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [dialogProduct, setDialogProduct]   = useState<Product | null>(null);
  const [dialogPlatform, setDialogPlatform] = useState("");
  const [dialogPrice, setDialogPrice]       = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [dialogError, setDialogError]       = useState("");
  const [toast, setToast]                   = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    getProducts({ size: 200 })
      .then((page) => setProducts(page.content))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // 토스트 자동 닫기
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── 다이얼로그 핸들러 ──────────────────────────────
  function openListingDialog(product: Product) {
    setDialogProduct(product);
    setDialogPlatform("");
    setDialogPrice(String(product.sellingPriceKrw ?? ""));
    setDialogError("");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setDialogProduct(null);
  }

  async function submitListing() {
    if (!dialogProduct) return;
    if (!dialogPlatform) { setDialogError("플랫폼을 선택해주세요."); return; }
    const price = Number(dialogPrice);
    if (!price || price < 100) { setDialogError("유효한 판매가를 입력해주세요."); return; }

    setSubmitting(true);
    setDialogError("");
    try {
      await createShopListing({
        productId:     dialogProduct.id,
        platform:      dialogPlatform,
        listedPriceKrw: price,
      });
      setToast({ type: "success", msg: "쇼핑몰 등록이 완료되었습니다!" });
      closeDialog();
      // 목록 갱신 (상품 상태 LISTED로 변경됨)
      const page = await getProducts({ size: 200 });
      setProducts(page.content);
    } catch (e) {
      setDialogError(e instanceof Error ? e.message : "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── 셀 렌더러 ─────────────────────────────────────
  function statusCell(data: { value: string }) {
    const m = STATUS_META[data.value] ?? { label: data.value, cls: "bg-gray-100 text-gray-600 border-gray-300" };
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${m.cls}`}>
        {m.label}
      </span>
    );
  }

  function priceCell(data: { value: number }) {
    return <span>{data.value?.toLocaleString()}원</span>;
  }

  function titleCell(data: { value: string; data: Product }) {
    const imgUrl = data.data.mainImageUrl;
    return (
      <Link
        href={`/admin/products/${data.data.id}`}
        className="flex items-center gap-2 min-w-0 group"
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="w-9 h-9 rounded object-cover shrink-0 border border-gray-100"
          />
        ) : (
          <div className="w-9 h-9 rounded bg-gray-100 shrink-0 flex items-center justify-center text-gray-300 text-xs">
            📦
          </div>
        )}
        <span className="font-medium text-sm truncate group-hover:text-indigo-600 transition-colors">
          {data.value || "—"}
        </span>
      </Link>
    );
  }

  function actionCell(data: { data: Product }) {
    const product = data.data;
    if (product.status !== "APPROVED") return null;
    return (
      <button
        onClick={() => openListingDialog(product)}
        className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 border border-green-300 rounded-full hover:bg-green-200 transition-colors whitespace-nowrap"
      >
        🏪 쇼핑몰 등록
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* 토스트 */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium",
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          )}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">상품 관리</h2>
          <p className="text-sm text-gray-500 mt-1">전체 {products.length}개 상품</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
        <DataGrid
          dataSource={products}
          showBorders={false}
          rowAlternationEnabled
          columnAutoWidth
          wordWrapEnabled={false}
          loadPanel={{ enabled: loading }}
          noDataText="상품이 없습니다"
        >
          <SearchPanel visible placeholder="상품명 검색..." />
          <FilterRow visible />
          <HeaderFilter visible />
          <Sorting mode="multiple" />
          <Export enabled />

          <Column dataField="id" caption="ID" width={70} />
          <Column dataField="title" caption="상품명" cellRender={titleCell} minWidth={200} />
          <Column dataField="status"          caption="상태"         cellRender={statusCell} width={90} />
          <Column dataField="sellingPriceKrw" caption="판매가 (KRW)" cellRender={priceCell}  width={130} />
          <Column dataField="originalPriceCny" caption="원가 (CNY)"  width={110} />
          <Column dataField="stockQuantity"    caption="재고"         width={80} />
          <Column dataField="salesVolume"      caption="판매량"       width={80} />
          <Column dataField="categoryName"     caption="카테고리"     width={120} />
          <Column dataField="sellerNick"       caption="셀러"         width={120} />
          <Column
            dataField="syncedAt"
            caption="동기화"
            dataType="datetime"
            format="yyyy-MM-dd HH:mm"
            width={140}
          />
          <Column
            caption="쇼핑몰 등록"
            cellRender={actionCell}
            width={120}
            allowSorting={false}
            allowFiltering={false}
          />

          <Paging defaultPageSize={20} />
          <Pager showPageSizeSelector allowedPageSizes={[20, 50, 100]} showInfo />
        </DataGrid>
      </div>

      {/* 쇼핑몰 등록 다이얼로그 */}
      {dialogOpen && dialogProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) closeDialog(); }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-[420px] max-w-[95vw]">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              🏪 쇼핑몰 등록
            </h3>

            {/* 상품 정보 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-3">
                {dialogProduct.mainImageUrl && (
                  <img
                    src={dialogProduct.mainImageUrl}
                    alt=""
                    className="w-10 h-10 rounded object-cover border border-gray-200"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                    {dialogProduct.title || dialogProduct.titleKo || "—"}
                  </p>
                  <p className="text-xs text-indigo-600 mt-0.5">
                    현재가: {dialogProduct.sellingPriceKrw?.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>

            {/* 플랫폼 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                플랫폼 선택 <span className="text-red-500">*</span>
              </label>
              <select
                value={dialogPlatform}
                onChange={(e) => setDialogPlatform(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">-- 플랫폼 선택 --</option>
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* 판매가 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                판매가 (원) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={dialogPrice}
                onChange={(e) => setDialogPrice(e.target.value)}
                min={100}
                step={100}
                placeholder="예: 29900"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* 에러 메시지 */}
            {dialogError && (
              <p className="text-xs text-red-600 mb-3">{dialogError}</p>
            )}

            {/* 버튼 */}
            <div className="flex justify-end gap-2">
              <button
                onClick={closeDialog}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={submitListing}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
