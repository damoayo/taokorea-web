export const dynamic = "force-dynamic";

import DashboardCharts from "@/components/admin/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStats, StatusCount } from "@/lib/api";
import {
  Ban,
  BarChart2,
  CheckCircle2,
  Download,
  EyeOff,
  PauseCircle,
  ShoppingBag,
  ShoppingCart,
  TrendingUp, Users,
  XCircle,
} from "lucide-react";

async function fetchStats(): Promise<StatusCount> {
  try {
    return await getStats();
  } catch {
    return { imported: 0, approved: 0, listed: 0, suspended: 0, soldOut: 0, hidden: 0, rejected: 0 };
  }
}

const STATUS_CARDS = [
  { key: "imported" as keyof StatusCount,  label: "가져옴",    icon: Download,      color: "text-slate-600",   bg: "bg-slate-50 dark:bg-slate-900/30",  border: "border-slate-200 dark:border-slate-700" },
  { key: "approved" as keyof StatusCount,  label: "승인됨",    icon: CheckCircle2,  color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20",    border: "border-blue-200 dark:border-blue-800" },
  { key: "listed" as keyof StatusCount,    label: "판매중",    icon: ShoppingBag,   color: "text-green-600",   bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800" },
  { key: "suspended" as keyof StatusCount, label: "일시중지",  icon: PauseCircle,   color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20",  border: "border-amber-200 dark:border-amber-800" },
  { key: "soldOut" as keyof StatusCount,   label: "품절",      icon: XCircle,       color: "text-red-500",     bg: "bg-red-50 dark:bg-red-900/20",      border: "border-red-200 dark:border-red-800" },
  { key: "hidden" as keyof StatusCount,    label: "숨김",      icon: EyeOff,        color: "text-gray-500",    bg: "bg-gray-50 dark:bg-gray-800",       border: "border-gray-200 dark:border-gray-700" },
  { key: "rejected" as keyof StatusCount,  label: "거절됨",    icon: Ban,           color: "text-rose-700",    bg: "bg-rose-50 dark:bg-rose-900/20",    border: "border-rose-200 dark:border-rose-800" },
];

const KPI_CARDS = [
  { label: "이번 달 매출",  value: "₩3,180,000", sub: "+51% vs 지난달", icon: TrendingUp,   color: "text-indigo-600" },
  { label: "신규 방문자",   value: "639명",        sub: "이번 주 기준",   icon: Users,        color: "text-emerald-600" },
  { label: "총 주문수",     value: "106건",        sub: "이번 달 기준",   icon: ShoppingCart, color: "text-amber-600" },
  { label: "전환율",        value: "16.6%",        sub: "방문→구매",      icon: BarChart2,    color: "text-purple-600" },
];

export default async function DashboardPage() {
  const stats = await fetchStats();
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">대시보드</h2>
        <p className="text-sm text-gray-500 mt-1">TaoKorea 운영 현황</p>
      </div>

      {/* 총계 배너 */}
      <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-lg">
        <CardContent className="flex items-center justify-between py-5 px-6">
          <div>
            <p className="text-sm font-medium opacity-80">전체 등록 상품</p>
            <p className="text-5xl font-extrabold tracking-tight">{total.toLocaleString()}</p>
            <p className="text-sm opacity-60 mt-1">
              판매중 {stats.listed}개 · 승인대기 {stats.approved}개 · 신규 {stats.imported}개
            </p>
          </div>
          <TrendingUp size={56} className="opacity-30" />
        </CardContent>
      </Card>

      {/* 7개 상태 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        {STATUS_CARDS.map(({ key, label, icon: Icon, color, bg, border }) => {
          const value = (stats[key] as number) ?? 0;
          return (
            <Card key={key} className={`border ${border}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-1 px-4 pt-4">
                <CardTitle className="text-xs font-medium text-gray-500">{label}</CardTitle>
                <div className={`rounded-full p-1.5 ${bg}`}>
                  <Icon size={13} className={color} />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {total > 0 ? Math.round((value / total) * 100) : 0}%
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
                <Icon size={22} className={`${color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DevExtreme 차트 */}
      <DashboardCharts stats={stats} />

      {/* 바로가기 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">빠른 바로가기</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <a href="/admin/products" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition">상품 목록</a>
          <a href="/admin/orders"   className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition">주문 관리</a>
          <a href="/products" target="_blank" className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition">쇼핑몰 보기</a>
        </CardContent>
      </Card>
    </div>
  );
}
