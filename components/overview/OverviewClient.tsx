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
} from "recharts";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatEGP } from "@/lib/money";
import type { OverviewStats } from "@/lib/queries/overview";

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

export function OverviewClient({ stats }: OverviewClientProps) {
  const { totalRevenue, ticketCount, avgTicket, earningsByWorker, topServices, dailyTrend } = stats;
  const hasData = ticketCount > 0;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="إجمالي الإيرادات"
          value={totalRevenue.toLocaleString("en-US")}
          unit="ج.م"
        />
        <StatCard
          label="عدد المعاملات"
          value={ticketCount.toLocaleString("en-US")}
        />
        <StatCard
          label="متوسط المعاملة"
          value={avgTicket.toLocaleString("en-US")}
          unit="ج.م"
        />
      </div>

      {!hasData ? (
        <EmptyState
          title="لا توجد بيانات"
          description="لا توجد معاملات في هذه الفترة"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily revenue trend */}
          <ChartCard title="الإيرادات اليومية">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyTrend} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(d: string) => d.slice(5)}
                  reversed
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={EGP_TICK}
                  width={70}
                />
                <Tooltip
                  formatter={(v) => [formatEGP(Number(v)), "الإيرادات"]}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="var(--secondary)"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Earnings per worker */}
          <ChartCard title="أرباح العمال">
            {earningsByWorker.length === 0 ? (
              <EmptyState title="لا توجد بيانات" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={earningsByWorker} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickFormatter={EGP_TICK}
                    width={70}
                  />
                  <Tooltip
                    formatter={(v) => [formatEGP(Number(v)), "الإيرادات"]}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Top services */}
          <ChartCard title="أعلى الخدمات مبيعاً">
            {topServices.length === 0 ? (
              <EmptyState title="لا توجد بيانات" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={topServices}
                  layout="vertical"
                  margin={{ top: 4, right: 4, left: 80, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickFormatter={EGP_TICK}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    width={80}
                  />
                  <Tooltip
                    formatter={(v) => [formatEGP(Number(v)), "الإيرادات"]}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="total" fill="var(--secondary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
}
