import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface Props {
  clientName: string;
  date: string;
  time: string;
  type: string;
}

const typeLabels: Record<string, string> = {
  CONSULTATION: "Consultoría inicial",
  CONTINUATION: "Sesión de continuación",
  TOUCH_UP: "Retoque",
};

export function AppointmentConfirmation({
  clientName,
  date,
  time,
  type,
}: Props) {
  return (
    <EmailLayout preview={`Tu cita ha sido registrada para el ${date}`}>
      <Heading style={heading}>¡Cita registrada!</Heading>
      <Text style={text}>Hola {clientName},</Text>
      <Text style={text}>
        Tu cita ha sido registrada exitosamente. Aquí están los detalles:
      </Text>

      <Section style={detailsBox}>
        <Text style={detailLabel}>Tipo de cita</Text>
        <Text style={detailValue}>{typeLabels[type] || type}</Text>
        <Text style={detailLabel}>Fecha</Text>
        <Text style={detailValue}>{date}</Text>
        <Text style={detailLabel}>Horario</Text>
        <Text style={detailValue}>{time}</Text>
      </Section>

      <Text style={text}>
        Tu cita está <strong>pendiente de confirmación</strong>. Te
        notificaremos cuando sea confirmada por el artista.
      </Text>

      <Text style={text}>
        Si necesitas cancelar o reagendar, responde a este correo o contáctanos
        directamente.
      </Text>

      <Section style={buttonContainer}>
        <Button
          style={button}
          href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://dantetatto.com"}/agenda`}
        >
          Ver mi reserva
        </Button>
      </Section>

      <Text style={signoff}>
        ¡Nos vemos pronto!
        <br />— Dante Tatto
      </Text>
    </EmailLayout>
  );
}

export default AppointmentConfirmation;

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
