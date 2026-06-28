"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { session } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { workerExpenseSchema } from "@/lib/validators";

export async function getWorkerExpenses(workerId: string) {
  await session(); // must be authenticated
  return prisma.workerExpense.findMany({
    where: { workerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createWorkerExpense(input: unknown) {
  const s = await session();
  const data = workerExpenseSchema.parse(input);

  const worker = await prisma.worker.findUniqueOrThrow({ where: { id: data.workerId } });

  const expense = await prisma.workerExpense.create({
    data: {
      workerId: data.workerId,
      amount: data.amount,
      note: data.note,
      recordedBy: s.user.fullName,
    },
  });

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "CREATE",
    entity: "WorkerExpense",
    entityId: expense.id,
    summaryAr: `سجّل سلفة ${data.amount} ج.م للعامل: ${worker.name}`,
    after: { workerId: data.workerId, amount: data.amount, note: data.note },
  });

  revalidatePath("/overview");
  return { ok: true, id: expense.id };
}

export async function deleteWorkerExpense(id: string) {
  const s = await session();
  // Only ADMIN can delete
  if (s.user.role !== "ADMIN") {
    throw new Error("غير مصرح");
  }

  const expense = await prisma.workerExpense.findUniqueOrThrow({
    where: { id },
    include: { worker: { select: { name: true } } },
  });

  await prisma.workerExpense.delete({ where: { id } });

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "DELETE",
    entity: "WorkerExpense",
    entityId: id,
    summaryAr: `حذف سلفة ${expense.amount} ج.م للعامل: ${expense.worker.name}`,
    before: { amount: expense.amount, note: expense.note },
  });

  revalidatePath("/overview");
  return { ok: true };
}
