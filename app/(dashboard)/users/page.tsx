import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function UsersPage() {
  return (
    <>
      <PageHeader title="المستخدمون" />
      <EmptyState title="قيد التطوير" description="إدارة المستخدمين ستكون جاهزة قريباً" />
    </>
  );
}
