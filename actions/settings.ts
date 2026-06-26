"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, session } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { settingSchema } from "@/lib/validators";

export async function getSettings() {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    shopName: map.shopName ?? "",
    phone: map.phone ?? "",
    address: map.address ?? "",
  };
}

export async function updateSettings(input: unknown) {
  const s = await requireRole("ADMIN");
  const data = settingSchema.parse(input);

  const before = await getSettings();

  await prisma.$transaction([
    prisma.setting.upsert({ where: { key: "shopName" }, update: { value: data.shopName }, create: { key: "shopName", value: data.shopName } }),
    prisma.setting.upsert({ where: { key: "phone" }, update: { value: data.phone ?? "" }, create: { key: "phone", value: data.phone ?? "" } }),
    prisma.setting.upsert({ where: { key: "address" }, update: { value: data.address ?? "" }, create: { key: "address", value: data.address ?? "" } }),
  ]);

  await logAudit({
    actorId: s.user.id,
    actorName: s.user.fullName,
    action: "UPDATE",
    entity: "Setting",
    summaryAr: "حدّث إعدادات المتجر",
    before,
    after: data,
  });

  revalidatePath("/settings");
  return { ok: true };
}
