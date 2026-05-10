import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key) {
    const setting = await prisma.siteSetting.findUnique({ where: { key } });
    return NextResponse.json(setting ? JSON.parse(setting.value) : null);
  }

  const settings = await prisma.siteSetting.findMany();
  const result: Record<string, unknown> = {};
  for (const s of settings) {
    result[s.key] = JSON.parse(s.value);
  }
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { key, value } = body;

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { error: "Error al guardar la configuración" },
      { status: 500 }
    );
  }
}
