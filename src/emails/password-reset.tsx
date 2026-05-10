import { Section, Text, Heading, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dantetattoo.com";

interface PasswordResetEmailProps {
  name: string;
  token: string;
}

export function PasswordResetEmail({ name, token }: PasswordResetEmailProps) {
  const resetUrl = `${baseUrl}/recuperar/${token}`;

  return (
    <EmailLayout preview="Restablecer tu contraseña — Dante Tattoo">
      <Heading style={heading}>Restablecer contraseña</Heading>
      <Text style={text}>
        Hola {name}, recibimos una solicitud para restablecer tu contraseña.
      </Text>
      <Text style={text}>
        Haz clic en el botón para crear una nueva contraseña:
      </Text>
      <Section style={buttonContainer}>
        <Link href={resetUrl} style={button}>
          Restablecer contraseña
        </Link>
      </Section>
      <Text style={text}>
        Este enlace expira en 1 hora.
      </Text>
      <Text style={smallText}>
        Si no solicitaste esto, puedes ignorar este mensaje. Tu contraseña no cambiará.
      </Text>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "24px",
  fontWeight: "700" as const,
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const text = {
  fontSize: "14px",
  color: "#333333",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const smallText = {
  fontSize: "12px",
  color: "#999999",
  margin: "16px 0 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#F0A030",
  color: "#1a1a1a",
  fontSize: "14px",
  fontWeight: "600" as const,
  textDecoration: "none" as const,
  padding: "12px 32px",
  borderRadius: "8px",
  display: "inline-block" as const,
};
