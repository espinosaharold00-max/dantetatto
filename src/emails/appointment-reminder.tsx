import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface Props {
  clientName: string;
  date: string;
  time: string;
  reminderType: string;
}

export function AppointmentReminder({
  clientName,
  date,
  time,
  reminderType,
}: Props) {
  const isUrgent = reminderType === "2h";

  return (
    <EmailLayout
      preview={`Recordatorio: tu cita es ${isUrgent ? "en 2 horas" : "en 2 días"}`}
    >
      <Heading style={heading}>
        {isUrgent ? "⏰ Tu cita es en 2 horas" : "📅 Tu cita es en 2 días"}
      </Heading>
      <Text style={text}>Hola {clientName},</Text>
      <Text style={text}>
        {isUrgent
          ? "Este es un recordatorio de que tu cita es MUY PRONTO. Asegúrate de estar listo(a)."
          : "Te recordamos que tienes una cita programada. Aquí están los detalles:"}
      </Text>

      <Section style={detailsBox}>
        <Text style={detailLabel}>Fecha</Text>
        <Text style={detailValue}>{date}</Text>
        <Text style={detailLabel}>Horario</Text>
        <Text style={detailValue}>{time}</Text>
      </Section>

      <Text style={text}>
        <strong>Recomendaciones antes de tu cita:</strong>
      </Text>
      <Text style={text}>
        • Descansa bien la noche anterior
        <br />
        • Hidrata bien la piel de la zona
        <br />
        • Come algo antes de venir
        <br />• Evita el alcohol 24 horas antes
      </Text>

      <Section style={buttonContainer}>
        <Button
          style={button}
          href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://dantetattoo.com"}/agenda`}
        >
          Ver mi cita
        </Button>
      </Section>

      <Text style={signoff}>
        ¡Te esperamos!
        <br />— Dante Tatto
      </Text>
    </EmailLayout>
  );
}

export default AppointmentReminder;

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
