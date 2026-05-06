import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blockSlot, removeBlockedSlot } from "@/services/appointments";

export async function GET() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const blocked = await prisma.blockedSlot.findMany({
    orderBy: { date: "asc" },
  });

  return NextResponse.json(blocked);
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
    const blocked = await blockSlot({
      date: new Date(body.date),
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      reason: body.reason,
      allDay: body.allDay,
    });

    return NextResponse.json(blocked, { status: 201 });
  } catch (error) {
    console.error("Error blocking slot:", error);
    return NextResponse.json(
      { error: "Error al bloquear horario" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  try {
    await removeBlockedSlot(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing blocked slot:", error);
    return NextResponse.json(
      { error: "Error al desbloquear horario" },
      { status: 500 }
    );
  }
}
