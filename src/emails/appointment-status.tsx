import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface Props {
  clientName: string;
  date: string;
  time: string;
  status: "CONFIRMED" | "CANCELLED";
}

export function AppointmentStatusUpdate({
  clientName,
  date,
  time,
  status,
}: Props) {
  const isConfirmed = status === "CONFIRMED";

  return (
    <EmailLayout
      preview={
        isConfirmed
          ? "¡Tu cita ha sido confirmada!"
          : "Tu cita ha sido cancelada"
      }
    >
      <Heading style={heading}>
        {isConfirmed ? "✅ ¡Cita confirmada!" : "❌ Cita cancelada"}
      </Heading>
      <Text style={text}>Hola {clientName},</Text>

      {isConfirmed ? (
        <>
          <Text style={text}>
            ¡Excelente! Tu cita ha sido <strong>confirmada</strong> por el
            artista.
          </Text>
          <Section style={detailsBox}>
            <Text style={detailLabel}>Fecha</Text>
            <Text style={detailValue}>{date}</Text>
            <Text style={detailLabel}>Hora</Text>
            <Text style={detailValue}>{time}</Text>
          </Section>
          <Text style={text}>
            Te esperamos en el estudio. Si necesitas hacer algún cambio,
            contáctanos con al menos 24 horas de anticipación.
          </Text>
        </>
      ) : (
        <>
          <Text style={text}>
            Lamentablemente, tu cita del <strong>{date}</strong> a las{" "}
            <strong>{time}</strong> ha sido cancelada.
          </Text>
          <Text style={text}>
            Si deseas reagendar, puedes hacerlo directamente desde nuestra
            página:
          </Text>
          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://dantetattoo.com"}/agenda`}
            >
              Reagendar cita
            </Button>
          </Section>
        </>
      )}

      <Text style={signoff}>
        — Dante Tatto
      </Text>
    </EmailLayout>
  );
}

export default AppointmentStatusUpdate;

const heading = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "700" as const,
  margin: "0 0 16px",
};

const text = {
  color: "#333333",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 12px",
};

const detailsBox = {
  backgroundColor: "#f8f8f8",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
};

const detailLabel = {
  color: "#999999",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 2px",
};

const detailValue = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "600" as const,
  margin: "0 0 12px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#1a1a1a",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600" as const,
  padding: "12px 24px",
  textDecoration: "none" as const,
};

const signoff = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "16px 0 0",
};
