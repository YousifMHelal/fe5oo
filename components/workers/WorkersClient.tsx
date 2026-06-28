"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Plus, Banknote } from "lucide-react";
import { deleteWorker } from "@/actions/workers";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { WorkerForm } from "@/components/workers/WorkerForm";
import { ExpenseForm } from "@/components/workers/ExpenseForm";
import { Button } from "@/components/ui/button";

type Worker = {
  id: string;
  name: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
};

interface WorkersClientProps {
  workers: Worker[];
  isAdmin: boolean;
}

export function WorkersClient({ workers, isAdmin }: WorkersClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [deleting, setDeleting] = useState<Worker | null>(null);
  const [expenseWorker, setExpenseWorker] = useState<Worker | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const refresh = useCallback(() => router.refresh(), [router]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(w: Worker) {
    setEditing(w);
    setFormOpen(true);
  }

  function confirmDelete(w: Worker) {
    setDeleting(w);
  }

  function handleDelete() {
    if (!deleting) return;
    startDelete(async () => {
      try {
        await deleteWorker(deleting.id);
        toast.success("تم حذف العامل");
        setDeleting(null);
        refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  const columns: ColumnDef<Worker>[] = [
    {
      accessorKey: "name",
      header: "الاسم",
      enableSorting: true,
    },
    {
      accessorKey: "phone",
      header: "الهاتف",
      enableSorting: false,
      cell: ({ row }) => row.original.phone ?? "—",
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الإضافة",
      enableSorting: true,
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("ar-EG"),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }: { row: { original: Worker } }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-warning hover:text-warning"
            onClick={() => setExpenseWorker(row.original)}
            aria-label="تسجيل سلفة"
            title="سلفة / مصروف"
          >
            <Banknote className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => openEdit(row.original)}
                aria-label="تعديل"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                onClick={() => confirmDelete(row.original)}
                aria-label="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    } satisfies ColumnDef<Worker>,
  ];

  return (
    <>
      <PageHeader
        title="العمال"
        action={
          isAdmin ? (
            <Button onClick={openCreate} className="cursor-pointer gap-2">
              <Plus className="h-4 w-4" />
              إضافة عامل
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={workers}
        searchPlaceholder="بحث في العمال..."
      />

      <ExpenseForm
        open={!!expenseWorker}
        onOpenChange={(v) => { if (!v) setExpenseWorker(null); }}
        worker={expenseWorker}
        onSuccess={refresh}
        isAdmin={isAdmin}
      />

      {isAdmin && (
        <>
          <WorkerForm
            open={formOpen}
            onOpenChange={setFormOpen}
            worker={editing}
            onSuccess={refresh}
          />

          <ConfirmDialog
            open={!!deleting}
            onOpenChange={(v) => { if (!v) setDeleting(null); }}
            title="حذف العامل"
            description={
              deleting
                ? `هل أنت متأكد من حذف "${deleting.name}"؟ إذا كان مرتبطاً بمعاملات فسيُوقَف بدلاً من حذفه.`
                : ""
            }
            onConfirm={handleDelete}
            isPending={isDeleting}
            destructive
          />
        </>
      )}
    </>
  );
}
