import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between mb-6",
        className
      )}
    >
      <h1 className="font-heading text-lg font-semibold text-foreground">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  );
}
