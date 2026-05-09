import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { resend, FROM_EMAIL } from "@/lib/email";
import { VerificationCodeEmail } from "@/emails/verification-code";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: "CLIENT",
      },
    });

    // Generate verification code
    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationToken.deleteMany({
      where: { identifier: data.email },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: data.email,
        token: code,
        expires,
      },
    });

    // Send verification email
    let emailSent = false;
    try {
      const { data: emailData, error: emailErr } = await resend.emails.send({
        from: FROM_EMAIL,
        to: data.email,
        subject: "Verifica tu cuenta — Dante Tatto",
        react: VerificationCodeEmail({ name: data.name, code }),
      });

      if (emailErr) {
        console.error("[register] Resend API error:", emailErr);
        await prisma.emailLog.create({
          data: {
            to: data.email,
            type: "EMAIL_VERIFICATION",
            subject: "Verifica tu cuenta — Dante Tatto",
            error: JSON.stringify(emailErr),
          },
        });
      } else {
        emailSent = true;
        await prisma.emailLog.create({
          data: {
            to: data.email,
            type: "EMAIL_VERIFICATION",
            subject: "Verifica tu cuenta — Dante Tatto",
            resendId: emailData?.id,
          },
        });
      }
    } catch (emailError) {
      console.error("[register] Email send error:", emailError);
      await prisma.emailLog.create({
        data: {
          to: data.email,
          type: "EMAIL_VERIFICATION",
          subject: "Verifica tu cuenta — Dante Tatto",
          error: String(emailError),
        },
      });
    }

    if (!emailSent) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
      await prisma.verificationToken.deleteMany({
        where: { identifier: data.email },
      });
    }

    return NextResponse.json(
      {
        user: { id: user.id, name: user.name, email: user.email },
        verified: !emailSent,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
