import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const position = searchParams.get("position");
  const active = searchParams.get("active");

  const where: Record<string, unknown> = {};
  if (position) where.position = position;
  if (active !== "false") where.isActive = true;

  const banners = await prisma.banner.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(banners);
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

    const banner = await prisma.banner.create({
      data: {
        title: body.title,
        subtitle: body.subtitle || null,
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl || null,
        position: body.position || "home",
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Error al crear el banner" },
      { status: 500 }
    );
  }
}
