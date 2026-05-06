import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateAppointmentStatus } from "@/services/appointments";
import {
  sendAppointmentStatusEmail,
  sendPostAppointmentEmail,
} from "@/services/email";
import { AppointmentStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
      emailLogs: true,
    },
  });

  if (!appointment) {
    return NextResponse.json(
      { error: "Cita no encontrada" },
      { status: 404 }
    );
  }

  if (
    session.user.role === "CLIENT" &&
    appointment.userId !== session.user.id
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(appointment);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { status, adminNotes } = body;

    const updateData: Record<string, unknown> = {};
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    let appointment;

    if (status) {
      appointment = await updateAppointmentStatus(
        params.id,
        status as AppointmentStatus
      );

      if (status === "CONFIRMED" || status === "CANCELLED") {
        await sendAppointmentStatusEmail(appointment, status);
      }

      if (status === "COMPLETED") {
        await sendPostAppointmentEmail(appointment);
      }
    }

    if (Object.keys(updateData).length > 0) {
      appointment = await prisma.appointment.update({
        where: { id: params.id },
        data: updateData,
        include: { user: true },
      });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Error al actualizar la cita" },
      { status: 500 }
    );
  }
}
