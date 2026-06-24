import { prisma } from "@/lib/prisma";

interface AuditParams {
  actorId?: string | null;
  actorName: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN";
  entity: "Worker" | "Service" | "Ticket" | "User" | "Setting";
  entityId?: string | null;
  summaryAr: string;
  before?: object | null;
  after?: object | null;
}

export async function logAudit(params: AuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      actorName: params.actorName,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      summaryAr: params.summaryAr,
      before: params.before ? JSON.stringify(params.before) : null,
      after: params.after ? JSON.stringify(params.after) : null,
    },
  });
}
