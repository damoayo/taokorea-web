import { getProducts, Product } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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
              🛍️
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
            {product.salesVolume > 0 && (
              <Badge variant="secondary" className="text-xs">
                {product.salesVolume}개 판매
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function ShopMainPage() {
  let products: Product[] = [];
  try {
    const page = await getProducts({ status: "LISTED", size: 12 });
    products = page.content;
  } catch {
    // Spring Boot 미실행 시 빈 배열
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-10 text-center">
        <h1 className="text-3xl font-bold mb-2">타오바오 직구 쇼핑몰</h1>
        <p className="text-indigo-100 mb-6">최신 트렌드 상품을 합리적인 가격에</p>
        <Link
          href="/products"
          className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-full hover:bg-indigo-50 transition"
        >
          전체 상품 보기
        </Link>
      </section>

      {/* 추천 상품 */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
          추천 상품
        </h2>
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🛍️</p>
            <p>등록된 상품이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
