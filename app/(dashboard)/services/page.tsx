import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function ServicesPage() {
  return (
    <>
      <PageHeader title="الخدمات" />
      <EmptyState title="قيد التطوير" description="إدارة الخدمات ستكون جاهزة قريباً" />
    </>
  );
}
