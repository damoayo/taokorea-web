import { getServerProduct } from "@/lib/server-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  IMPORTED:  { label: "가져옴",   cls: "bg-slate-100 text-slate-700 border-slate-200" },
  APPROVED:  { label: "승인됨",   cls: "bg-blue-100 text-blue-700 border-blue-200" },
  LISTED:    { label: "판매중",   cls: "bg-green-100 text-green-700 border-green-200" },
  SUSPENDED: { label: "일시중지", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  SOLD_OUT:  { label: "품절",     cls: "bg-red-100 text-red-700 border-red-200" },
  HIDDEN:    { label: "숨김",     cls: "bg-gray-100 text-gray-500 border-gray-200" },
  REJECTED:  { label: "거절됨",   cls: "bg-rose-100 text-rose-700 border-rose-200" },
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product;
  try {
    product = await getServerProduct(Number(id));
  } catch {
    notFound();
  }

  const statusMeta = STATUS_LABEL[product.status] ?? { label: product.status, cls: "bg-gray-100 text-gray-600 border-gray-200" };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── 헤더 ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              상품 상세
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              ID: {product.id} · 타오바오: {product.taobaoItemId}
            </p>
          </div>
        </div>
        <Link
          href={`/admin/products/${id}/edit`}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          <Pencil size={14} />
          수정
        </Link>
      </div>

      {/* ── 이미지 + 기본 정보 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 대표 이미지 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">대표 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square w-full max-w-xs mx-auto rounded-xl overflow-hidden border bg-gray-50 dark:bg-gray-800">
              {product.mainImageUrl ? (
                <img
                  src={product.mainImageUrl}
                  alt={product.titleKo ?? product.titleOriginal ?? ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                  <span className="text-5xl">📦</span>
                  <span className="text-xs">이미지 없음</span>
                </div>
              )}
            </div>
            {/* 추가 이미지 썸네일 */}
            {(product.images ?? []).length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {product.images!.map((img) => (
                  <img
                    key={img.id}
                    src={img.imageUrl}
                    alt=""
                    className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 기본 정보 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="상태">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${statusMeta.cls}`}>
                {statusMeta.label}
              </span>
            </Row>
            <Row label="원제목 (중국어)" value={product.titleOriginal ?? "—"} />
            <Row label="한국어 제목"     value={product.titleKo       ?? "—"} />
            <Row label="셀러"           value={product.sellerNick    ?? "—"} />
            <Row label="원가 (CNY)"     value={`¥${product.originalPriceCny}`} />
            <Row label="판매가 (KRW)"   value={`${Number(product.sellingPriceKrw).toLocaleString()}원`} />
            <Row label="재고"           value={`${product.stockQuantity}개`} />
            <Row label="판매량"         value={`${product.salesVolume}개`} />
            {product.syncedAt && (
              <Row label="동기화" value={new Date(product.syncedAt).toLocaleString("ko-KR")} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 상품 설명 ── */}
      {product.descriptionKo && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">상품 설명 (한국어)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {product.descriptionKo}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── SKU / 옵션 ── */}
      {(product.variants ?? []).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SKU / 옵션 ({product.variants!.length}개)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-xs">
                    <th className="text-left pb-2 font-medium">SKU ID</th>
                    <th className="text-left pb-2 font-medium">옵션명</th>
                    <th className="text-right pb-2 font-medium">원가 (CNY)</th>
                    <th className="text-right pb-2 font-medium">재고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {product.variants!.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-2 text-gray-500 font-mono text-xs">{v.skuId}</td>
                      <td className="py-2">{v.optionName ?? "—"}</td>
                      <td className="py-2 text-right">¥{v.priceCny}</td>
                      <td className="py-2 text-right">{v.stock}개</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="w-32 text-gray-500 shrink-0">{label}</span>
      {children ?? <span className="text-gray-900 dark:text-gray-100">{value}</span>}
    </div>
  );
}
