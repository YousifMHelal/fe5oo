export type PeriodKey = "today" | "7d" | "30d" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

export function resolvePeriod(period: string, fromStr?: string, toStr?: string): DateRange {
  const now = new Date();

  if (period === "custom" && fromStr && toStr) {
    const from = new Date(fromStr);
    const to = new Date(toStr);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from <= to) {
      return { from, to };
    }
  }

  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  const from = new Date(now);

  if (period === "7d") {
    from.setDate(from.getDate() - 6);
  } else if (period === "30d") {
    from.setDate(from.getDate() - 29);
  }
  from.setHours(0, 0, 0, 0);

  return { from, to };
}

export function isPeriodKey(value: unknown): value is PeriodKey {
  return value === "today" || value === "7d" || value === "30d" || value === "custom";
}
