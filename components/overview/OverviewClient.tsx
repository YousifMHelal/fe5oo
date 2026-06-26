"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  LabelList,
} from "recharts";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatEGP } from "@/lib/money";
import type { OverviewStats } from "@/lib/queries/overview";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface OverviewClientProps {
  stats: OverviewStats;
  period: string;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

const EGP_TICK = (value: number) => value.toLocaleString("en-US");

// CSS vars don't resolve in SVG fill attrs — use hex directly
const TICK_COLOR = "#0f172a";
const GRID_COLOR = "#e2e8f0";   // --border light
const C_PRIMARY  = "#2563eb";
const C_DANGER   = "#dc2626";
const C_SUCCESS  = "#059669";
const C_WARNING  = "#d97706";

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#0f172a",
};

export function OverviewClient({ stats }: OverviewClientProps) {
  const { totalRevenue, ticketCount, avgTicket, workerStats, topServices, dailyTrend } = stats;
  const hasData = ticketCount > 0 || workerStats.length > 0;

  // Chart data: show revenue + expenses bars per worker
  const workerChartData = workerStats.map((w) => ({
    name: w.name,
    إيرادات: w.revenue,
    سلف: w.expenses,
    صافي: w.net,
  }));

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="إجمالي الإيرادات" value={totalRevenue.toLocaleString("en-US")} unit="ج.م" />
        <StatCard label="عدد المعاملات" value={ticketCount.toLocaleString("en-US")} />
        <StatCard label="متوسط المعاملة" value={avgTicket.toLocaleString("en-US")} unit="ج.م" />
      </div>

      {/* Worker net earnings table */}
      {workerStats.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 md:px-6 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">صافي أرباح العمال</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-start ps-4 md:ps-6 py-2.5 font-medium text-muted-foreground">العامل</th>
                  <th className="text-end py-2.5 pe-4 font-medium text-muted-foreground">إيرادات</th>
                  <th className="text-end py-2.5 pe-4 font-medium text-muted-foreground">سلف/مصروف</th>
                  <th className="text-end py-2.5 pe-4 md:pe-6 font-medium text-muted-foreground">الصافي</th>
                </tr>
              </thead>
              <tbody>
                {workerStats.map((w, i) => {
                  const isNeg = w.net < 0;
                  const isPos = w.net > 0;
                  return (
                    <tr
                      key={w.name}
                      className={cn(
                        "border-b border-border last:border-0 transition-colors hover:bg-muted/30",
                        i % 2 === 0 ? "" : "bg-muted/10"
                      )}
                    >
                      <td className="ps-4 md:ps-6 py-3 font-medium text-foreground">{w.name}</td>
                      <td className="text-end pe-4 py-3 tabular-nums text-foreground">
                        {formatEGP(w.revenue)}
                      </td>
                      <td className="text-end pe-4 py-3 tabular-nums text-danger">
                        {w.expenses > 0 ? `– ${formatEGP(w.expenses)}` : "—"}
                      </td>
                      <td className="text-end pe-4 md:pe-6 py-3 tabular-nums font-semibold">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1",
                            isPos ? "text-success" : isNeg ? "text-danger" : "text-muted-foreground"
                          )}
                        >
                          {isPos ? (
                            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                          ) : isNeg ? (
                            <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <Minus className="h-3.5 w-3.5 shrink-0" />
                          )}
                          {formatEGP(Math.abs(w.net))}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!hasData ? (
        <EmptyState title="لا توجد بيانات" description="لا توجد معاملات في هذه الفترة" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily revenue trend */}
          <ChartCard title="الإيرادات اليومية">
            {dailyTrend.length === 0 ? (
              <EmptyState title="لا توجد بيانات" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyTrend} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C_PRIMARY} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={C_PRIMARY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: TICK_COLOR }}
                    tickFormatter={(d: string) => d.slice(5)}
                    reversed
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: TICK_COLOR }}
                    tickFormatter={EGP_TICK}
                    width={70}
                    tickMargin={8}
                  />
                  <Tooltip
                    formatter={(v) => [formatEGP(Number(v)), "الإيرادات"]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={C_PRIMARY}
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Worker revenue vs expenses grouped bar */}
          <ChartCard title="إيرادات وسلف العمال">
            {workerStats.length === 0 ? (
              <EmptyState title="لا توجد بيانات" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={workerChartData} margin={{ top: 4, right: 8, left: 8, bottom: 72 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: TICK_COLOR }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    tickMargin={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: TICK_COLOR }}
                    tickFormatter={EGP_TICK}
                    width={64}
                    tickMargin={8}
                  />
                  <Tooltip
                    formatter={(v, name) => [formatEGP(Number(v)), name as string]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Bar dataKey="إيرادات" fill={C_PRIMARY} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="سلف" fill={C_DANGER} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Top services */}
          <ChartCard title="أعلى الخدمات مبيعاً">
            {topServices.length === 0 ? (
              <EmptyState title="لا توجد بيانات" />
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(220, topServices.length * 38 + 24)}>
                <BarChart
                  data={topServices}
                  layout="vertical"
                  margin={{ top: 4, right: 56, left: 120, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: TICK_COLOR }}
                    tickFormatter={EGP_TICK}
                  />
                  <YAxis type="category" dataKey="title" hide />
                  <Tooltip
                    formatter={(v) => [formatEGP(Number(v)), "الإيرادات"]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} minPointSize={160}>
                    {topServices.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={[C_PRIMARY, C_SUCCESS, C_WARNING, C_DANGER, "#0891b2"][idx % 5]}
                      />
                    ))}
                    <LabelList
                      dataKey="title"
                      position="insideLeft"
                      style={{ fontSize: 12, fill: "#0f172a", fontWeight: 600 }}
                      offset={-10}
                    />
                    <LabelList
                      dataKey="total"
                      position="right"
                      formatter={(v: unknown) => formatEGP(Number(v))}
                      style={{ fontSize: 11, fill: "#0f172a", fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Worker net bar */}
          <ChartCard title="صافي ربح كل عامل">
            {workerStats.length === 0 ? (
              <EmptyState title="لا توجد بيانات" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={workerChartData} margin={{ top: 4, right: 8, left: 8, bottom: 72 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: TICK_COLOR }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    tickMargin={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: TICK_COLOR }}
                    tickFormatter={EGP_TICK}
                    width={64}
                    tickMargin={8}
                  />
                  <Tooltip
                    formatter={(v) => [formatEGP(Number(v)), "الصافي"]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Bar dataKey="صافي" radius={[4, 4, 0, 0]}>
                    {workerChartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry["صافي"] >= 0 ? C_PRIMARY : C_DANGER}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
}
