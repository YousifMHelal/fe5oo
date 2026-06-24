import { requireRoleForPage } from "@/lib/auth";
import { getUsers, getRoles } from "@/actions/users";
import { UsersClient } from "@/components/users/UsersClient";

export default async function UsersPage() {
  await requireRoleForPage("ADMIN");
  const [users, roles] = await Promise.all([getUsers(), getRoles()]);

  return <UsersClient users={users} roles={roles} />;
}
