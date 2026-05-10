import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL } from "@/lib/email";
import { OrderInvoice } from "@/emails/order-invoice";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
    const previousOrder = await prisma.order.findUnique({
      where: { id: params.id },
    });

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: body.status,
        trackingNumber: body.trackingNumber,
      },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (
      body.status === "PAID" &&
      previousOrder?.status !== "PAID"
    ) {
      const recipientEmail = order.customerEmail || order.user.email;
      const clientName = order.customerName || order.user.name || "Cliente";

      try {
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
      } catch (emailError) {
        console.error("Error sending invoice email:", emailError);
        await prisma.emailLog.create({
          data: {
            to: order.customerEmail || order.user.email,
            type: "ORDER_INVOICE",
            subject: `Factura ${order.invoiceNumber} — Dante Tattoo`,
            orderId: order.id,
            error: (emailError as Error).message,
          },
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Error al actualizar el pedido" },
      { status: 500 }
    );
  }
}
