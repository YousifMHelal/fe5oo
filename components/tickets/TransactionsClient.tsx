"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Printer, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { deleteTicket } from "@/actions/tickets";
import { printReceipt } from "@/lib/print";
import { MoneyCell } from "@/components/shared/MoneyCell";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TicketForm, type TicketForEdit } from "@/components/tickets/TicketForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";

type Worker = { id: string; name: string };
type Service = { id: string; title: string; price: number };

type TicketItem = {
  id: string;
  workerId: string;
  serviceId: string;
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
  const [editingTicket, setEditingTicket] = useState<TicketForEdit | undefined>(undefined);
  const [deleting, setDeleting] = useState<Ticket | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [isDeleting, startDelete] = useTransition();

  const refresh = useCallback(() => router.refresh(), [router]);

  function openCreate() {
    setEditingTicket(undefined);
    setFormOpen(true);
  }

  function openEdit(ticket: Ticket) {
    setEditingTicket({
      id: ticket.id,
      note: ticket.note,
      items: ticket.items.map((i) => ({ workerId: i.workerId, serviceId: i.serviceId })),
    });
    setFormOpen(true);
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

  const totalCols = 5;

  return (
    <>
      <PageHeader
        title="المعاملات"
        action={
          <Button onClick={openCreate} className="cursor-pointer gap-2">
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
                <th
                  className="h-10 px-3 text-start align-middle font-semibold text-foreground cursor-pointer select-none"
                  onClick={() => toggleSort("createdAt")}
                >
                  <div className="flex items-center gap-1">التاريخ <SortIcon col="createdAt" /></div>
                </th>
                <th className="h-10 px-3 text-start align-middle font-semibold text-foreground">العامل</th>
                <th className="h-10 px-3 text-start align-middle font-semibold text-foreground">الخدمات</th>
                <th
                  className="h-10 px-3 text-start align-middle font-semibold text-foreground cursor-pointer select-none"
                  onClick={() => toggleSort("total")}
                >
                  <div className="flex items-center gap-1">الإجمالي <SortIcon col="total" /></div>
                </th>
                <th className="h-10 px-3 text-start align-middle font-medium text-foreground" />
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} className="p-0">
                    <EmptyState title="لا توجد معاملات" description="جرب تغيير كلمة البحث أو الفترة الزمنية" />
                  </td>
                </tr>
              ) : (
                sorted.map((ticket) => (
                  <tr key={ticket.id} className="border-b transition-colors duration-150 hover:bg-muted/30">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span>
                          {new Date(ticket.createdAt).toLocaleString("ar-EG", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                        {ticket.note && (
                          <span className="text-xs text-muted-foreground">ملاحظة: {ticket.note}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {[...new Set(ticket.items.map((i) => i.worker.name))].join("، ")}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {ticket.items.map((i) => i.service.title).join("، ")}
                    </td>
                    <td className="px-3 py-2 font-medium tabular-nums">
                      <MoneyCell amount={ticket.total} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          onClick={() =>
                            printReceipt({
                              id: ticket.id,
                              total: ticket.total,
                              note: ticket.note,
                              createdAt: ticket.createdAt,
                              cashierName: ticket.cashier.fullName,
                              items: ticket.items,
                            })
                          }
                          aria-label="طباعة الإيصال"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer"
                              onClick={() => openEdit(ticket)}
                              aria-label="تعديل"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                              onClick={() => setDeleting(ticket)}
                              aria-label="حذف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
        editTicket={editingTicket}
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
