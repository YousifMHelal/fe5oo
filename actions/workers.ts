"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { workerSchema } from "@/lib/validators";

export async function createWorker(input: unknown) {
  const s = await requireRole("ADMIN");
  const data = workerSchema.parse(input);

  const worker = await prisma.worker.create({ data });

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "CREATE",
    entity: "Worker",
    entityId: worker.id,
    summaryAr: `أضاف عاملاً: ${worker.name}`,
    after: { name: worker.name, phone: worker.phone },
  });

  revalidatePath("/workers");
  return { ok: true, id: worker.id };
}

export async function updateWorker(id: string, input: unknown) {
  const s = await requireRole("ADMIN");
  const data = workerSchema.parse(input);

  const before = await prisma.worker.findUniqueOrThrow({ where: { id } });
  const worker = await prisma.worker.update({ where: { id }, data });

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "UPDATE",
    entity: "Worker",
    entityId: id,
    summaryAr: `عدّل بيانات عامل: ${worker.name}`,
    before: { name: before.name, phone: before.phone },
    after: { name: worker.name, phone: worker.phone },
  });

  revalidatePath("/workers");
  return { ok: true };
}

export async function deleteWorker(id: string) {
  const s = await requireRole("ADMIN");

  const worker = await prisma.worker.findUniqueOrThrow({ where: { id } });

  const refCount = await prisma.ticketItem.count({ where: { workerId: id } });

  if (refCount > 0) {
    await prisma.worker.update({ where: { id }, data: { isActive: false } });
    await logAudit({
      actorId: s.user.id,
      actorName: s.user.fullName,
      action: "DELETE",
      entity: "Worker",
      entityId: id,
      summaryAr: `أوقف عاملاً: ${worker.name} (مرتبط بـ ${refCount} معاملة)`,
      before: { name: worker.name, isActive: true },
      after: { name: worker.name, isActive: false },
    });
  } else {
    await prisma.worker.delete({ where: { id } });
    await logAudit({
      actorId: s.user.id,
      actorName: s.user.fullName,
      action: "DELETE",
      entity: "Worker",
      entityId: id,
      summaryAr: `حذف عاملاً: ${worker.name}`,
      before: { name: worker.name, phone: worker.phone },
    });
  }

  revalidatePath("/workers");
  return { ok: true };
}

export async function getWorkers() {
  return prisma.worker.findMany({ orderBy: { createdAt: "desc" } });
}
