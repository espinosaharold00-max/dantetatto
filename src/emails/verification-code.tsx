import { Section, Text, Heading } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface VerificationCodeEmailProps {
  name: string;
  code: string;
}

export function VerificationCodeEmail({ name, code }: VerificationCodeEmailProps) {
  return (
    <EmailLayout preview={`Tu código de verificación: ${code}`}>
      <Heading style={heading}>Verifica tu email</Heading>
      <Text style={text}>
        Hola {name}, bienvenido a Dante Tatto.
      </Text>
      <Text style={text}>
        Usa el siguiente código para verificar tu cuenta:
      </Text>
      <Section style={codeContainer}>
        <Text style={codeText}>{code}</Text>
      </Section>
      <Text style={text}>
        Este código expira en 15 minutos.
      </Text>
      <Text style={smallText}>
        Si no creaste una cuenta, puedes ignorar este mensaje.
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

const codeContainer = {
  backgroundColor: "#f5f5f5",
  borderRadius: "8px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const codeText = {
  fontSize: "36px",
  fontWeight: "700" as const,
  letterSpacing: "8px",
  color: "#1a1a1a",
  margin: "0",
  fontFamily: "monospace",
};
