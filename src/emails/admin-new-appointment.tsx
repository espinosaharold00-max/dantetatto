import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface Props {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  type: string;
  bodyArea: string;
  description: string;
}

const typeLabels: Record<string, string> = {
  CONSULTATION: "Consultoría inicial",
  CONTINUATION: "Sesión de continuación",
  TOUCH_UP: "Retoque",
};

export function AdminNewAppointment({
  clientName,
  clientEmail,
  clientPhone,
  date,
  time,
  type,
  bodyArea,
  description,
}: Props) {
  return (
    <EmailLayout preview={`Nueva cita registrada — ${clientName} el ${date}`}>
      <Heading style={heading}>Nueva cita registrada</Heading>
      <Text style={text}>
        Se ha registrado una nueva cita en el sistema. Aquí están los detalles:
      </Text>

      <Section style={detailsBox}>
        <Text style={sectionTitle}>Datos del cliente</Text>
        <Text style={detailLabel}>Nombre</Text>
        <Text style={detailValue}>{clientName}</Text>
        <Text style={detailLabel}>Email</Text>
        <Text style={detailValue}>{clientEmail}</Text>
        <Text style={detailLabel}>Teléfono</Text>
        <Text style={detailValue}>{clientPhone || "No proporcionado"}</Text>
      </Section>

      <Section style={detailsBox}>
        <Text style={sectionTitle}>Detalles de la cita</Text>
        <Text style={detailLabel}>Tipo de cita</Text>
        <Text style={detailValue}>{typeLabels[type] || type}</Text>
        <Text style={detailLabel}>Fecha</Text>
        <Text style={detailValue}>{date}</Text>
        <Text style={detailLabel}>Horario</Text>
        <Text style={detailValue}>{time}</Text>
        <Text style={detailLabel}>Zona del cuerpo</Text>
        <Text style={detailValue}>{bodyArea || "No especificada"}</Text>
        <Text style={detailLabel}>Descripción</Text>
        <Text style={detailValue}>{description || "Sin descripción"}</Text>
      </Section>

      <Text style={text}>
        La cita está <strong>pendiente de confirmación</strong>. Revísala en la
        agenda para confirmarla o contactar al cliente.
      </Text>

      <Section style={buttonContainer}>
        <Button
          style={button}
          href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://dantetatto.com"}/admin/agenda`}
        >
          Ver en agenda
        </Button>
      </Section>

      <Text style={signoff}>
        — Sistema Dante Tatto
      </Text>
    </EmailLayout>
  );
}

export default AdminNewAppointment;

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

const sectionTitle = {
  color: "#1a1a1a",
  fontSize: "14px",
  fontWeight: "700" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 12px",
  borderBottom: "1px solid #e5e5e5",
  paddingBottom: "8px",
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
