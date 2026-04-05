"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NumberBox from "devextreme-react/number-box";
import Toast from "devextreme-react/toast";
import { getFilterSettings, updateFilterSettings, applyProfitFilter, FilterSettings, ApplyFilterResult } from "@/lib/api";

export default function FilterSettingsPage() {
  const [settings, setSettings] = useState<FilterSettings>({
    minMarginRate: 20,
    minSalesVolume: 50,
    minSellingPriceKrw: 5000,
    maxOriginalPriceCny: 500,
  });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [applying, setApplying] = useState(false);
  const [result,   setResult]   = useState<ApplyFilterResult | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" | "info" }>(
    { visible: false, message: "", type: "success" }
  );

  useEffect(() => {
    getFilterSettings()
      .then(setSettings)
      .catch(() => showToast("설정 불러오기 실패", "error"))
      .finally(() => setLoading(false));
  }, []);

  function showToast(message: string, type: "success" | "error") {
    setToast({ visible: true, message, type });
  }

  function patch<K extends keyof FilterSettings>(key: K, value: FilterSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateFilterSettings(settings);
      setSettings(updated);
      showToast("설정이 저장되었습니다.", "success");
    } catch {
      showToast("저장 실패", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleApplyFilter() {
    setApplying(true);
    setResult(null);
    try {
      const r = await applyProfitFilter();
      setResult(r);
      showToast(`필터 완료: 승인 ${r.approved}개 / 거절 ${r.rejected}개`, "success");
    } catch {
      showToast("필터 적용 실패", "error");
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">로딩 중...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">수익성 커트라인 설정</h2>
        <p className="text-sm text-gray-500 mt-1">IMPORTED 상품을 자동으로 APPROVED / REJECTED로 분류합니다.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">필터 기준값</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">최소 마진율 (%)</label>
            <NumberBox
              value={Number(settings.minMarginRate)}
              onValueChanged={(e) => patch("minMarginRate", e.value ?? 0)}
              stylingMode="outlined"
              min={0}
              max={100}
              format="#0.##"
              step={1}
            />
            <p className="text-xs text-gray-400 mt-1">
              마진율 = (판매가 - 원가×환율 - 배송비) / 판매가 × 100
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">최소 판매량 (개)</label>
            <NumberBox
              value={Number(settings.minSalesVolume)}
              onValueChanged={(e) => patch("minSalesVolume", e.value ?? 0)}
              stylingMode="outlined"
              min={0}
              format="#,##0"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">최소 판매가 (KRW)</label>
            <NumberBox
              value={Number(settings.minSellingPriceKrw)}
              onValueChanged={(e) => patch("minSellingPriceKrw", e.value ?? 0)}
              stylingMode="outlined"
              min={0}
              format="#,##0"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">최대 원가 (CNY)</label>
            <NumberBox
              value={Number(settings.maxOriginalPriceCny)}
              onValueChanged={(e) => patch("maxOriginalPriceCny", e.value ?? 0)}
              stylingMode="outlined"
              min={0}
              format="#,##0.##"
            />
          </div>

          <div className="flex gap-3 pt-2 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {saving ? "저장 중..." : "설정 저장"}
            </button>
            <button
              onClick={handleApplyFilter}
              disabled={applying}
              className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {applying ? "적용 중..." : "지금 필터 적용"}
            </button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">마지막 필터 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                <p className="text-2xl font-bold text-blue-600">{result.approved}</p>
                <p className="text-xs text-gray-500 mt-1">승인됨</p>
              </div>
              <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 p-3">
                <p className="text-2xl font-bold text-rose-600">{result.rejected}</p>
                <p className="text-xs text-gray-500 mt-1">거절됨</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                <p className="text-2xl font-bold text-gray-500">{result.skipped}</p>
                <p className="text-xs text-gray-500 mt-1">스킵</p>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
                <p className="text-2xl font-bold text-amber-600">{result.errors}</p>
                <p className="text-xs text-gray-500 mt-1">오류</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        displayTime={2500}
        onHiding={() => setToast((t) => ({ ...t, visible: false }))}
        position="bottom center"
      />
    </div>
  );
}
