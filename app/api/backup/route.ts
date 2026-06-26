import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import path from "path";
import fs from "fs";

function forbidden() {
  return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
}

export async function GET() {
  const s = await auth();
  if (!s?.user || (s.user as { role?: string }).role !== "ADMIN") return forbidden();

  const dbPath = path.resolve(process.cwd(), "fe5oo.db");
  if (!fs.existsSync(dbPath)) {
    return NextResponse.json({ error: "قاعدة البيانات غير موجودة" }, { status: 404 });
  }

  const buf = fs.readFileSync(dbPath);
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="fe5oo-backup-${date}.db"`,
    },
  });
}

export async function POST(req: NextRequest) {
  const s = await auth();
  if (!s?.user || (s.user as { role?: string }).role !== "ADMIN") return forbidden();

  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length < 100) {
    return NextResponse.json({ error: "الملف غير صالح" }, { status: 400 });
  }

  // Basic SQLite magic bytes check: first 16 bytes = "SQLite format 3\000"
  const magic = buf.slice(0, 16).toString("utf8");
  if (!magic.startsWith("SQLite format 3")) {
    return NextResponse.json({ error: "الملف ليس قاعدة بيانات SQLite صالحة" }, { status: 400 });
  }

  const dbPath = path.resolve(process.cwd(), "fe5oo.db");
  fs.writeFileSync(dbPath, buf);

  return NextResponse.json({ ok: true });
}
