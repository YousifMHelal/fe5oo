import { session } from "@/lib/auth";
import { getOverviewStats } from "@/lib/queries/overview";
import { OverviewClient } from "@/components/overview/OverviewClient";
import { PageHeader } from "@/components/shared/PageHeader";
import { resolvePeriod, isPeriodKey } from "@/lib/period";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function OverviewPage({ searchParams }: PageProps) {
  await session();
  const params = await searchParams;
  const period = isPeriodKey(params.period ?? "") ? (params.period as string) : "today";
  const { from, to } = resolvePeriod(period);

  const stats = await getOverviewStats(from, to);

  return (
    <>
      <PageHeader title="نظرة عامة" />
      <OverviewClient stats={stats} period={period} />
    </>
  );
}
