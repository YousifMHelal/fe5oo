"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function getLogs(from?: Date, to?: Date) {
  await requireRole("ADMIN");
  return prisma.auditLog.findMany({
    where:
      from && to ? { createdAt: { gte: from, lte: to } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}
