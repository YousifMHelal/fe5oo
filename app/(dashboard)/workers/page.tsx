import { session } from "@/lib/auth";
import { getWorkers } from "@/actions/workers";
import { WorkersClient } from "@/components/workers/WorkersClient";

export default async function WorkersPage() {
  const s = await session();
  const workers = await getWorkers();
  const isAdmin = s.user.role === "ADMIN";

  return <WorkersClient workers={workers} isAdmin={isAdmin} />;
}
