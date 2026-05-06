import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { createAppointment } from "@/services/appointments";
import { sendAppointmentConfirmation } from "@/services/email";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const where: Record<string, unknown> = {};

  if (session.user.role === "CLIENT") {
    where.userId = session.user.id;
  }

  if (start && end) {
    where.date = {
      gte: new Date(start),
      lte: new Date(end),
    };
  }

  const appointments = await prisma.appointment.findMany({
    where,
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
    },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = appointmentSchema.parse(body);

    let userId: string;
    const session = await auth();

    if (session?.user) {
      userId = session.user.id;
    } else {
      let user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        const tempPassword = await bcrypt.hash(
          Math.random().toString(36).slice(-8),
          12
        );
        user = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: tempPassword,
            role: "CLIENT",
          },
        });
      }

      userId = user.id;
    }

    const appointment = await createAppointment({
      userId,
      type: data.type,
      date: data.date,
      startTime: data.startTime,
      description: data.description,
      bodyArea: data.bodyArea,
      referenceImageUrl: data.referenceImageUrl,
    });

    await sendAppointmentConfirmation(appointment);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error },
        { status: 400 }
      );
    }
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Error al crear la cita" },
      { status: 500 }
    );
  }
}
