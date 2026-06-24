export type PeriodKey = "today" | "7d" | "30d";

export interface DateRange {
  from: Date;
  to: Date;
}

/** Resolve a period key to a UTC-safe {from, to} window based on local day boundaries. */
export function resolvePeriod(period: string): DateRange {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(now);

  if (period === "7d") {
    from.setDate(from.getDate() - 6);
  } else if (period === "30d") {
    from.setDate(from.getDate() - 29);
  }
  // "today" or unknown → current day only
  from.setHours(0, 0, 0, 0);

  return { from, to };
}

export function isPeriodKey(value: unknown): value is PeriodKey {
  return value === "today" || value === "7d" || value === "30d";
}
