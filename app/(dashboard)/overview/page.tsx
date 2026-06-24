import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function OverviewPage() {
  return (
    <>
      <PageHeader title="نظرة عامة" />
      <EmptyState title="قيد التطوير" description="صفحة الإحصائيات ستكون جاهزة قريباً" />
    </>
  );
}
