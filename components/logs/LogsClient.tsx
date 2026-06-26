"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
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


export function LogsClient({ logs }: LogsClientProps) {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

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
            className="rounded-md border border-border bg-background px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">جميع الكيانات</option>
            {entities.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">جميع الإجراءات</option>
            {actions.map((a) => <option key={a} value={a}>{ACTION_LABELS[a] ?? a}</option>)}
          </select>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="bg-muted/50">
                <th className="h-10 px-3 text-start font-semibold text-foreground">التاريخ</th>
                <th className="h-10 px-3 text-start font-semibold text-foreground">المستخدم</th>
                <th className="h-10 px-3 text-start font-semibold text-foreground">الإجراء</th>
                <th className="h-10 px-3 text-start font-semibold text-foreground">الكيان</th>
                <th className="h-10 px-3 text-start font-semibold text-foreground">الملخص</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <EmptyState title="لا توجد نتائج" description="جرب تغيير فلاتر البحث" />
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b transition-colors duration-150 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground text-xs">
                      {new Date(log.createdAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-3 py-2">{log.actorName}</td>
                    <td className="px-3 py-2">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground")}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">{log.entity}</td>
                    <td className="px-3 py-2">{log.summaryAr}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
