import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const schedule = await prisma.scheduleConfig.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json(schedule);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { schedule } = body;

    for (const day of schedule) {
      await prisma.scheduleConfig.upsert({
        where: { dayOfWeek: day.dayOfWeek },
        update: {
          startTime: day.startTime,
          endTime: day.endTime,
          slotDuration: day.slotDuration,
          isActive: day.isActive,
        },
        create: {
          dayOfWeek: day.dayOfWeek,
          startTime: day.startTime,
          endTime: day.endTime,
          slotDuration: day.slotDuration,
          isActive: day.isActive,
        },
      });
    }

    const updated = await prisma.scheduleConfig.findMany({
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Error al actualizar horario" },
      { status: 500 }
    );
  }
}
