import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  const where = productId ? { productId } : {};

  const movements = await prisma.stockMovement.findMany({
    where,
    include: { product: { select: { id: true, name: true, images: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(movements);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { productId, type, quantity, unitCost, note } = body;

    if (!productId || !type || !quantity) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity: parseInt(quantity),
          unitCost: unitCost ? Math.round(parseFloat(unitCost) * 100) : null,
          note: note || null,
        },
        include: { product: { select: { id: true, name: true, images: true } } },
      });

      const stockDelta = type === "IN" ? parseInt(quantity) : type === "OUT" ? -parseInt(quantity) : 0;

      if (stockDelta !== 0) {
        await tx.product.update({
          where: { id: productId },
          data: { stock: { increment: stockDelta } },
        });
      }

      if (type === "ADJUSTMENT") {
        await tx.product.update({
          where: { id: productId },
          data: { stock: parseInt(quantity) },
        });
      }

      if (unitCost && type === "IN") {
        await tx.product.update({
          where: { id: productId },
          data: { costPrice: Math.round(parseFloat(unitCost) * 100) },
        });
      }

      return movement;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating stock movement:", error);
    return NextResponse.json({ error: "Error al registrar movimiento" }, { status: 500 });
  }
}
