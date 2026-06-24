import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function LogsPage() {
  return (
    <>
      <PageHeader title="سجل العمليات" />
      <EmptyState title="قيد التطوير" description="سجل المراجعة سيكون جاهزاً قريباً" />
    </>
  );
}
