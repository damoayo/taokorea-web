import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">주문 관리</h2>
        <p className="text-sm text-gray-500 mt-1">고객 주문 현황</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
          <ShoppingCart size={48} className="opacity-30" />
          <p className="text-lg font-medium">주문 관리 기능은 준비 중입니다</p>
          <p className="text-sm">곧 업데이트될 예정입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
