import { CheckCircle2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        active
          ? "bg-[var(--success)]/10 text-[var(--success)]"
          : "bg-[var(--warning)]/10 text-[var(--warning)]"
      )}
    >
      {active ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Ban className="h-3.5 w-3.5 shrink-0" />
      )}
      {active ? "نشط" : "موقوف"}
    </span>
  );
}
