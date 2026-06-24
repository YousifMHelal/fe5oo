import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function WorkersPage() {
  return (
    <>
      <PageHeader title="العمال" />
      <EmptyState title="قيد التطوير" description="إدارة العمال ستكون جاهزة قريباً" />
    </>
  );
}
