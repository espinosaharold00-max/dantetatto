import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.portfolioItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();

    const item = await prisma.portfolioItem.create({
      data: {
        title: body.title,
        description: body.description || null,
        imageUrl: body.imageUrl,
        category: body.category || null,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating portfolio item:", error);
    return NextResponse.json(
      { error: "Error al crear el item" },
      { status: 500 }
    );
  }
}
