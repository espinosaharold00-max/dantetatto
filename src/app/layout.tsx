import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Dante Tattoo — Haciendo amigos, no clientes",
    template: "%s | Dante Tattoo",
  },
  description:
    "Estudio de tatuaje profesional. Diseños únicos y personalizados. Agenda tu cita hoy.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://dantetattoo.com"
  ),
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Dante Tattoo",
    title: "Dante Tattoo — Haciendo amigos, no clientes",
    description:
      "Estudio de tatuaje profesional. Diseños únicos y personalizados.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dante Tattoo",
    description: "Haciendo amigos, no clientes",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-neutral-950 font-sans text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
