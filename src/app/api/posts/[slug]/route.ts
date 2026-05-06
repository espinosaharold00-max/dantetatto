import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    return NextResponse.json(
      { error: "Post no encontrado" },
      { status: 404 }
    );
  }

  const session = await auth();
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  if (post.status !== "PUBLISHED" && !isAdmin) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
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

    const updateData: Record<string, unknown> = { ...body };
    if (body.status === "PUBLISHED" && !body.publishedAt) {
      updateData.publishedAt = new Date();
    }
    if (body.title) {
      updateData.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúñ]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    const post = await prisma.post.update({
      where: { slug: params.slug },
      data: updateData,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Error al actualizar el post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    await prisma.post.delete({ where: { slug: params.slug } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Error al eliminar el post" },
      { status: 500 }
    );
  }
}
