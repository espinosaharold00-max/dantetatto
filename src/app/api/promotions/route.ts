import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(promotions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      name,
      description,
      type,
      value,
      code,
      startDate,
      endDate,
      minPurchase,
      maxUses,
      productIds,
    } = body;

    if (!name || !type || value == null || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (type !== "PERCENTAGE" && type !== "FIXED_AMOUNT") {
      return NextResponse.json(
        { error: "Tipo de promoción inválido" },
        { status: 400 }
      );
    }

    if (code) {
      const existing = await prisma.promotion.findUnique({ where: { code } });
      if (existing) {
        return NextResponse.json(
          { error: "El código ya existe" },
          { status: 409 }
        );
      }
    }

    const promotion = await prisma.promotion.create({
      data: {
        name,
        description: description || null,
        type,
        value: parseInt(value),
        code: code || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        minPurchase: minPurchase ? parseInt(minPurchase) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        productIds: productIds || [],
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error("Error creating promotion:", error);
    return NextResponse.json(
      { error: "Error al crear la promoción" },
      { status: 500 }
    );
  }
}
