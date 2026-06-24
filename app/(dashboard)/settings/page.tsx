import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="الإعدادات" />
      <EmptyState title="قيد التطوير" description="إعدادات المتجر ستكون جاهزة قريباً" />
    </>
  );
}
