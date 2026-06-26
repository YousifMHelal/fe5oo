import { prisma } from "@/lib/prisma";

export interface WorkerStat {
  name: string;
  revenue: number;
  expenses: number;
  net: number;
}

export interface OverviewStats {
  totalRevenue: number;
  ticketCount: number;
  avgTicket: number;
  workerStats: WorkerStat[];
  topServices: { title: string; total: number }[];
  dailyTrend: { date: string; total: number }[];
}

export async function getOverviewStats(from: Date, to: Date): Promise<OverviewStats> {
  const [tickets, itemsByWorker, itemsByService, expenses] = await Promise.all([
    prisma.ticket.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { total: true, createdAt: true },
    }),
    prisma.ticketItem.findMany({
      where: { ticket: { createdAt: { gte: from, lte: to } } },
      select: { priceSnapshot: true, worker: { select: { name: true } } },
    }),
    prisma.ticketItem.findMany({
      where: { ticket: { createdAt: { gte: from, lte: to } } },
      select: { priceSnapshot: true, service: { select: { title: true } } },
    }),
    prisma.workerExpense.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { amount: true, worker: { select: { name: true } } },
    }),
  ]);

  const totalRevenue = tickets.reduce((sum, t) => sum + t.total, 0);
  const ticketCount = tickets.length;
  const avgTicket = ticketCount > 0 ? Math.round(totalRevenue / ticketCount) : 0;

  // Revenue per worker
  const revenueMap = new Map<string, number>();
  for (const item of itemsByWorker) {
    if (!item.worker) continue;
    const key = item.worker.name;
    revenueMap.set(key, (revenueMap.get(key) ?? 0) + item.priceSnapshot);
  }

  // Expenses per worker
  const expenseMap = new Map<string, number>();
  for (const exp of expenses) {
    if (!exp.worker) continue;
    const key = exp.worker.name;
    expenseMap.set(key, (expenseMap.get(key) ?? 0) + exp.amount);
  }

  // Merge into workerStats — include workers with expenses even if no revenue this period
  const allWorkers = new Set([...revenueMap.keys(), ...expenseMap.keys()]);
  const workerStats: WorkerStat[] = [...allWorkers]
    .map((name) => {
      const revenue = revenueMap.get(name) ?? 0;
      const exps = expenseMap.get(name) ?? 0;
      return { name, revenue, expenses: exps, net: revenue - exps };
    })
    .sort((a, b) => b.net - a.net);

  // Top services
  const serviceMap = new Map<string, number>();
  for (const item of itemsByService) {
    if (!item.service) continue;
    const key = item.service.title;
    serviceMap.set(key, (serviceMap.get(key) ?? 0) + item.priceSnapshot);
  }
  const topServices = [...serviceMap.entries()]
    .map(([title, total]) => ({ title, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Daily trend
  const dayMap = new Map<string, number>();
  for (const t of tickets) {
    const day = new Date(t.createdAt).toISOString().slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + t.total);
  }
  const dailyTrend = [...dayMap.entries()]
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { totalRevenue, ticketCount, avgTicket, workerStats, topServices, dailyTrend };
}
