"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { session, requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createTicketSchema, updateTicketSchema } from "@/lib/validators";

export async function createTicket(input: unknown) {
  const s = await session();
  const data = createTicketSchema.parse(input);

  // Validate workers + services and snapshot prices
  const lineItems = await Promise.all(
    data.items.map(async (item) => {
      const worker = await prisma.worker.findUnique({ where: { id: item.workerId } });
      if (!worker || !worker.isActive) throw new Error("العامل غير موجود أو موقوف");

      const service = await prisma.service.findUnique({ where: { id: item.serviceId } });
      if (!service || !service.isActive) throw new Error("الخدمة غير موجودة أو موقوفة");

      return { workerId: item.workerId, serviceId: item.serviceId, priceSnapshot: service.price };
    })
  );

  const total = lineItems.reduce((sum, i) => sum + i.priceSnapshot, 0);

  const ticket = await prisma.ticket.create({
    data: {
      cashierId: s.user.id,
      total,
      note: data.note ?? null,
      items: { create: lineItems },
    },
    include: { items: { include: { service: true, worker: true } } },
  });

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "CREATE",
    entity: "Ticket",
    entityId: ticket.id,
    summaryAr: `أنشأ تذكرة بإجمالي ${total} ج.م`,
    after: { total, itemCount: lineItems.length },
  });

  revalidatePath("/transactions");
  return {
    ok: true,
    id: ticket.id,
    ticket: {
      id: ticket.id,
      total: ticket.total,
      note: ticket.note,
      createdAt: ticket.createdAt,
      items: ticket.items.map((i) => ({
        worker: { name: i.worker.name },
        service: { title: i.service.title },
        priceSnapshot: i.priceSnapshot,
      })),
    },
  };
}

export async function updateTicket(input: unknown) {
  const s = await requireRole("ADMIN");
  const data = updateTicketSchema.parse(input);

  const existing = await prisma.ticket.findUniqueOrThrow({
    where: { id: data.id },
    include: { items: true },
  });

  const lineItems = await Promise.all(
    data.items.map(async (item) => {
      const worker = await prisma.worker.findUnique({ where: { id: item.workerId } });
      if (!worker || !worker.isActive) throw new Error("العامل غير موجود أو موقوف");
      const service = await prisma.service.findUnique({ where: { id: item.serviceId } });
      if (!service || !service.isActive) throw new Error("الخدمة غير موجودة أو موقوفة");
      return { workerId: item.workerId, serviceId: item.serviceId, priceSnapshot: service.price };
    })
  );

  const total = lineItems.reduce((sum, i) => sum + i.priceSnapshot, 0);

  await prisma.$transaction([
    prisma.ticketItem.deleteMany({ where: { ticketId: data.id } }),
    prisma.ticket.update({
      where: { id: data.id },
      data: {
        total,
        note: data.note ?? null,
        items: { create: lineItems },
      },
    }),
  ]);

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "UPDATE",
    entity: "Ticket",
    entityId: data.id,
    summaryAr: `عدّل تذكرة من ${existing.total} إلى ${total} ج.م`,
    before: { total: existing.total, itemCount: existing.items.length },
    after: { total, itemCount: lineItems.length },
  });

  revalidatePath("/transactions");
  return { ok: true };
}

export async function deleteTicket(id: string) {
  const s = await requireRole("ADMIN");

  const ticket = await prisma.ticket.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });

  await prisma.ticket.delete({ where: { id } });

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "DELETE",
    entity: "Ticket",
    entityId: id,
    summaryAr: `حذف تذكرة بإجمالي ${ticket.total} ج.م`,
    before: { total: ticket.total, itemCount: ticket.items.length },
  });

  revalidatePath("/transactions");
  return { ok: true };
}

export async function getTickets(from?: Date, to?: Date) {
  return prisma.ticket.findMany({
    where:
      from && to
        ? { createdAt: { gte: from, lte: to } }
        : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      cashier: { select: { fullName: true, username: true } },
      items: {
        include: {
          worker: { select: { name: true } },
          service: { select: { title: true } },
        },
      },
    },
  });
}

export async function getActiveWorkersAndServices() {
  const [workers, services] = await Promise.all([
    prisma.worker.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { title: "asc" } }),
  ]);
  return { workers, services };
}
