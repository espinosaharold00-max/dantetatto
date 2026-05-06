import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
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

  const payments = await prisma.appointmentPayment.findMany({
    where: { appointmentId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments);
}

export async function POST(
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
    const { amount, method, note } = body;

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser un número mayor a 0" },
        { status: 400 }
      );
    }

    if (method !== "CASH" && method !== "TRANSFER") {
      return NextResponse.json(
        { error: "Método de pago inválido. Debe ser CASH o TRANSFER" },
        { status: 400 }
      );
    }

    const payment = await prisma.appointmentPayment.create({
      data: {
        appointmentId: params.id,
        amount,
        method,
        note: note || null,
        confirmedBy: session.user.id,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Error al registrar el pago" },
      { status: 500 }
    );
  }
}
