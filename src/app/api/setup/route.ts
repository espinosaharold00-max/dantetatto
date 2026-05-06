import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const info: Record<string, unknown> = {
    DATABASE_URL: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/\/\/.*@/, "//***@")
      : "NOT SET",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
    AUTH_SECRET: process.env.AUTH_SECRET ? "SET" : "NOT SET",
  };

  try {
    const userCount = await prisma.user.count();
    info.db_connected = true;
    info.user_count = userCount;

    const existing = await prisma.user.findUnique({
      where: { email: "admin@dantetattoo.com" },
    });
    info.admin_exists = !!existing;

    const hash = await bcrypt.hash("admin123456", 12);

    if (existing) {
      await prisma.user.update({
        where: { email: "admin@dantetattoo.com" },
        data: { password: hash, role: "ADMIN" },
      });
      info.action = "password_reset";
    } else {
      const user = await prisma.user.create({
        data: {
          name: "Dante Admin",
          email: "admin@dantetattoo.com",
          password: hash,
          role: "ADMIN",
        },
      });
      info.action = "created";
      info.user_id = user.id;
    }

    info.status = "ok";
    info.message = "Admin listo — admin@dantetattoo.com / admin123456";
    return NextResponse.json(info);
  } catch (error) {
    info.status = "error";
    info.error = String(error);
    info.stack = error instanceof Error ? error.stack?.split("\n").slice(0, 5) : undefined;
    return NextResponse.json(info, { status: 500 });
  }
}
