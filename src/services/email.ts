import { resend, FROM_EMAIL } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { EmailType } from "@prisma/client";
import { AppointmentConfirmation } from "@/emails/appointment-confirmation";
import { AppointmentReminder } from "@/emails/appointment-reminder";
import { AppointmentStatusUpdate } from "@/emails/appointment-status";
import { OrderConfirmation } from "@/emails/order-confirmation";
import { PostAppointment } from "@/emails/post-appointment";
import { format } from "date-fns";
import { es } from "date-fns/locale";

async function logEmail(data: {
  to: string;
  type: EmailType;
  subject: string;
  resendId?: string;
  appointmentId?: string;
  orderId?: string;
  error?: string;
}) {
  return prisma.emailLog.create({ data });
}

export async function sendAppointmentConfirmation(appointment: {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  type: string;
  user: { name: string | null; email: string };
}) {
  const subject = "Confirmación de tu cita — Dante Tatto";
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: appointment.user.email,
      subject,
      react: AppointmentConfirmation({
        clientName: appointment.user.name || "Cliente",
        date: format(appointment.date, "EEEE d 'de' MMMM, yyyy", {
          locale: es,
        }),
        time: `${format(appointment.startTime, "HH:mm")} - ${format(appointment.endTime, "HH:mm")}`,
        type: appointment.type,
      }),
    });

    await logEmail({
      to: appointment.user.email,
      type: "APPOINTMENT_CONFIRMATION",
      subject,
      resendId: result.data?.id,
      appointmentId: appointment.id,
    });
  } catch (error) {
    await logEmail({
      to: appointment.user.email,
      type: "APPOINTMENT_CONFIRMATION",
      subject,
      appointmentId: appointment.id,
      error: (error as Error).message,
    });
  }
}

export async function sendAppointmentReminder(
  appointment: {
    id: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    user: { name: string | null; email: string };
  },
  hoursBeforeLabel: string
) {
  const emailType: EmailType =
    hoursBeforeLabel === "48h"
      ? "APPOINTMENT_REMINDER_48H"
      : "APPOINTMENT_REMINDER_2H";
  const subject = `Recordatorio: Tu cita es ${hoursBeforeLabel === "48h" ? "en 2 días" : "en 2 horas"} — Dante Tatto`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: appointment.user.email,
      subject,
      react: AppointmentReminder({
        clientName: appointment.user.name || "Cliente",
        date: format(appointment.date, "EEEE d 'de' MMMM, yyyy", {
          locale: es,
        }),
        time: `${format(appointment.startTime, "HH:mm")} - ${format(appointment.endTime, "HH:mm")}`,
        reminderType: hoursBeforeLabel,
      }),
    });

    await logEmail({
      to: appointment.user.email,
      type: emailType,
      subject,
      resendId: result.data?.id,
      appointmentId: appointment.id,
    });
  } catch (error) {
    await logEmail({
      to: appointment.user.email,
      type: emailType,
      subject,
      appointmentId: appointment.id,
      error: (error as Error).message,
    });
  }
}

export async function sendAppointmentStatusEmail(
  appointment: {
    id: string;
    date: Date;
    startTime: Date;
    user: { name: string | null; email: string };
  },
  newStatus: "CONFIRMED" | "CANCELLED"
) {
  const emailType: EmailType =
    newStatus === "CONFIRMED"
      ? "APPOINTMENT_CONFIRMED"
      : "APPOINTMENT_CANCELLED";
  const subject =
    newStatus === "CONFIRMED"
      ? "¡Tu cita ha sido confirmada! — Dante Tatto"
      : "Tu cita ha sido cancelada — Dante Tatto";

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: appointment.user.email,
      subject,
      react: AppointmentStatusUpdate({
        clientName: appointment.user.name || "Cliente",
        date: format(appointment.date, "EEEE d 'de' MMMM, yyyy", {
          locale: es,
        }),
        time: format(appointment.startTime, "HH:mm"),
        status: newStatus,
      }),
    });

    await logEmail({
      to: appointment.user.email,
      type: emailType,
      subject,
      resendId: result.data?.id,
      appointmentId: appointment.id,
    });
  } catch (error) {
    await logEmail({
      to: appointment.user.email,
      type: emailType,
      subject,
      appointmentId: appointment.id,
      error: (error as Error).message,
    });
  }
}

export async function sendPostAppointmentEmail(appointment: {
  id: string;
  user: { name: string | null; email: string };
}) {
  const subject =
    "¡Gracias por visitarnos! Cuida tu nuevo tatuaje — Dante Tatto";

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: appointment.user.email,
      subject,
      react: PostAppointment({
        clientName: appointment.user.name || "Cliente",
      }),
    });

    await logEmail({
      to: appointment.user.email,
      type: "POST_APPOINTMENT",
      subject,
      resendId: result.data?.id,
      appointmentId: appointment.id,
    });
  } catch (error) {
    await logEmail({
      to: appointment.user.email,
      type: "POST_APPOINTMENT",
      subject,
      appointmentId: appointment.id,
      error: (error as Error).message,
    });
  }
}

export async function sendOrderConfirmationEmail(order: {
  id: string;
  total: number;
  user: { name: string | null; email: string };
  items: { product: { name: string }; quantity: number; price: number }[];
}) {
  const subject = "Confirmación de pedido — Dante Tatto";

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.user.email,
      subject,
      react: OrderConfirmation({
        clientName: order.user.name || "Cliente",
        orderId: order.id,
        total: order.total,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
      }),
    });

    await logEmail({
      to: order.user.email,
      type: "ORDER_CONFIRMATION",
      subject,
      resendId: result.data?.id,
      orderId: order.id,
    });
  } catch (error) {
    await logEmail({
      to: order.user.email,
      type: "ORDER_CONFIRMATION",
      subject,
      orderId: order.id,
      error: (error as Error).message,
    });
  }
}
