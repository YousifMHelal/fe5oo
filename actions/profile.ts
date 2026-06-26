"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { session } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { changePasswordSchema } from "@/lib/validators";

export async function changePassword(input: unknown) {
  const s = await session();
  const data = changePasswordSchema.parse(input);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: s.user.id } });

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) throw new Error("كلمة المرور الحالية غير صحيحة");

  const passwordHash = await bcrypt.hash(data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  await logAudit({
    actorId: user.id,
    actorName: user.fullName,
    action: "UPDATE",
    entity: "User",
    entityId: user.id,
    summaryAr: `غيّر كلمة مروره`,
  });

  return { ok: true };
}
