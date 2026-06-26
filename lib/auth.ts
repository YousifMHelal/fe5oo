import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Get session in a server component or server action. Redirects to /login if not authenticated. */
export async function session() {
  const s = await auth();
  if (!s?.user) redirect("/login");
  return s;
}

/** Require a specific role in a SERVER ACTION. Throws on mismatch (propagates as error to client). */
export async function requireRole(role: "ADMIN" | "CASHIER") {
  const s = await session();
  if (s.user.role !== role) {
    throw new Error("غير مصرح");
  }
  return s;
}

/** Require a specific role on a PAGE. Redirects to /overview on mismatch. */
export async function requireRoleForPage(role: "ADMIN" | "CASHIER") {
  const s = await session();
  if (s.user.role !== role) {
    redirect("/overview");
  }
  return s;
}
