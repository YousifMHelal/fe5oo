import { prisma } from "@/lib/prisma";

export interface OverviewStats {
  totalRevenue: number;
  ticketCount: number;
  avgTicket: number;
  earningsByWorker: { name: string; total: number }[];
  topServices: { title: string; total: number }[];
  dailyTrend: { date: string; total: number }[];
}

export async function getOverviewStats(from: Date, to: Date): Promise<OverviewStats> {
  const [tickets, itemsByWorker, itemsByService] = await Promise.all([
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
  ]);

  const totalRevenue = tickets.reduce((sum, t) => sum + t.total, 0);
  const ticketCount = tickets.length;
  const avgTicket = ticketCount > 0 ? Math.round(totalRevenue / ticketCount) : 0;

  // Earnings per worker
  const workerMap = new Map<string, number>();
  for (const item of itemsByWorker) {
    const key = item.worker.name;
    workerMap.set(key, (workerMap.get(key) ?? 0) + item.priceSnapshot);
  }
  const earningsByWorker = [...workerMap.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  // Top services
  const serviceMap = new Map<string, number>();
  for (const item of itemsByService) {
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

  return { totalRevenue, ticketCount, avgTicket, earningsByWorker, topServices, dailyTrend };
}
