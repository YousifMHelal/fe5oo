import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: number; label: string };
  icon?: React.ReactNode;
  loading?: boolean;
}

export function StatCard({ label, value, unit, delta, icon, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4 md:p-6 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  const deltaPositive = delta && delta.value >= 0;

  return (
    <div className="rounded-xl border bg-card p-4 md:p-6 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="font-heading text-3xl font-bold tabular-nums text-foreground">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-muted-foreground">{unit}</span>
        )}
      </div>

      {delta && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            deltaPositive ? "text-[var(--success)]" : "text-[var(--danger)]"
          )}
        >
          {deltaPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>
            {deltaPositive ? "+" : ""}
            {delta.value}% {delta.label}
          </span>
        </div>
      )}
    </div>
  );
}
