import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dantetattoo.com";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={`${baseUrl}/images/logo-cat.png`}
              width="60"
              height="42"
              alt="Dante Tattoo"
              style={logo}
            />
          </Section>

          <Section style={content}>{children}</Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Dante Tattoo — &quot;Haciendo amigos, no clientes&quot;
            </Text>
            <Text style={footerAddress}>
              {process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "Dirección del estudio"}
            </Text>
            <Section style={socialLinks}>
              <Link href="https://instagram.com/dantetatto" style={socialLink}>
                Instagram
              </Link>
              {" • "}
              <Link href="https://facebook.com/dantetatto" style={socialLink}>
                Facebook
              </Link>
              {" • "}
              <Link href="https://tiktok.com/@dantetatto" style={socialLink}>
                TikTok
              </Link>
            </Section>
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

const logo = {
  margin: "0 auto",
};

const content = {
  padding: "32px 24px",
};

const hr = {
  borderColor: "#e5e5e5",
  margin: "0",
};

const footer = {
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#666666",
  fontSize: "14px",
  fontWeight: "600" as const,
  margin: "0 0 4px",
};

const footerAddress = {
  color: "#999999",
  fontSize: "12px",
  margin: "0 0 12px",
};

const socialLinks = {
  marginBottom: "12px",
};

const socialLink = {
  color: "#1a1a1a",
  fontSize: "12px",
  textDecoration: "none" as const,
};

const footerSmall = {
  color: "#cccccc",
  fontSize: "11px",
  margin: "0",
};
