import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: {
        select: {
          appointments: true,
          orders: true,
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (format === "csv") {
    const csvHeader = "Nombre,Email,Teléfono,Citas,Pedidos,Registro\n";
    const csvRows = clients
      .map(
        (c) =>
          `"${c.name || ""}","${c.email}","${c.phone || ""}",${c._count.appointments},${c._count.orders},"${c.createdAt.toISOString()}"`
      )
      .join("\n");

    return new NextResponse(csvHeader + csvRows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=clientes.csv",
      },
    });
  }

  return NextResponse.json(clients);
}
