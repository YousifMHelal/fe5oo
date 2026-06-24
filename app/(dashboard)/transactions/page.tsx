import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="المعاملات" />
      <EmptyState title="قيد التطوير" description="سجل المعاملات سيكون جاهزاً قريباً" />
    </>
  );
}
