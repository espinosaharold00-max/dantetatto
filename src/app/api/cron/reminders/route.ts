import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAppointmentReminder } from "@/services/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const now = new Date();
    let remindersSent = 0;

    // --- 48h reminders: appointments 44-50 hours from now ---
    const min48 = new Date(now.getTime() + 44 * 60 * 60 * 1000);
    const max48 = new Date(now.getTime() + 50 * 60 * 60 * 1000);

    const appointments48 = await prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        startTime: {
          gte: min48,
          lte: max48,
        },
        emailLogs: {
          none: {
            type: "APPOINTMENT_REMINDER_48H",
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    for (const appointment of appointments48) {
      await sendAppointmentReminder(
        {
          id: appointment.id,
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          user: appointment.user,
        },
        "48h"
      );
      remindersSent++;
    }

    // --- 2h reminders: appointments 1.5-3 hours from now ---
    const min2 = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
    const max2 = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const appointments2 = await prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        startTime: {
          gte: min2,
          lte: max2,
        },
        emailLogs: {
          none: {
            type: "APPOINTMENT_REMINDER_2H",
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    for (const appointment of appointments2) {
      await sendAppointmentReminder(
        {
          id: appointment.id,
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          user: appointment.user,
        },
        "2h"
      );
      remindersSent++;
    }

    return NextResponse.json({
      ok: true,
      remindersSent,
      details: {
        reminders48h: appointments48.length,
        reminders2h: appointments2.length,
      },
    });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json(
      { error: "Error al enviar recordatorios" },
      { status: 500 }
    );
  }
}
