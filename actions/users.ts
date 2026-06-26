"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createUserSchema, updateUserSchema } from "@/lib/validators";

export async function createUser(input: unknown) {
  const s = await requireRole("ADMIN");
  const data = createUserSchema.parse(input);

  const existing = await prisma.user.findUnique({ where: { username: data.username } });
  if (existing) throw new Error("اسم المستخدم مستخدم بالفعل");

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      username: data.username,
      fullName: data.fullName,
      passwordHash,
      roleId: data.roleId,
    },
    include: { role: true },
  });

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "CREATE",
    entity: "User",
    entityId: user.id,
    summaryAr: `أضاف مستخدماً: ${user.username} (${user.role.nameAr})`,
    after: { username: user.username, fullName: user.fullName, role: user.role.key },
  });

  revalidatePath("/users");
  return { ok: true, id: user.id };
}

export async function updateUser(id: string, input: unknown) {
  const s = await requireRole("ADMIN");
  const data = updateUserSchema.parse(input);

  // Guard: can't deactivate the last active ADMIN
  if (!data.isActive) {
    const role = await prisma.role.findFirst({ where: { id: data.roleId, key: "ADMIN" } });
    if (role) {
      const activeAdmins = await prisma.user.count({
        where: { role: { key: "ADMIN" }, isActive: true, NOT: { id } },
      });
      if (activeAdmins === 0) throw new Error("لا يمكن إلغاء تفعيل آخر مدير نشط");
    }
  }

  const before = await prisma.user.findUniqueOrThrow({ where: { id }, include: { role: true } });
  const user = await prisma.user.update({
    where: { id },
    data: { fullName: data.fullName, roleId: data.roleId, isActive: data.isActive },
    include: { role: true },
  });

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "UPDATE",
    entity: "User",
    entityId: id,
    summaryAr: `عدّل بيانات مستخدم: ${user.username}`,
    before: { fullName: before.fullName, role: before.role.key, isActive: before.isActive },
    after: { fullName: user.fullName, role: user.role.key, isActive: user.isActive },
  });

  revalidatePath("/users");
  return { ok: true };
}

export async function resetPassword(id: string, newPassword: string) {
  const s = await requireRole("ADMIN");
  if (newPassword.length < 6) throw new Error("كلمة المرور لا تقل عن 6 أحرف");

  const user = await prisma.user.findUniqueOrThrow({ where: { id } });
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "UPDATE",
    entity: "User",
    entityId: id,
    summaryAr: `أعاد تعيين كلمة مرور: ${user.username}`,
  });

  revalidatePath("/users");
  return { ok: true };
}

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { role: true },
  });
}

export async function getRoles() {
  return prisma.role.findMany({ orderBy: { key: "asc" } });
}
