import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  const session = await auth();
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  const where: Record<string, unknown> = {};

  if (!isAdmin) {
    where.status = "PUBLISHED";
  } else if (status) {
    where.status = status;
  }

  if (category) where.category = category;

  const posts = await prisma.post.findMany({
    where,
    orderBy: { publishedAt: "desc" },
  });

  return NextResponse.json(posts);
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
    const data = postSchema.parse(body);

    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñ]+/g, "-")
      .replace(/^-|-$/g, "");

    const post = await prisma.post.create({
      data: {
        ...data,
        slug,
        status: data.status || "DRAFT",
        authorName: session.user.name || "Admin",
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error },
        { status: 400 }
      );
    }
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Error al crear el post" },
      { status: 500 }
    );
  }
}
