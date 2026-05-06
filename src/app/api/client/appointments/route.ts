import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: session.user.id },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { date: "desc" },
    });

    const result = appointments.map((appointment) => {
      const totalPaid = appointment.payments.reduce(
        (sum, p) => sum + p.amount,
        0
      );
      const totalPrice = appointment.totalPrice || 0;
      const deposit = appointment.deposit || 0;
      const remaining = totalPrice - totalPaid;

      return {
        ...appointment,
        paymentSummary: {
          totalPrice,
          deposit,
          totalPaid,
          remaining: remaining > 0 ? remaining : 0,
          fullyPaid: totalPrice > 0 && remaining <= 0,
        },
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching client appointments:", error);
    return NextResponse.json(
      { error: "Error al obtener las citas" },
      { status: 500 }
    );
  }
}
