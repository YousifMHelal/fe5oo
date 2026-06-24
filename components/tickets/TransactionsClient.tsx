"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { deleteTicket } from "@/actions/tickets";
import { MoneyCell } from "@/components/shared/MoneyCell";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TicketForm } from "@/components/tickets/TicketForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

type Worker = { id: string; name: string };
type Service = { id: string; title: string; price: number };

type TicketItem = {
  id: string;
  priceSnapshot: number;
  worker: { name: string };
  service: { title: string };
};

type Ticket = {
  id: string;
  total: number;
  note: string | null;
  createdAt: Date;
  cashier: { fullName: string; username: string };
  items: TicketItem[];
};

type SortKey = "createdAt" | "total" | "items";
type SortDir = "asc" | "desc";

interface TransactionsClientProps {
  tickets: Ticket[];
  workers: Worker[];
  services: Service[];
  isAdmin: boolean;
}

export function TransactionsClient({ tickets, workers, services, isAdmin }: TransactionsClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Ticket | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [isDeleting, startDelete] = useTransition();

  const refresh = useCallback(() => router.refresh(), [router]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleDelete() {
    if (!deleting) return;
    startDelete(async () => {
      try {
        await deleteTicket(deleting.id);
        toast.success("تم حذف المعاملة");
        setDeleting(null);
        refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  const q = search.trim().toLowerCase();
  const filtered = tickets.filter((t) => {
    if (!q) return true;
    return (
      t.cashier.fullName.toLowerCase().includes(q) ||
      t.items.some(
        (i) =>
          i.worker.name.toLowerCase().includes(q) ||
          i.service.title.toLowerCase().includes(q)
      ) ||
      (t.note ?? "").toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortKey === "total") cmp = a.total - b.total;
    if (sortKey === "items") cmp = a.items.length - b.items.length;
    return sortDir === "asc" ? cmp : -cmp;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3.5 w-3.5 text-foreground" />
      : <ChevronDown className="h-3.5 w-3.5 text-foreground" />;
  }

  return (
    <>
      <PageHeader
        title="المعاملات"
        action={
          <Button onClick={() => setFormOpen(true)} className="cursor-pointer gap-2">
            <Plus className="h-4 w-4" />
            معاملة جديدة
          </Button>
        }
      />

      <div className="space-y-4">
        <Input
          placeholder="بحث في المعاملات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="bg-muted/50">
                <th className="h-10 px-2 text-start align-middle font-medium text-foreground w-8" />
                <th
                  className="h-10 px-2 text-start align-middle font-semibold text-foreground cursor-pointer select-none"
                  onClick={() => toggleSort("createdAt")}
                >
                  <div className="flex items-center gap-1">التاريخ <SortIcon col="createdAt" /></div>
                </th>
                <th className="h-10 px-2 text-start align-middle font-semibold text-foreground">الكاشير</th>
                <th
                  className="h-10 px-2 text-start align-middle font-semibold text-foreground cursor-pointer select-none"
                  onClick={() => toggleSort("items")}
                >
                  <div className="flex items-center gap-1">الخدمات <SortIcon col="items" /></div>
                </th>
                <th
                  className="h-10 px-2 text-start align-middle font-semibold text-foreground cursor-pointer select-none"
                  onClick={() => toggleSort("total")}
                >
                  <div className="flex items-center gap-1">الإجمالي <SortIcon col="total" /></div>
                </th>
                {isAdmin && <th className="h-10 px-2 text-start align-middle font-medium text-foreground" />}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="p-0">
                    <EmptyState title="لا توجد معاملات" description="جرب تغيير كلمة البحث أو الفترة الزمنية" />
                  </td>
                </tr>
              ) : (
                sorted.flatMap((ticket) => {
                  const isOpen = expanded.has(ticket.id);
                  return [
                    <tr
                      key={ticket.id}
                      className={cn(
                        "border-b transition-colors duration-150",
                        isOpen ? "bg-muted/30" : "hover:bg-muted/30"
                      )}
                    >
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer"
                          onClick={() => toggleExpand(ticket.id)}
                          aria-label={isOpen ? "طي" : "توسيع"}
                        >
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {new Date(ticket.createdAt).toLocaleString("ar-EG", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="p-2">{ticket.cashier.fullName}</td>
                      <td className="p-2">{ticket.items.length} خدمة</td>
                      <td className="p-2 font-medium">
                        <MoneyCell amount={ticket.total} />
                      </td>
                      {isAdmin && (
                        <td className="p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                            onClick={() => setDeleting(ticket)}
                            aria-label="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>,
                    isOpen && (
                      <tr key={`${ticket.id}-detail`} className="bg-muted/10 border-b">
                        <td colSpan={isAdmin ? 6 : 5} className="px-4 py-3">
                          <div className="space-y-1.5 ms-6">
                            {ticket.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span>{item.worker.name}</span>
                                  <span>·</span>
                                  <span>{item.service.title}</span>
                                </div>
                                <MoneyCell amount={item.priceSnapshot} />
                              </div>
                            ))}
                            {ticket.note && (
                              <p className="text-xs text-muted-foreground pt-1.5 border-t border-border/40 mt-1.5">
                                ملاحظة: {ticket.note}
                              </p>
                            )}
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

      <TicketForm
        open={formOpen}
        onOpenChange={setFormOpen}
        workers={workers}
        services={services}
        onSuccess={refresh}
      />

      {isAdmin && (
        <ConfirmDialog
          open={!!deleting}
          onOpenChange={(v) => { if (!v) setDeleting(null); }}
          title="حذف المعاملة"
          description={
            deleting
              ? `هل أنت متأكد من حذف هذه المعاملة بإجمالي ${deleting.total} ج.م؟ لا يمكن التراجع عن هذا الإجراء.`
              : ""
          }
          onConfirm={handleDelete}
          isPending={isDeleting}
          destructive
        />
      )}
    </>
  );
}
