"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProduct, updateProduct, Product, ProductImage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextBox from "devextreme-react/text-box";
import NumberBox from "devextreme-react/number-box";
import SelectBox from "devextreme-react/select-box";
import TextArea from "devextreme-react/text-area";
import Toast from "devextreme-react/toast";
import DataGrid, { Column } from "devextreme-react/data-grid";
import ProductImageGallery from "@/components/admin/product-image-gallery";

const STATUS_OPTIONS = [
  { value: "IMPORTED",  label: "가져옴" },
  { value: "APPROVED",  label: "승인됨" },
  { value: "LISTED",    label: "판매중" },
  { value: "SUSPENDED", label: "일시중지" },
  { value: "SOLD_OUT",  label: "품절" },
  { value: "HIDDEN",    label: "숨김" },
];

interface FormState {
  titleKo: string;
  sellingPriceKrw: number;
  status: string;
  mainImageUrl: string;
  descriptionKo: string;
}

export default function ProductEditPage() {
  const params = useParams();
  const id     = Number(params.id);

  const [product,  setProduct]  = useState<Product | null>(null);
  const [images,   setImages]   = useState<ProductImage[]>([]);
  const [form,     setForm]     = useState<FormState>({
    titleKo: "", sellingPriceKrw: 0, status: "IMPORTED", mainImageUrl: "", descriptionKo: "",
  });
  const [toast,  setToast]  = useState<{ visible: boolean; message: string; type: "success" | "error" | "info" }>(
    { visible: false, message: "", type: "success" }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProduct(id).then((p) => {
      setProduct(p);
      setImages(p.images ?? []);
      setForm({
        titleKo:         p.titleKo         ?? "",
        sellingPriceKrw: Number(p.sellingPriceKrw) ?? 0,
        status:          p.status,
        mainImageUrl:    p.mainImageUrl    ?? "",
        descriptionKo:   p.descriptionKo   ?? "",
      });
    });
  }, [id]);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ visible: true, message, type });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateProduct(id, {
        titleKo:         form.titleKo        || undefined,
        sellingPriceKrw: form.sellingPriceKrw || undefined,
        status:          form.status          || undefined,
        mainImageUrl:    form.mainImageUrl    || undefined,
        descriptionKo:   form.descriptionKo   || undefined,
      });
      setProduct(updated);
      showToast("저장되었습니다.", "success");
    } catch {
      showToast("저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── 헤더 ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/admin/products/${id}`} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">상품 편집</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              ID: {product.id} · 타오바오: {product.taobaoItemId}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>

      {/* ── 이미지 갤러리 + 편집 폼 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* 이미지 갤러리 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">이미지 갤러리</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductImageGallery
              productId={id}
              images={images}
              mainImageUrl={form.mainImageUrl}
              onImagesChange={setImages}
              onMainImageChange={(url) => patch("mainImageUrl", url)}
              onToast={showToast}
            />
          </CardContent>
        </Card>

        {/* 편집 폼 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">편집</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">원제목 (중국어 — 읽기 전용)</label>
              <TextBox value={product.titleOriginal ?? ""} readOnly stylingMode="outlined" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">한국어 제목</label>
              <TextBox
                value={form.titleKo}
                onValueChanged={(e) => patch("titleKo", e.value)}
                stylingMode="outlined"
                placeholder="한국어 제목 입력..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">판매가 (KRW)</label>
              <NumberBox
                value={form.sellingPriceKrw}
                onValueChanged={(e) => patch("sellingPriceKrw", e.value ?? 0)}
                stylingMode="outlined"
                format="#,##0"
                min={0}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">상태</label>
              <SelectBox
                dataSource={STATUS_OPTIONS}
                valueExpr="value"
                displayExpr="label"
                value={form.status}
                onValueChanged={(e) => patch("status", e.value)}
                stylingMode="outlined"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">대표 이미지 URL</label>
              <TextBox
                value={form.mainImageUrl}
                onValueChanged={(e) => patch("mainImageUrl", e.value)}
                stylingMode="outlined"
                placeholder="https://... 또는 갤러리에서 ★ 클릭"
              />
            </div>

            <div className="text-xs text-gray-400 space-y-0.5 border-t pt-3">
              <p>원가: ¥{product.originalPriceCny} · 재고: {product.stockQuantity}개 · 판매량: {product.salesVolume}개</p>
              <p>셀러: {product.sellerNick ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 상품 설명 ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">상품 설명 (한국어)</CardTitle>
        </CardHeader>
        <CardContent>
          <TextArea
            value={form.descriptionKo}
            onValueChanged={(e) => patch("descriptionKo", e.value)}
            stylingMode="outlined"
            height={180}
            placeholder="한국어 상품 설명 입력..."
          />
        </CardContent>
      </Card>

      {/* ── SKU / 옵션 ── */}
      {(product.variants ?? []).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SKU / 옵션</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              dataSource={product.variants}
              showBorders={false}
              rowAlternationEnabled
              columnAutoWidth
              noDataText="옵션 없음"
            >
              <Column dataField="skuId"      caption="SKU ID"     width={130} />
              <Column dataField="optionName" caption="옵션명" />
              <Column
                dataField="priceCny"
                caption="원가 (CNY)"
                width={110}
                cellRender={(d: { value: number }) => <span>¥{d.value}</span>}
              />
              <Column dataField="stock" caption="재고" width={80} />
            </DataGrid>
          </CardContent>
        </Card>
      )}

      {/* ── 토스트 알림 ── */}
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
