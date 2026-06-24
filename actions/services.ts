"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { serviceSchema } from "@/lib/validators";

export async function createService(input: unknown) {
  const s = await requireRole("ADMIN");
  const data = serviceSchema.parse(input);

  const service = await prisma.service.create({ data });

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "CREATE",
    entity: "Service",
    entityId: service.id,
    summaryAr: `أضاف خدمة: ${service.title}`,
    after: { title: service.title, price: service.price },
  });

  revalidatePath("/services");
  return { ok: true, id: service.id };
}

export async function updateService(id: string, input: unknown) {
  const s = await requireRole("ADMIN");
  const data = serviceSchema.parse(input);

  const before = await prisma.service.findUniqueOrThrow({ where: { id } });
  const service = await prisma.service.update({ where: { id }, data });

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "UPDATE",
    entity: "Service",
    entityId: id,
    summaryAr: `عدّل خدمة: ${service.title}`,
    before: { title: before.title, price: before.price },
    after: { title: service.title, price: service.price },
  });

  revalidatePath("/services");
  return { ok: true };
}

export async function deleteService(id: string) {
  const s = await requireRole("ADMIN");

  const service = await prisma.service.findUniqueOrThrow({ where: { id } });

  // Soft-delete if referenced by any ticket items; hard-delete otherwise
  const refCount = await prisma.ticketItem.count({ where: { serviceId: id } });

  if (refCount > 0) {
    await prisma.service.update({ where: { id }, data: { isActive: false } });
    await logAudit({
      actorId: s.user.id,
      actorName: s.user.fullName,
      action: "DELETE",
      entity: "Service",
      entityId: id,
      summaryAr: `أوقف خدمة: ${service.title} (مرتبطة بـ ${refCount} معاملة)`,
      before: { title: service.title, price: service.price, isActive: true },
      after: { title: service.title, price: service.price, isActive: false },
    });
  } else {
    await prisma.service.delete({ where: { id } });
    await logAudit({
      actorId: s.user.id,
      actorName: s.user.fullName,
      action: "DELETE",
      entity: "Service",
      entityId: id,
      summaryAr: `حذف خدمة: ${service.title}`,
      before: { title: service.title, price: service.price },
    });
  }

  revalidatePath("/services");
  return { ok: true };
}

export async function getServices() {
  return prisma.service.findMany({ orderBy: { createdAt: "desc" } });
}
