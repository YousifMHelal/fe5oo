"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuditLog = {
  id: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string | null;
  summaryAr: string;
  before: string | null;
  after: string | null;
  createdAt: Date;
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: "إضافة",
  UPDATE: "تعديل",
  DELETE: "حذف",
  LOGIN: "دخول",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-[var(--success)]/10 text-[var(--success)]",
  UPDATE: "bg-primary/10 text-primary",
  DELETE: "bg-destructive/10 text-destructive",
  LOGIN: "bg-secondary/10 text-secondary",
};

interface LogsClientProps {
  logs: AuditLog[];
}

function JsonBlock({ raw }: { raw: string | null }) {
  if (!raw) return <span className="text-muted-foreground text-xs">—</span>;
  try {
    return (
      <pre className="text-xs bg-muted rounded p-2 overflow-x-auto max-w-full whitespace-pre-wrap break-all">
        {JSON.stringify(JSON.parse(raw), null, 2)}
      </pre>
    );
  } catch {
    return <span className="text-xs text-muted-foreground">{raw}</span>;
  }
}

export function LogsClient({ logs }: LogsClientProps) {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const entities = [...new Set(logs.map((l) => l.entity))].sort();
  const actions = [...new Set(logs.map((l) => l.action))].sort();

  const q = search.trim().toLowerCase();
  const filtered = logs.filter((l) => {
    if (entityFilter && l.entity !== entityFilter) return false;
    if (actionFilter && l.action !== actionFilter) return false;
    if (q) {
      return (
        l.summaryAr.includes(q) ||
        l.actorName.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <PageHeader title="سجل العمليات" />

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
          >
            <option value="">جميع الكيانات</option>
            {entities.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
          >
            <option value="">جميع الإجراءات</option>
            {actions.map((a) => <option key={a} value={a}>{ACTION_LABELS[a] ?? a}</option>)}
          </select>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="bg-muted/50">
                <th className="h-10 px-2 text-start font-semibold text-foreground w-8" />
                <th className="h-10 px-2 text-start font-semibold text-foreground">التاريخ</th>
                <th className="h-10 px-2 text-start font-semibold text-foreground">المستخدم</th>
                <th className="h-10 px-2 text-start font-semibold text-foreground">الإجراء</th>
                <th className="h-10 px-2 text-start font-semibold text-foreground">الكيان</th>
                <th className="h-10 px-2 text-start font-semibold text-foreground">الملخص</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState title="لا توجد نتائج" description="جرب تغيير فلاتر البحث" />
                  </td>
                </tr>
              ) : (
                filtered.flatMap((log) => {
                  const isOpen = expanded.has(log.id);
                  const hasDiff = !!(log.before || log.after);
                  return [
                    <tr
                      key={log.id}
                      className={cn(
                        "border-b transition-colors duration-150",
                        isOpen ? "bg-muted/30" : "hover:bg-muted/30"
                      )}
                    >
                      <td className="p-2">
                        {hasDiff && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer"
                            onClick={() => toggleExpand(log.id)}
                          >
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        )}
                      </td>
                      <td className="p-2 whitespace-nowrap text-muted-foreground text-xs">
                        {new Date(log.createdAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="p-2">{log.actorName}</td>
                      <td className="p-2">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground")}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </td>
                      <td className="p-2 text-muted-foreground text-xs">{log.entity}</td>
                      <td className="p-2">{log.summaryAr}</td>
                    </tr>,
                    isOpen && hasDiff && (
                      <tr key={`${log.id}-detail`} className="bg-muted/10 border-b">
                        <td colSpan={6} className="px-6 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">قبل</p>
                              <JsonBlock raw={log.before} />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">بعد</p>
                              <JsonBlock raw={log.after} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ),
                  ].filter(Boolean);
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
