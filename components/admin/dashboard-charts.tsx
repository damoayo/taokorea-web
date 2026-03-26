"use client";

import Chart, {
  Series,
  ArgumentAxis,
  ValueAxis,
  Legend,
  Tooltip,
  Title,
  Export,
} from "devextreme-react/chart";
import PieChart, {
  Series as PieSeries,
  Label,
  Connector,
  Legend as PieLegend,
} from "devextreme-react/pie-chart";
import CircularGauge, {
  Scale,
  RangeContainer,
  Range,
  ValueIndicator,
  Title as GaugeTitle,
  Subtitle,
} from "devextreme-react/circular-gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusCount } from "@/lib/api";

// ── 월별 매출 추이 (mock) ─────────────────────────────
const monthlySales = [
  { month: "10월", sales: 1240000, orders: 42 },
  { month: "11월", sales: 1890000, orders: 63 },
  { month: "12월", sales: 2750000, orders: 91 },
  { month: "1월",  sales: 1620000, orders: 54 },
  { month: "2월",  sales: 2100000, orders: 70 },
  { month: "3월",  sales: 3180000, orders: 106 },
];

// ── 일별 방문자 (mock) ────────────────────────────────
const dailyVisitors = [
  { day: "월", visitors: 128, newUsers: 34 },
  { day: "화", visitors: 245, newUsers: 67 },
  { day: "수", visitors: 193, newUsers: 45 },
  { day: "목", visitors: 312, newUsers: 89 },
  { day: "금", visitors: 487, newUsers: 134 },
  { day: "토", visitors: 563, newUsers: 158 },
  { day: "일", visitors: 421, newUsers: 112 },
];

// ── 카테고리별 판매량 (mock) ──────────────────────────
const categorySales = [
  { category: "여성의류", sales: 4200, revenue: 1680000 },
  { category: "남성의류", sales: 2800, revenue: 2240000 },
  { category: "전자기기", sales: 1560, revenue: 2808000 },
  { category: "생활용품", sales: 3800, revenue: 1140000 },
  { category: "액세서리", sales: 5200, revenue: 884000 },
];

// ── 상품 상태 파이 ─────────────────────────────────────
function statusPieData(stats: StatusCount) {
  return [
    { status: "가져옴",   count: stats.imported,  color: "#94a3b8" },
    { status: "승인됨",   count: stats.approved,  color: "#3b82f6" },
    { status: "판매중",   count: stats.listed,    color: "#22c55e" },
    { status: "일시중지", count: stats.suspended, color: "#f59e0b" },
    { status: "품절",     count: stats.soldOut,   color: "#ef4444" },
    { status: "숨김",     count: stats.hidden,    color: "#9ca3af" },
    { status: "거절됨",   count: stats.rejected,  color: "#f43f5e" },
  ].filter((d) => d.count > 0);
}

interface Props {
  stats: StatusCount;
}

export default function DashboardCharts({ stats }: Props) {
  const total = stats.listed + stats.imported + stats.approved + stats.suspended + stats.soldOut + stats.hidden + stats.rejected;
  const activeRate = total > 0 ? Math.round((stats.listed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

      {/* 1. 월별 매출 + 주문수 콤보 차트 */}
      <Card className="xl:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">월별 매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            dataSource={monthlySales}
            height={260}
            palette="Harmony Light"
          >
            <Title text="" />
            <ArgumentAxis />
            <ValueAxis name="sales" position="left" title="매출 (원)" />
            <ValueAxis name="orders" position="right" title="주문 수" />
            <Series
              type="bar"
              valueField="sales"
              argumentField="month"
              name="매출"
              axis="sales"
              color="#6366f1"
            />
            <Series
              type="spline"
              valueField="orders"
              argumentField="month"
              name="주문 수"
              axis="orders"
              color="#f59e0b"
              width={3}
            />
            <Legend verticalAlignment="bottom" horizontalAlignment="center" />
            <Tooltip enabled shared />
            <Export enabled={false} />
          </Chart>
        </CardContent>
      </Card>

      {/* 2. 일별 방문자 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">주간 방문자 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            dataSource={dailyVisitors}
            height={220}
            palette="Soft"
          >
            <ArgumentAxis />
            <ValueAxis />
            <Series
              type="stackedbar"
              valueField="visitors"
              argumentField="day"
              name="재방문"
              color="#818cf8"
            />
            <Series
              type="stackedbar"
              valueField="newUsers"
              argumentField="day"
              name="신규"
              color="#34d399"
            />
            <Legend verticalAlignment="bottom" horizontalAlignment="center" />
            <Tooltip enabled shared />
            <Export enabled={false} />
          </Chart>
        </CardContent>
      </Card>

      {/* 3. 카테고리별 판매량 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">카테고리별 판매량</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            dataSource={categorySales}
            rotated
            height={220}
            palette="Harmony Light"
          >
            <ArgumentAxis />
            <ValueAxis />
            <Series
              type="bar"
              valueField="sales"
              argumentField="category"
              name="판매량"
              color="#f97316"
              cornerRadius={4}
            />
            <Tooltip enabled />
            <Legend visible={false} />
            <Export enabled={false} />
          </Chart>
        </CardContent>
      </Card>

      {/* 4. 상품 상태 도넛 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">상품 상태 분포</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PieChart
            dataSource={statusPieData(stats)}
            type="doughnut"
            height={220}
            width={280}
            palette={["#22c55e", "#3b82f6", "#ef4444", "#9ca3af"]}
            innerRadius={0.6}
          >
            <PieSeries argumentField="status" valueField="count">
              <Label visible={false} />
              <Connector visible={false} />
            </PieSeries>
            <PieLegend
              verticalAlignment="bottom"
              horizontalAlignment="center"
              itemTextPosition="right"
            />
            <Tooltip enabled />
          </PieChart>
        </CardContent>
      </Card>

      {/* 5. 판매 활성화율 게이지 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">판매 활성화율</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <CircularGauge value={activeRate} height={220} width={280}>
            <GaugeTitle text="판매중 비율">
              <Subtitle text="전체 상품 기준" />
            </GaugeTitle>
            <Scale startValue={0} endValue={100} tickInterval={20}>
            </Scale>
            <RangeContainer>
              <Range startValue={0}  endValue={30}  color="#ef4444" />
              <Range startValue={30} endValue={70}  color="#f59e0b" />
              <Range startValue={70} endValue={100} color="#22c55e" />
            </RangeContainer>
            <ValueIndicator color="#6366f1" />
            <Tooltip enabled />
          </CircularGauge>
        </CardContent>
      </Card>

    </div>
  );
}
