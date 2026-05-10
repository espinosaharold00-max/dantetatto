import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL } from "@/lib/email";
import { PasswordResetEmail } from "@/emails/password-reset";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Delete any existing reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    });

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token,
        expires,
      },
    });

    let emailSent = false;
    try {
      const { data: emailData, error: emailErr } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: "Restablecer contraseña — Dante Tattoo",
        react: PasswordResetEmail({ name: user.name || "Usuario", token }),
      });

      if (emailErr) {
        console.error("[forgot-password] Resend API error:", emailErr);
        await prisma.emailLog.create({
          data: {
            to: email,
            type: "PASSWORD_RESET",
            subject: "Restablecer contraseña — Dante Tattoo",
            error: JSON.stringify(emailErr),
          },
        });
      } else {
        emailSent = true;
        await prisma.emailLog.create({
          data: {
            to: email,
            type: "PASSWORD_RESET",
            subject: "Restablecer contraseña — Dante Tattoo",
            resendId: emailData?.id,
          },
        });
      }
    } catch (emailError) {
      console.error("[forgot-password] Email send error:", emailError);
      await prisma.emailLog.create({
        data: {
          to: email,
          type: "PASSWORD_RESET",
          subject: "Restablecer contraseña — Dante Tattoo",
          error: String(emailError),
        },
      });
    }

    return NextResponse.json({ success: true, emailSent });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
