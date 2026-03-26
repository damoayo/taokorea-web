import { getProduct } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Package, Truck } from "lucide-react";
import { notFound } from "next/navigation";

const STATUS_LABEL: Record<string, { label: string; class: string }> = {
  LISTED:   { label: "판매중", class: "bg-green-100 text-green-800" },
  IMPORTED: { label: "준비중", class: "bg-blue-100 text-blue-800" },
  SOLD_OUT: { label: "품절", class: "bg-red-100 text-red-800" },
  HIDDEN: { label: "비공개", class: "bg-gray-100 text-gray-800" },
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product;
  try {
    product = await getProduct(Number(id));
  } catch {
    notFound();
  }

  const status = STATUS_LABEL[product.status] ?? { label: product.status, class: "" };
  const isSoldOut = product.status === "SOLD_OUT" || product.stockQuantity === 0;

  return (
    <div className="space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <ArrowLeft size={16} />
        상품 목록으로
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 이미지 */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {product.mainImageUrl ? (
              <img
                src={product.mainImageUrl}
                alt={product.titleKo ?? product.titleOriginal}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
                📦
              </div>
            )}
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="space-y-4">
          <div>
            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2 ${status.class}`}>
              {status.label}
            </span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
              {product.titleKo ?? product.titleOriginal}
            </h1>
            {product.titleKo && (
              <p className="text-sm text-gray-400 mt-1">{product.titleOriginal}</p>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-sm text-gray-500 mb-1">판매가</p>
            <p className="text-3xl font-bold text-indigo-600">
              {product.sellingPriceKrw?.toLocaleString()}
              <span className="text-lg ml-1">원</span>
            </p>
            <p className="text-sm text-gray-400 mt-0.5">
              원가: ¥{product.originalPriceCny}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Package size={16} />
              <span>재고 {product.stockQuantity}개</span>
            </div>
            {product.salesVolume > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ShoppingCart size={16} />
                <span>{product.salesVolume}명이 구매했습니다</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Truck size={16} />
              <span>배송비 무료</span>
            </div>
          </div>

          <Separator />

          <button
            disabled={isSoldOut}
            className="w-full py-3.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {isSoldOut ? "품절" : "장바구니 담기"}
          </button>

          {product.sellerNick && (
            <p className="text-xs text-gray-400 text-center">
              판매자: {product.sellerNick}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
