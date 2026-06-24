import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="ملفي الشخصي" />
      <EmptyState title="قيد التطوير" description="إعدادات الحساب ستكون جاهزة قريباً" />
    </>
  );
}
