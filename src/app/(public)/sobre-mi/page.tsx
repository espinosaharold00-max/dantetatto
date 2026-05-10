import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Conoce la historia detrás de Dante Tattoo. Arte, pasión y compromiso con cada pieza.",
};

async function getAboutData() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "about" },
    });
    return setting ? JSON.parse(setting.value) : null;
  } catch {
    return null;
  }
}

export default async function SobreMiPage() {
  const data = await getAboutData();

  const title = data?.title || "Sobre el artista";
  const subtitle = data?.subtitle || "Dante Tattoo — Since 2017";
  const paragraph1 =
    data?.paragraph1 ||
    "Bienvenido a Dante Tattoo, donde cada trazo tiene un propósito y cada pieza cuenta una historia. Mi filosofía es simple: hacemos amigos, no clientes.";
  const paragraph2 =
    data?.paragraph2 ||
    "Desde mis primeros trazos supe que el tatuaje era más que tinta en la piel — es una conversación entre artista y persona, un acto de confianza que se transforma en arte permanente.";
  const paragraph3 =
    data?.paragraph3 ||
    "Cada sesión es única porque cada persona es única. Me tomo el tiempo necesario para entender tu visión, tu historia y lo que quieres expresar. No me interesa hacer tatuajes rápidos — me interesa crear piezas que te hagan sonreír cada vez que las veas.";
  const enfoque =
    data?.enfoque ||
    "Trabajo diversos estilos: realismo, blackwork, tradicional, neotradicional, lettering y diseños personalizados. Pero más allá del estilo, lo que me define es la atención al detalle y el compromiso con la calidad.";
  const estudio =
    data?.estudio ||
    "El estudio es un espacio diseñado para que te sientas cómodo desde el momento en que entras. Limpieza, higiene y los más altos estándares de seguridad son la base de todo lo que hacemos.";
  const estudioDetalle =
    data?.estudioDetalle ||
    "Usamos tintas premium, equipos de primera línea y seguimos estrictamente los protocolos de esterilización. Tu seguridad y comodidad son nuestra prioridad absoluta.";
  const artistPhotoUrl = data?.artistPhotoUrl || "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid items-start gap-12 md:grid-cols-2">
        <div className="sticky top-24">
          <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-800">
            {artistPhotoUrl ? (
              <img
                src={artistPhotoUrl}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-neutral-400">
                Foto del artista
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-amber">
            {subtitle}
          </span>
          <h1 className="mb-6 mt-2 text-4xl font-bold text-white">{title}</h1>

          <div className="space-y-4 text-neutral-400">
            <p>{paragraph1}</p>
            <p>{paragraph2}</p>
            <p>{paragraph3}</p>

            <h2 className="pt-4 text-2xl font-bold text-white">Mi enfoque</h2>
            <p>{enfoque}</p>

            <h2 className="pt-4 text-2xl font-bold text-white">El estudio</h2>
            <p>{estudio}</p>
            <p>{estudioDetalle}</p>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              href="/agenda"
              className={cn(
                buttonVariants(),
                "gap-2 bg-white text-black hover:bg-neutral-200"
              )}
            >
              <Calendar className="h-5 w-5" />
              Agendar cita
            </Link>
            <Link
              href="/tienda"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "gap-2 border-neutral-700 text-neutral-300"
              )}
            >
              Tienda
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
