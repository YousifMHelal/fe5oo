import { session } from "@/lib/auth";
import { DashboardShell } from "@/components/shared/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await session();
  const user = {
    id: s.user.id,
    username: s.user.username,
    fullName: s.user.fullName,
    role: s.user.role,
  };

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
