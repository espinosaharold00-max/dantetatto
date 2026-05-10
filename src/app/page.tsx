import Link from "next/link";
import Image from "next/image";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Star, ArrowRight, Calendar, ShoppingBag, Zap, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getPublicData() {
  try {
    const [reviews, portfolioItems, aboutSetting] = await Promise.all([
      prisma.review.findMany({
        where: { status: "APPROVED" },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.portfolioItem.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 8,
      }),
      prisma.siteSetting.findUnique({ where: { key: "about" } }),
    ]);
    const about = aboutSetting ? JSON.parse(aboutSetting.value) : null;
    return { reviews, portfolioItems, about };
  } catch {
    return { reviews: [], portfolioItems: [], about: null };
  }
}

export default async function HomePage() {
  const { reviews, portfolioItems, about } = await getPublicData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: "Dante Tattoo",
    description:
      "Estudio de tatuaje profesional. Haciendo amigos, no clientes.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://dantetattoo.com",
    telephone: process.env.NEXT_PUBLIC_BUSINESS_PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS,
      addressLocality: process.env.NEXT_PUBLIC_BUSINESS_CITY,
      addressRegion: process.env.NEXT_PUBLIC_BUSINESS_STATE,
      postalCode: process.env.NEXT_PUBLIC_BUSINESS_ZIP,
      addressCountry: process.env.NEXT_PUBLIC_BUSINESS_COUNTRY || "PA",
    },
    image: `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-image.jpg`,
    priceRange: "$$",
    aggregateRating:
      reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            ).toFixed(1),
            reviewCount: reviews.length,
          }
        : undefined,
  };

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-brand-amber">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-amber-light/40 via-transparent to-brand-amber-dark/30" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-dark to-transparent" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <Image src="/images/logo.png" alt="Dante Tattoo" width={280} height={280} className="mx-auto mb-6 rounded-full shadow-2xl ring-4 ring-brand-dark/10" priority />
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-brand-dark/80">
            Since 2017
          </p>
          <h1 className="mb-2 text-6xl font-black tracking-tight text-brand-dark sm:text-8xl">
            DANTE TATTOO
          </h1>
          <p className="mb-2 text-lg font-medium uppercase tracking-[0.2em] text-brand-dark/80 sm:text-xl">
            Estudio de Tatuaje
          </p>
          <p className="mx-auto mb-10 mt-6 max-w-xl text-lg text-brand-dark/80">
            Haciendo amigos, no clientes. Cada tatuaje cuenta una historia.
            Trabajamos contigo para crear piezas unicas que llevaras con orgullo.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/agenda"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 bg-brand-dark text-brand-amber hover:bg-brand-dark/90")}
            >
              <Calendar className="h-5 w-5" />
              Agendar cita
            </Link>
            <Link
              href="/tienda"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "gap-2 border-brand-dark/30 text-brand-dark hover:bg-brand-dark/10")}
            >
              <ShoppingBag className="h-5 w-5" />
              Tienda
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="bg-brand-dark py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 text-brand-amber" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-amber">
                Portfolio
              </span>
              <Zap className="h-5 w-5 text-brand-amber" />
            </div>
            <h2 className="text-3xl font-black text-brand-cream sm:text-4xl">
              Nuestro trabajo
            </h2>
            <p className="mt-2 text-neutral-400">
              タトゥースタジオ — Algunos de nuestros trabajos recientes
            </p>
          </div>

          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {portfolioItems.length > 0
              ? portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="mb-4 break-inside-avoid overflow-hidden rounded-lg"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))
              : Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="mb-4 flex aspect-[3/4] items-center justify-center break-inside-avoid rounded-lg border border-neutral-800 bg-neutral-900"
                  >
                    <span className="text-sm text-neutral-400">
                      Portfolio {i + 1}
                    </span>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Sobre mi */}
      <section className="border-t border-neutral-800 bg-neutral-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="aspect-square overflow-hidden rounded-2xl border border-brand-amber/20 bg-brand-dark">
              {about?.artistPhotoUrl ? (
                <img src={about.artistPhotoUrl} alt="Artista" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-neutral-400">Foto del artista</span>
              )}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-amber">
                {about?.subtitle || "Dante Tattoo — Since 2017"}
              </span>
              <h2 className="mb-4 mt-2 text-3xl font-black text-brand-cream">
                {about?.title || "Sobre el artista"}
              </h2>
              <p className="mb-4 text-neutral-400">
                {about?.homePreviewText || "Con años de experiencia en el arte del tatuaje, cada pieza que creo es una colaboración entre el artista y la persona. Mi filosofía es simple: aquí no tienes citas, tienes encuentros con un amigo."}
              </p>
              <p className="mb-6 text-neutral-400">
                {about?.homePreviewText2 || "Especializado en diversos estilos, desde realismo hasta tradicional, me apasiona transformar tus ideas en arte permanente que refleje tu personalidad y tu historia."}
              </p>
              <Link
                href="/sobre-mi"
                className={cn(buttonVariants({ variant: "outline" }), "gap-2 border-brand-amber/30 text-brand-amber hover:bg-brand-amber/10")}
              >
                Conocer más
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="bg-brand-dark py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-amber">
              Testimonios
            </span>
            <h2 className="mt-2 text-3xl font-black text-brand-cream sm:text-4xl">
              Lo que dicen nuestros amigos
            </h2>
            <p className="mt-2 text-neutral-400">
              Resenas reales de personas reales
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.length > 0
              ? reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-900 p-6"
                  >
                    <div className="mb-3 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-brand-amber text-brand-amber"
                              : "text-neutral-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mb-4 text-sm text-neutral-300">
                      &quot;{review.comment}&quot;
                    </p>
                    <p className="text-sm font-medium text-brand-amber/70">
                      — {review.user.name || "Cliente"}
                    </p>
                  </div>
                ))
              : Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-neutral-800 bg-neutral-900 p-6"
                  >
                    <div className="mb-3 flex gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className="h-4 w-4 fill-brand-amber text-brand-amber"
                        />
                      ))}
                    </div>
                    <p className="mb-4 text-sm text-neutral-300">
                      &quot;Excelente experiencia. El mejor artista de la zona.
                      100% recomendado.&quot;
                    </p>
                    <p className="text-sm font-medium text-brand-amber/70">
                      — Cliente {i + 1}
                    </p>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section className="border-t border-neutral-800 bg-neutral-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-brand-amber" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-amber">
                Ubicación
              </span>
            </div>
            <h2 className="text-3xl font-black text-brand-cream sm:text-4xl">
              Visítanos
            </h2>
            <p className="mt-2 text-neutral-400">
              Te esperamos en nuestro estudio
            </p>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="mx-auto max-w-xs overflow-hidden rounded-2xl">
              <Image
                src="/images/ubicacion.jpeg"
                alt="Ubicación del estudio Dante Tattoo"
                width={800}
                height={1000}
                quality={90}
                className="w-full rounded-2xl object-cover"
              />
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-brand-amber/10 p-3">
                    <MapPin className="h-6 w-6 text-brand-amber" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-white">Dirección</h3>
                    <p className="text-neutral-400">
                      Calle 50, Edificio Embassy Club,<br />
                      Planta Baja, Local 3<br />
                      Bella Vista, Ciudad de Panamá
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="https://maps.app.goo.gl/FC6Fcyh74FUXmPBq6"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "w-full gap-2 bg-brand-amber text-brand-dark hover:bg-brand-amber-dark")}
              >
                <MapPin className="h-5 w-5" />
                Abrir en Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-brand-amber py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="mb-2 text-sm text-brand-dark/70">タトゥースタジオ</p>
          <h2 className="mb-4 text-3xl font-black text-brand-dark sm:text-4xl">
            Listo para tu proximo tatuaje?
          </h2>
          <p className="mb-8 text-brand-dark/70">
            Agenda tu consulta gratuita y platiquemos sobre tu idea. Sin
            compromiso, solo buena vibra.
          </p>
          <Link
            href="/agenda"
            className={cn(buttonVariants({ size: "lg" }), "gap-2 bg-brand-dark text-brand-amber hover:bg-brand-dark/90")}
          >
            <Calendar className="h-5 w-5" />
            Agendar mi cita
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
