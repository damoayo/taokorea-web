import { getProducts, Product } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {product.mainImageUrl ? (
            <Image
              unoptimized
              src={product.mainImageUrl}
              alt={product.titleKo ?? product.titleOriginal ?? ""}
              width={640}
              height={640}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
              📦
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <p className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-gray-100">
            {product.titleKo ?? product.titleOriginal}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-base font-bold text-indigo-600">
              {product.sellingPriceKrw?.toLocaleString()}원
            </span>
            {product.stockQuantity === 0 && (
              <Badge variant="destructive" className="text-xs">
                품절
              </Badge>
            )}
          </div>
          {product.salesVolume > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {product.salesVolume}개 판매
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function ShopProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string; page?: string }>;
}) {
  const { keyword, page } = await searchParams;
  let products: Product[] = [];
  let totalElements = 0;

  try {
    const result = await getProducts({
      status: "LISTED",
      keyword,
      page: page ? Number(page) : 0,
      size: 20,
    });
    products = result.content;
    totalElements = result.totalElements;
  } catch {
    // Spring Boot 미실행 시 빈 배열
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          전체 상품
        </h1>
        <p className="text-sm text-gray-500">{totalElements.toLocaleString()}개 상품</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p>등록된 상품이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
