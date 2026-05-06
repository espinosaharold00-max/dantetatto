import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ step: "findUser", error: "User not found", email });
    }

    if (!user.password) {
      return NextResponse.json({ step: "checkPassword", error: "User has no password" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ step: "compare", error: "Password mismatch", hashPreview: user.password.substring(0, 20) });
    }

    return NextResponse.json({
      status: "ok",
      message: "Login would succeed",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    return NextResponse.json({ step: "exception", error: String(error) }, { status: 500 });
  }
}
