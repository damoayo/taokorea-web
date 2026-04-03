export const dynamic = "force-dynamic";

import DashboardCharts from "@/components/admin/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type StatusCount } from "@/lib/api";
import { getServerStats } from "@/lib/server-api";
import {
  Ban,
  BarChart2,
  CheckCircle2,
  Download,
  EyeOff,
  PauseCircle,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";

async function fetchStats(): Promise<StatusCount> {
  try {
    return await getServerStats();
  } catch {
    return {
      imported: 0,
      approved: 0,
      listed: 0,
      suspended: 0,
      soldOut: 0,
      hidden: 0,
      rejected: 0,
    };
  }
}

const STATUS_CARDS = [
  { key: "imported" as const, label: "Imported", icon: Download, color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-900/30", border: "border-slate-200 dark:border-slate-700" },
  { key: "approved" as const, label: "Approved", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" },
  { key: "listed" as const, label: "Listed", icon: ShoppingBag, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800" },
  { key: "suspended" as const, label: "Suspended", icon: PauseCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
  { key: "soldOut" as const, label: "Sold Out", icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800" },
  { key: "hidden" as const, label: "Hidden", icon: EyeOff, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-800", border: "border-gray-200 dark:border-gray-700" },
  { key: "rejected" as const, label: "Rejected", icon: Ban, color: "text-rose-700", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-800" },
];

const KPI_CARDS = [
  { label: "Monthly Revenue", value: "12,180,000 KRW", sub: "+51% vs last month", icon: TrendingUp, color: "text-indigo-600" },
  { label: "Visitors", value: "639", sub: "This week", icon: Users, color: "text-emerald-600" },
  { label: "Orders", value: "106", sub: "This month", icon: ShoppingCart, color: "text-amber-600" },
  { label: "Conversion", value: "16.6%", sub: "Visitor to order", icon: BarChart2, color: "text-purple-600" },
];

export default async function DashboardPage() {
  const stats = await fetchStats();
  const total = Object.values(stats).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Operational summary for TaoKorea.</p>
      </div>

      <Card className="border-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
        <CardContent className="flex items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium opacity-80">Total tracked products</p>
            <p className="text-5xl font-extrabold tracking-tight">{total.toLocaleString()}</p>
            <p className="mt-1 text-sm opacity-70">
              Listed {stats.listed} / Approved {stats.approved} / Imported {stats.imported}
            </p>
          </div>
          <TrendingUp size={56} className="opacity-30" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {STATUS_CARDS.map(({ key, label, icon: Icon, color, bg, border }) => {
          const value = stats[key] ?? 0;
          return (
            <Card key={key} className={`border ${border}`}>
              <CardHeader className="flex flex-row items-center justify-between px-4 pb-1 pt-4">
                <CardTitle className="text-xs font-medium text-gray-500">{label}</CardTitle>
                <div className={`rounded-full p-1.5 ${bg}`}>
                  <Icon size={13} className={color} />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {total > 0 ? Math.round((value / total) * 100) : 0}%
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {KPI_CARDS.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-xs text-gray-500">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
                </div>
                <Icon size={22} className={`${color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/products" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white transition hover:bg-indigo-700">
            Products
          </Link>
          <Link href="/admin/orders" className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200">
            Orders
          </Link>
          <a href="/products" target="_blank" rel="noreferrer" className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200">
            Storefront
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
