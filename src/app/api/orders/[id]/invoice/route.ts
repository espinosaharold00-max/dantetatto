import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL } from "@/lib/email";
import { OrderInvoice } from "@/emails/order-invoice";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function POST(
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
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const recipientEmail = order.customerEmail || order.user.email;
    const clientName = order.customerName || order.user.name || "Cliente";

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Factura ${order.invoiceNumber || order.id.slice(-8).toUpperCase()} — Dante Tattoo`,
      react: OrderInvoice({
        clientName,
        invoiceNumber: order.invoiceNumber || order.id.slice(-8).toUpperCase(),
        date: format(order.createdAt, "d 'de' MMMM yyyy", { locale: es }),
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: order.subtotal,
        discount: order.discountAmount,
        total: order.total,
      }),
    });

    await prisma.emailLog.create({
      data: {
        to: recipientEmail,
        type: "ORDER_INVOICE",
        subject: `Factura ${order.invoiceNumber} — Dante Tattoo`,
        resendId: result.data?.id,
        orderId: order.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return NextResponse.json({ error: "Error al enviar la factura" }, { status: 500 });
  }
}
