"use client";

import { useCallback, useEffect, useState } from "react";
import DataGrid, {
  Column,
  Paging,
  Pager,
  SearchPanel,
  Sorting,
} from "devextreme-react/data-grid";
import {
  ShopListing,
  PlatformStats,
  getShopListings,
  getShopListingStats,
  pauseShopListing,
  resumeShopListing,
  removeShopListing,
  PLATFORM_META,
  LISTING_STATUS_META,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const PLATFORM_TABS = [
  { value: "",            label: "전체" },
  { value: "SMARTSTORE", label: "스마트스토어" },
  { value: "COUPANG",    label: "쿠팡" },
  { value: "ELEVEN_ST",  label: "11번가" },
  { value: "GMARKET",    label: "G마켓" },
];

const STATUS_TABS = [
  { value: "",       label: "전체 상태" },
  { value: "ACTIVE", label: "판매중" },
  { value: "PAUSED", label: "일시중지" },
];

export default function ShopListingsPage() {
  const [listings, setListings]       = useState<ShopListing[]>([]);
  const [stats, setStats]             = useState<PlatformStats[]>([]);
  const [loading, setLoading]         = useState(true);
  const [platformFilter, setPlatform] = useState("");
  const [statusFilter, setStatus]     = useState("");
  const [toast, setToast]             = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, statsData] = await Promise.all([
        getShopListings({
          platform: platformFilter || undefined,
          status:   statusFilter   || undefined,
        }),
        getShopListingStats(),
      ]);
      setListings(data);
      setStats(statsData);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [platformFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // 토스트 자동 닫기
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── 액션 핸들러 ─────────────────────────────────────
  async function doAction(
    id: number,
    action: "pause" | "resume" | "remove"
  ) {
    try {
      const fn = action === "pause"  ? pauseShopListing
               : action === "resume" ? resumeShopListing
               :                       removeShopListing;
      await fn(id);
      const msgs = { pause: "일시중지되었습니다.", resume: "재개되었습니다.", remove: "삭제되었습니다." };
      setToast({ type: "success", msg: msgs[action] });
      await load();
    } catch (e) {
      setToast({ type: "error", msg: e instanceof Error ? e.message : "오류가 발생했습니다." });
    }
  }

  // ── 셀 렌더러 ────────────────────────────────────────
  function platformCell(data: { value: string }) {
    const m = PLATFORM_META[data.value] ?? { label: data.value, cls: "bg-gray-100 text-gray-600 border-gray-300" };
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${m.cls}`}>
        {m.label}
      </span>
    );
  }

  function statusCell(data: { value: string }) {
    const m = LISTING_STATUS_META[data.value] ?? { label: data.value, cls: "bg-gray-100 text-gray-600 border-gray-300" };
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${m.cls}`}>
        {m.label}
      </span>
    );
  }

  function priceCell(data: { value: number }) {
    return <span className="font-medium">{data.value?.toLocaleString()}원</span>;
  }

  function titleCell(data: { data: ShopListing }) {
    const sl = data.data;
    return (
      <div className="flex items-center gap-2 min-w-0">
        {sl.productMainImage ? (
          <img
            src={sl.productMainImage}
            alt=""
            className="w-9 h-9 rounded object-cover shrink-0 border border-gray-100"
          />
        ) : (
          <div className="w-9 h-9 rounded bg-gray-100 shrink-0 flex items-center justify-center text-gray-300 text-xs">
            📦
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{sl.productTitle}</p>
          <p className="text-xs text-gray-400">상품 ID: {sl.productId}</p>
        </div>
      </div>
    );
  }

  function actionCell(data: { data: ShopListing }) {
    const sl = data.data;
    return (
      <div className="flex items-center gap-1.5">
        {sl.status === "ACTIVE" && (
          <button
            onClick={() => doAction(sl.id, "pause")}
            className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 border border-amber-300 rounded-full hover:bg-amber-200 transition-colors"
          >
            ⏸ 일시중지
          </button>
        )}
        {sl.status === "PAUSED" && (
          <button
            onClick={() => doAction(sl.id, "resume")}
            className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 border border-green-300 rounded-full hover:bg-green-200 transition-colors"
          >
            ▶ 재개
          </button>
        )}
        {sl.status !== "REMOVED" && (
          <button
            onClick={() => {
              if (confirm("정말 삭제하시겠습니까?")) doAction(sl.id, "remove");
            }}
            className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 border border-red-300 rounded-full hover:bg-red-200 transition-colors"
          >
            🗑 삭제
          </button>
        )}
      </div>
    );
  }

  // ── 통계 카드 ────────────────────────────────────────
  function StatCard({ platform }: { platform: string }) {
    const s = stats.find((x) => x.platform === platform);
    const m = PLATFORM_META[platform];
    if (!m) return null;
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 space-y-2">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{m.label}</p>
        <div className="flex gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{s?.total ?? 0}</p>
            <p className="text-[10px] text-gray-400">전체</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-600">{s?.active ?? 0}</p>
            <p className="text-[10px] text-gray-400">판매중</p>
          </div>
          <div>
            <p className="text-xl font-bold text-amber-500">{s?.paused ?? 0}</p>
            <p className="text-[10px] text-gray-400">중지</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 토스트 */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium",
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          )}
        >
          {toast.msg}
        </div>
      )}

      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">등록 상품 관리</h2>
        <p className="text-sm text-gray-500 mt-1">국내 쇼핑몰 등록 현황</p>
      </div>

      {/* 플랫폼 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.keys(PLATFORM_META).map((p) => (
          <StatCard key={p} platform={p} />
        ))}
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* 플랫폼 탭 */}
        <div className="flex bg-white dark:bg-gray-800 border rounded-lg overflow-hidden">
          {PLATFORM_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setPlatform(tab.value)}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors border-r last:border-r-0",
                platformFilter === tab.value
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 상태 탭 */}
        <div className="flex bg-white dark:bg-gray-800 border rounded-lg overflow-hidden">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors border-r last:border-r-0",
                statusFilter === tab.value
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DataGrid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
        <DataGrid
          dataSource={listings}
          showBorders={false}
          rowAlternationEnabled
          columnAutoWidth
          wordWrapEnabled={false}
          loadPanel={{ enabled: loading }}
          noDataText="등록된 상품이 없습니다"
        >
          <SearchPanel visible placeholder="상품명 검색..." />
          <Sorting mode="multiple" />

          <Column
            caption="상품명"
            cellRender={titleCell}
            minWidth={220}
            allowSorting={false}
          />
          <Column
            dataField="platform"
            caption="플랫폼"
            cellRender={platformCell}
            width={130}
          />
          <Column
            dataField="listedPriceKrw"
            caption="등록가"
            cellRender={priceCell}
            width={120}
            dataType="number"
          />
          <Column
            dataField="status"
            caption="상태"
            cellRender={statusCell}
            width={100}
          />
          <Column
            dataField="listedAt"
            caption="등록일"
            dataType="datetime"
            format="yyyy-MM-dd HH:mm"
            width={140}
          />
          <Column
            caption="액션"
            cellRender={actionCell}
            width={180}
            allowSorting={false}
          />

          <Paging defaultPageSize={20} />
          <Pager showPageSizeSelector allowedPageSizes={[20, 50, 100]} showInfo />
        </DataGrid>
      </div>
    </div>
  );
}
