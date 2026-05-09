import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email y código son requeridos" },
        { status: 400 }
      );
    }

    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
        expires: { gt: new Date() },
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Código inválido o expirado" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
