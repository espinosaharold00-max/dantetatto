import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderInvoiceProps {
  clientName: string;
  invoiceNumber: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export function OrderInvoice({
  clientName,
  invoiceNumber,
  date,
  items,
  subtotal,
  discount,
  total,
}: OrderInvoiceProps) {
  return (
    <Html>
      <Head />
      <Preview>Factura {invoiceNumber} — Dante Tattoo</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>DANTE TATTOO</Text>
            <Text style={headerSub}>Factura de Compra</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hola {clientName},</Text>
            <Text style={paragraph}>
              Gracias por tu compra. Aquí tienes los detalles de tu pedido:
            </Text>

            <Section style={invoiceInfo}>
              <Row>
                <Column>
                  <Text style={infoLabel}>Factura:</Text>
                  <Text style={infoValue}>{invoiceNumber}</Text>
                </Column>
                <Column>
                  <Text style={infoLabel}>Fecha:</Text>
                  <Text style={infoValue}>{date}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={tableSection}>
              <Row style={tableHeader}>
                <Column style={{ width: "50%" }}>
                  <Text style={thText}>Producto</Text>
                </Column>
                <Column style={{ width: "15%", textAlign: "center" as const }}>
                  <Text style={thText}>Cant.</Text>
                </Column>
                <Column style={{ width: "17%", textAlign: "right" as const }}>
                  <Text style={thText}>Precio</Text>
                </Column>
                <Column style={{ width: "18%", textAlign: "right" as const }}>
                  <Text style={thText}>Total</Text>
                </Column>
              </Row>

              {items.map((item, i) => (
                <Row key={i} style={tableRow}>
                  <Column style={{ width: "50%" }}>
                    <Text style={tdText}>{item.name}</Text>
                  </Column>
                  <Column style={{ width: "15%", textAlign: "center" as const }}>
                    <Text style={tdText}>{item.quantity}</Text>
                  </Column>
                  <Column style={{ width: "17%", textAlign: "right" as const }}>
                    <Text style={tdText}>${(item.price / 100).toFixed(2)}</Text>
                  </Column>
                  <Column style={{ width: "18%", textAlign: "right" as const }}>
                    <Text style={tdText}>
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr style={divider} />

            <Section style={totalsSection}>
              <Row>
                <Column style={{ width: "70%" }}>
                  <Text style={totalLabel}>Subtotal:</Text>
                </Column>
                <Column style={{ width: "30%", textAlign: "right" as const }}>
                  <Text style={totalValue}>
                    USD ${(subtotal / 100).toFixed(2)}
                  </Text>
                </Column>
              </Row>
              {discount > 0 && (
                <Row>
                  <Column style={{ width: "70%" }}>
                    <Text style={totalLabel}>Descuento:</Text>
                  </Column>
                  <Column style={{ width: "30%", textAlign: "right" as const }}>
                    <Text style={{ ...totalValue, color: "#E8578A" }}>
                      -USD ${(discount / 100).toFixed(2)}
                    </Text>
                  </Column>
                </Row>
              )}
              <Row>
                <Column style={{ width: "70%" }}>
                  <Text style={grandTotalLabel}>Total:</Text>
                </Column>
                <Column style={{ width: "30%", textAlign: "right" as const }}>
                  <Text style={grandTotalValue}>
                    USD ${(total / 100).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          <Hr style={hrBottom} />

          <Section style={footer}>
            <Text style={footerText}>
              Dante Tattoo — &quot;Haciendo amigos, no clientes&quot;
            </Text>
            <Text style={footerSmall}>
              © {new Date().getFullYear()} Dante Tattoo. Todos los derechos
              reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f5f5f5",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden" as const,
};

const header = {
  backgroundColor: "#1a1a1a",
  padding: "24px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#F0A030",
  fontSize: "22px",
  fontWeight: "800" as const,
  letterSpacing: "2px",
  margin: "0",
};

const headerSub = {
  color: "#999",
  fontSize: "12px",
  margin: "4px 0 0",
  letterSpacing: "1px",
};

const content = { padding: "32px 24px" };

const greeting = {
  fontSize: "16px",
  fontWeight: "600" as const,
  color: "#333",
  margin: "0 0 8px",
};

const paragraph = {
  fontSize: "14px",
  color: "#666",
  margin: "0 0 24px",
};

const invoiceInfo = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
};

const infoLabel = {
  fontSize: "11px",
  color: "#999",
  margin: "0",
  textTransform: "uppercase" as const,
};

const infoValue = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#333",
  margin: "2px 0 0",
};

const tableSection = { marginBottom: "16px" };

const tableHeader = {
  borderBottom: "2px solid #eee",
};

const thText = {
  fontSize: "11px",
  fontWeight: "600" as const,
  color: "#999",
  textTransform: "uppercase" as const,
  margin: "0",
  padding: "8px 0",
};

const tableRow = { borderBottom: "1px solid #f0f0f0" };

const tdText = {
  fontSize: "13px",
  color: "#333",
  margin: "0",
  padding: "10px 0",
};

const divider = { borderColor: "#eee", margin: "0" };

const totalsSection = { padding: "16px 0" };

const totalLabel = {
  fontSize: "13px",
  color: "#666",
  margin: "4px 0",
};

const totalValue = {
  fontSize: "13px",
  color: "#333",
  margin: "4px 0",
};

const grandTotalLabel = {
  fontSize: "16px",
  fontWeight: "700" as const,
  color: "#333",
  margin: "8px 0 0",
};

const grandTotalValue = {
  fontSize: "18px",
  fontWeight: "700" as const,
  color: "#F0A030",
  margin: "8px 0 0",
};

const hrBottom = { borderColor: "#e5e5e5", margin: "0" };

const footer = {
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#666",
  fontSize: "14px",
  fontWeight: "600" as const,
  margin: "0 0 4px",
};

const footerSmall = {
  color: "#ccc",
  fontSize: "11px",
  margin: "0",
};
