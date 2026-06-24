import { cn } from "@/lib/utils";

export function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isAdmin
          ? "bg-primary/10 text-primary"
          : "bg-secondary/10 text-secondary"
      )}
    >
      {isAdmin ? "مدير" : "كاشير"}
    </span>
  );
}
