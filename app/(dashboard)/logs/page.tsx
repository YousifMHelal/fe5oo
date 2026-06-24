import { requireRoleForPage } from "@/lib/auth";
import { getLogs } from "@/actions/logs";
import { LogsClient } from "@/components/logs/LogsClient";
import { resolvePeriod, isPeriodKey } from "@/lib/period";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function LogsPage({ searchParams }: PageProps) {
  await requireRoleForPage("ADMIN");
  const params = await searchParams;
  const period = isPeriodKey(params.period ?? "") ? (params.period as string) : "30d";
  const { from, to } = resolvePeriod(period);

  const logs = await getLogs(from, to);

  return <LogsClient logs={logs} />;
}
