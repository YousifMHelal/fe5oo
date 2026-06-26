import { session } from "@/lib/auth";
import { getTickets, getActiveWorkersAndServices } from "@/actions/tickets";
import { TransactionsClient } from "@/components/tickets/TransactionsClient";
import { resolvePeriod, isPeriodKey } from "@/lib/period";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const s = await session();
  const params = await searchParams;
  const period = isPeriodKey(params.period ?? "") ? (params.period as string) : "today";
  const { from, to } = resolvePeriod(period);

  const [tickets, { workers, services }] = await Promise.all([
    getTickets(from, to),
    getActiveWorkersAndServices(),
  ]);

  const isAdmin = s.user.role === "ADMIN";

  return (
    <TransactionsClient
      tickets={tickets}
      workers={workers}
      services={services}
      isAdmin={isAdmin}
    />
  );
}
