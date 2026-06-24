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

  const adminUser = await prisma.user.upsert({
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

  // ── Workers ──────────────────────────────────────────────────────────────
  const workerData = [
    { name: "أحمد محمد", phone: "01012345678" },
    { name: "محمود علي", phone: "01123456789" },
    { name: "عمر حسن", phone: "01234567890" },
    { name: "كريم سامي", phone: "01098765432" },
    { name: "يوسف عادل", phone: "01187654321" },
    { name: "علي رضا", phone: "01276543210" },
  ];

  const workers = await Promise.all(
    workerData.map((w) =>
      prisma.worker.upsert({
        where: { id: w.name }, // will not match, falls through to create
        update: {},
        create: w,
      }).catch(() => prisma.worker.create({ data: w }))
    )
  );

  console.log(`✓ ${workers.length} Workers`);

  // ── Services ─────────────────────────────────────────────────────────────
  const serviceData = [
    { title: "حلاقة شعر", price: 80 },
    { title: "حلاقة لحية", price: 50 },
    { title: "حلاقة شعر + لحية", price: 120 },
    { title: "تصفيف شعر", price: 60 },
    { title: "قص أطفال", price: 60 },
    { title: "حمام زيت", price: 100 },
    { title: "كيراتين", price: 250 },
    { title: "صبغة شعر", price: 200 },
  ];

  const services = await Promise.all(
    serviceData.map((s) => prisma.service.create({ data: s }))
  );

  console.log(`✓ ${services.length} Services`);

  // ── Settings ─────────────────────────────────────────────────────────────
  const settings = [
    { key: "shopName", value: "fe5oo BARBERSHOP" },
    { key: "shopPhone", value: "01000000000" },
    { key: "address", value: "القاهرة، مصر" },
  ];

  await Promise.all(
    settings.map((s) =>
      prisma.setting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: s,
      })
    )
  );

  console.log("✓ Settings");

  // ── Sample Tickets (last 30 days) ─────────────────────────────────────────
  const now = new Date();

  function randomDaysAgo(max: number): Date {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * max));
    d.setHours(
      8 + Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 60)
    );
    return d;
  }

  function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  for (let i = 0; i < 30; i++) {
    const worker1 = pick(workers);
    const service1 = pick(services);
    const itemCount = Math.random() > 0.6 ? 2 : 1;
    const worker2 = pick(workers);
    const service2 = pick(services);

    const items = [{ workerId: worker1.id, serviceId: service1.id, priceSnapshot: service1.price }];
    if (itemCount === 2) {
      items.push({ workerId: worker2.id, serviceId: service2.id, priceSnapshot: service2.price });
    }

    const total = items.reduce((s, it) => s + it.priceSnapshot, 0);

    await prisma.ticket.create({
      data: {
        total,
        cashierId: adminUser.id,
        createdAt: randomDaysAgo(30),
        items: { create: items },
      },
    });
  }

  console.log("✓ 30 sample Tickets");
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
