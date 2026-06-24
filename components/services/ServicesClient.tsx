"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Plus } from "lucide-react";
import { deleteService } from "@/actions/services";
import { DataTable } from "@/components/shared/DataTable";
import { MoneyCell } from "@/components/shared/MoneyCell";
import { StatusPill } from "@/components/shared/StatusPill";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ServiceForm } from "@/components/services/ServiceForm";
import { Button } from "@/components/ui/button";

type Service = {
  id: string;
  title: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
};

interface ServicesClientProps {
  services: Service[];
  isAdmin: boolean;
}

export function ServicesClient({ services, isAdmin }: ServicesClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const refresh = useCallback(() => router.refresh(), [router]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setFormOpen(true);
  }

  function confirmDelete(s: Service) {
    setDeleting(s);
  }

  function handleDelete() {
    if (!deleting) return;
    startDelete(async () => {
      try {
        await deleteService(deleting.id);
        toast.success("تم حذف الخدمة");
        setDeleting(null);
        refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "title",
      header: "الخدمة",
      enableSorting: true,
    },
    {
      accessorKey: "price",
      header: "السعر",
      enableSorting: true,
      cell: ({ row }) => <MoneyCell amount={row.original.price} />,
    },
    {
      accessorKey: "isActive",
      header: "الحالة",
      enableSorting: true,
      cell: ({ row }) => <StatusPill active={row.original.isActive} />,
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الإضافة",
      enableSorting: true,
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("ar-EG"),
    },
    ...(isAdmin
      ? [
          {
            id: "actions",
            header: "",
            enableSorting: false,
            cell: ({ row }: { row: { original: Service } }) => (
              <div className="flex items-center gap-1 justify-end">
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
              </div>
            ),
          } satisfies ColumnDef<Service>,
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="الخدمات"
        action={
          isAdmin ? (
            <Button onClick={openCreate} className="cursor-pointer gap-2">
              <Plus className="h-4 w-4" />
              إضافة خدمة
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={services}
        searchPlaceholder="بحث في الخدمات..."
      />

      {isAdmin && (
        <>
          <ServiceForm
            open={formOpen}
            onOpenChange={setFormOpen}
            service={editing}
            onSuccess={refresh}
          />

          <ConfirmDialog
            open={!!deleting}
            onOpenChange={(v) => { if (!v) setDeleting(null); }}
            title="حذف الخدمة"
            description={
              deleting
                ? `هل أنت متأكد من حذف "${deleting.title}"؟ إذا كانت مرتبطة بمعاملات فستُوقَف بدلاً من حذفها.`
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
