import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const item = await prisma.portfolioItem.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating portfolio item:", error);
    return NextResponse.json(
      { error: "Error al actualizar el item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    await prisma.portfolioItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting portfolio item:", error);
    return NextResponse.json(
      { error: "Error al eliminar el item" },
      { status: 500 }
    );
  }
}
