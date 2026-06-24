import { session } from "@/lib/auth";
import { getServices } from "@/actions/services";
import { ServicesClient } from "@/components/services/ServicesClient";

export default async function ServicesPage() {
  const s = await session();
  const services = await getServices();
  const isAdmin = s.user.role === "ADMIN";

  return <ServicesClient services={services} isAdmin={isAdmin} />;
}
