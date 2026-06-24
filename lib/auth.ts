import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Get session in a server component or server action. Redirects to /login if not authenticated. */
export async function session() {
  const s = await auth();
  if (!s?.user) redirect("/login");
  return s;
}

/** Require a specific role. Throws a 403-like redirect if the role doesn't match. */
export async function requireRole(role: "ADMIN" | "CASHIER") {
  const s = await session();
  if (s.user.role !== role) {
    throw new Error("غير مصرح");
  }
  return s;
}
