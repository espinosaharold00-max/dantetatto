import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
  });

  if (!appointment) {
    return NextResponse.json(
      { error: "Cita no encontrada" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const { totalPrice, deposit } = body;

    const updateData: Record<string, unknown> = {};

    if (totalPrice !== undefined) {
      if (typeof totalPrice !== "number" || totalPrice < 0) {
        return NextResponse.json(
          { error: "totalPrice debe ser un número >= 0" },
          { status: 400 }
        );
      }
      updateData.totalPrice = totalPrice;
    }

    if (deposit !== undefined) {
      if (typeof deposit !== "number" || deposit < 0) {
        return NextResponse.json(
          { error: "deposit debe ser un número >= 0" },
          { status: 400 }
        );
      }
      updateData.deposit = deposit;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Debe enviar al menos totalPrice o deposit" },
        { status: 400 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating price:", error);
    return NextResponse.json(
      { error: "Error al actualizar el precio" },
      { status: 500 }
    );
  }
}
