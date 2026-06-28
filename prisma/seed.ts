import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(__dirname, "..", "fe5oo.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding fe5oo database…");

  // ── Roles ────────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { key: "ADMIN" },
    update: {},
    create: { key: "ADMIN", nameAr: "مدير" },
  });
  const cashierRole = await prisma.role.upsert({
    where: { key: "CASHIER" },
    update: {},
    create: { key: "CASHIER", nameAr: "كاشير" },
  });

  // ── Users ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin123", 12);
  const cashierHash = await bcrypt.hash("cashier123", 12);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: adminHash,
      fullName: "المدير العام",
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { username: "cashier" },
    update: {},
    create: {
      username: "cashier",
      passwordHash: cashierHash,
      fullName: "الكاشير",
      roleId: cashierRole.id,
    },
  });

  console.log("✓ Roles + Users");
  console.log("\n✅ Seed complete.");
  console.log("   Admin login:   admin / admin123");
  console.log("   Cashier login: cashier / cashier123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
