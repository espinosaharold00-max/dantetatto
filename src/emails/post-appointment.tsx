import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface Props {
  clientName: string;
}

export function PostAppointment({ clientName }: Props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dantetatto.com";

  return (
    <EmailLayout preview="¡Gracias por visitarnos! Cuida tu nuevo tatuaje">
      <Heading style={heading}>
        ¡Gracias por tu visita, {clientName}!
      </Heading>
      <Text style={text}>
        Esperamos que estés feliz con tu nuevo tatuaje. Fue un placer
        trabajar contigo — recuerda, aquí{" "}
        <strong>hacemos amigos, no clientes</strong>.
      </Text>

      <Section style={careBox}>
        <Text style={careTitle}>Cuidados de tu tatuaje:</Text>
        <Text style={careText}>
          1. Retira el vendaje después de 2-3 horas
          <br />
          2. Lava suavemente con jabón neutro
          <br />
          3. Aplica crema hidratante sin fragancia 2-3 veces al día
          <br />
          4. NO rasques, NO expongas al sol directo
          <br />
          5. Evita piscinas y mar por 2 semanas
        </Text>
      </Section>

      <Text style={text}>
        Tenemos productos especializados para el cuidado de tu tatuaje:
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={`${siteUrl}/tienda`}>
          Ver productos de cuidado
        </Button>
      </Section>

      <Section style={reviewSection}>
        <Text style={reviewText}>
          ¿Te gustó la experiencia? Tu opinión nos ayuda a crecer:
        </Text>
        <Button style={reviewButton} href={`${siteUrl}/resena`}>
          Dejar una reseña
        </Button>
      </Section>

      <Text style={signoff}>
        ¡Nos vemos en la próxima!
        <br />— Dante Tatto
      </Text>
    </EmailLayout>
  );
}

export default PostAppointment;

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

const careBox = {
  backgroundColor: "#f0f7f0",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  borderLeft: "4px solid #22c55e",
};

const careTitle = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "700" as const,
  margin: "0 0 8px",
};

const careText = {
  color: "#333333",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "20px 0",
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

const reviewSection = {
  backgroundColor: "#fef9e7",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const reviewText = {
  color: "#333333",
  fontSize: "14px",
  margin: "0 0 12px",
};

const reviewButton = {
  backgroundColor: "#f59e0b",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600" as const,
  padding: "10px 20px",
  textDecoration: "none" as const,
};

const signoff = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "16px 0 0",
};
