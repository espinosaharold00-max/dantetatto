import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.type !== undefined) data.type = body.type;
    if (body.value !== undefined) data.value = parseInt(body.value);
    if (body.code !== undefined) data.code = body.code || null;
    if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) data.endDate = new Date(body.endDate);
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.minPurchase !== undefined)
      data.minPurchase = body.minPurchase ? parseInt(body.minPurchase) : null;
    if (body.maxUses !== undefined)
      data.maxUses = body.maxUses ? parseInt(body.maxUses) : null;
    if (body.productIds !== undefined) data.productIds = body.productIds;

    const promotion = await prisma.promotion.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Error updating promotion:", error);
    return NextResponse.json(
      { error: "Error al actualizar la promoción" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    await prisma.promotion.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return NextResponse.json(
      { error: "Error al eliminar la promoción" },
      { status: 500 }
    );
  }
}
