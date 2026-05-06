import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: "admin@dantetattoo.com" },
    });

    const hash = await bcrypt.hash("admin123456", 12);

    if (existing) {
      await prisma.user.update({
        where: { email: "admin@dantetattoo.com" },
        data: { password: hash, role: "ADMIN" },
      });
      return NextResponse.json({
        status: "ok",
        action: "password_reset",
        email: "admin@dantetattoo.com",
        message: "Admin existe — contraseña reseteada a admin123456",
      });
    }

    const user = await prisma.user.create({
      data: {
        name: "Dante Admin",
        email: "admin@dantetattoo.com",
        password: hash,
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      status: "ok",
      action: "created",
      email: user.email,
      id: user.id,
      message: "Admin creado — admin@dantetattoo.com / admin123456",
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: String(error) },
      { status: 500 }
    );
  }
}
