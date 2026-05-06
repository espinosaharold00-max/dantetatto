import { Heading, Section, Text, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface Props {
  clientName: string;
  orderId: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
}

export function OrderConfirmation({
  clientName,
  orderId,
  total,
  items,
}: Props) {
  return (
    <EmailLayout preview={`Pedido #${orderId.slice(-8)} confirmado`}>
      <Heading style={heading}>¡Pedido confirmado!</Heading>
      <Text style={text}>Hola {clientName},</Text>
      <Text style={text}>
        Tu pedido ha sido procesado exitosamente. Aquí está el resumen:
      </Text>

      <Text style={orderNumber}>Pedido #{orderId.slice(-8).toUpperCase()}</Text>

      <Section style={itemsContainer}>
        {items.map((item, index) => (
          <Row key={index} style={itemRow}>
            <Column style={itemName}>
              {item.name} × {item.quantity}
            </Column>
            <Column style={itemPrice}>
              ${(item.price * item.quantity / 100).toFixed(2)}
            </Column>
          </Row>
        ))}
        <Row style={totalRow}>
          <Column style={totalLabel}>Total</Column>
          <Column style={totalValue}>${(total / 100).toFixed(2)}</Column>
        </Row>
      </Section>

      <Text style={text}>
        Te notificaremos cuando tu pedido sea enviado con el número de
        seguimiento.
      </Text>

      <Text style={signoff}>
        ¡Gracias por tu compra!
        <br />— Dante Tatto
      </Text>
    </EmailLayout>
  );
}

export default OrderConfirmation;

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

const orderNumber = {
  color: "#1a1a1a",
  fontSize: "14px",
  fontWeight: "600" as const,
  backgroundColor: "#f0f0f0",
  padding: "8px 16px",
  borderRadius: "4px",
  display: "inline-block" as const,
  margin: "0 0 16px",
};

const itemsContainer = {
  backgroundColor: "#f8f8f8",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "8px 0 16px",
};

const itemRow = {
  padding: "8px 0",
  borderBottom: "1px solid #e5e5e5",
};

const itemName = {
  color: "#333333",
  fontSize: "14px",
};

const itemPrice = {
  color: "#1a1a1a",
  fontSize: "14px",
  fontWeight: "600" as const,
  textAlign: "right" as const,
};

const totalRow = {
  padding: "12px 0 0",
};

const totalLabel = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "700" as const,
};

const totalValue = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "700" as const,
  textAlign: "right" as const,
};

const signoff = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "16px 0 0",
};
