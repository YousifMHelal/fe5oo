"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserForm } from "@/components/users/UserForm";
import { Button } from "@/components/ui/button";

type Role = { id: string; key: string; nameAr: string };
type UserRow = {
  id: string;
  username: string;
  fullName: string;
  roleId: string;
  isActive: boolean;
  createdAt: Date;
  role: Role;
};

interface UsersClientProps {
  users: UserRow[];
  roles: Role[];
}

export function UsersClient({ users, roles }: UsersClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const refresh = useCallback(() => router.refresh(), [router]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(u: UserRow) {
    setEditing(u);
    setFormOpen(true);
  }

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "username",
      header: "اسم المستخدم",
      enableSorting: true,
      cell: ({ row }) => (
        <span dir="ltr" className="font-mono text-sm">
          {row.original.username}
        </span>
      ),
    },
    {
      accessorKey: "fullName",
      header: "الاسم الكامل",
      enableSorting: true,
    },
    {
      id: "role",
      header: "الدور",
      enableSorting: false,
      cell: ({ row }) => <RoleBadge role={row.original.role.key} />,
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الإنشاء",
      enableSorting: true,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("ar-EG"),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }: { row: { original: UserRow } }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => openEdit(row.original)}
          aria-label="تعديل"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="المستخدمون"
        action={
          <Button onClick={openCreate} className="cursor-pointer gap-2">
            <Plus className="h-4 w-4" />
            إضافة مستخدم
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="بحث في المستخدمين..."
      />

      <UserForm
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
        roles={roles}
        onSuccess={refresh}
      />
    </>
  );
}
