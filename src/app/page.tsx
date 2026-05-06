import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Star, ArrowRight, Calendar, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

async function getPublicData() {
  const [reviews, portfolioItems] = await Promise.all([
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
  ]);
  return { reviews, portfolioItems };
}

export default async function HomePage() {
  const { reviews, portfolioItems } = await getPublicData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: process.env.NEXT_PUBLIC_BUSINESS_NAME || "Dante Tatto",
    description:
      "Estudio de tatuaje profesional. Haciendo amigos, no clientes.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://dantetatto.com",
    telephone: process.env.NEXT_PUBLIC_BUSINESS_PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS,
      addressLocality: process.env.NEXT_PUBLIC_BUSINESS_CITY,
      addressRegion: process.env.NEXT_PUBLIC_BUSINESS_STATE,
      postalCode: process.env.NEXT_PUBLIC_BUSINESS_ZIP,
      addressCountry: process.env.NEXT_PUBLIC_BUSINESS_COUNTRY || "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: process.env.NEXT_PUBLIC_BUSINESS_LAT,
      longitude: process.env.NEXT_PUBLIC_BUSINESS_LNG,
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
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-neutral-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-7xl">
            Haciendo amigos,
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              no clientes
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-400 sm:text-xl">
            Cada tatuaje cuenta una historia. Trabajamos contigo para crear
            piezas únicas que llevarás con orgullo toda la vida.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/agenda">
              <Button
                size="lg"
                className="gap-2 bg-white text-black hover:bg-neutral-200"
              >
                <Calendar className="h-5 w-5" />
                Agendar cita
              </Button>
            </Link>
            <Link href="/tienda">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-neutral-700 text-neutral-300 hover:bg-neutral-900"
              >
                <ShoppingBag className="h-5 w-5" />
                Tienda
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="bg-neutral-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Portfolio
            </h2>
            <p className="mt-2 text-neutral-400">
              Algunos de nuestros trabajos recientes
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
                    className="mb-4 flex aspect-[3/4] items-center justify-center break-inside-avoid rounded-lg bg-neutral-900"
                  >
                    <span className="text-sm text-neutral-600">
                      Portfolio {i + 1}
                    </span>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Sobre mí */}
      <section className="border-t border-neutral-800 bg-neutral-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-neutral-800">
              <span className="text-neutral-600">Foto del artista</span>
            </div>
            <div>
              <h2 className="mb-4 text-3xl font-bold text-white">
                Sobre el artista
              </h2>
              <p className="mb-4 text-neutral-400">
                Con años de experiencia en el arte del tatuaje, cada pieza que
                creo es una colaboración entre el artista y la persona. Mi
                filosofía es simple: aquí no tienes citas, tienes encuentros con
                un amigo.
              </p>
              <p className="mb-6 text-neutral-400">
                Especializado en diversos estilos, desde realismo hasta
                tradicional, me apasiona transformar tus ideas en arte
                permanente que refleje tu personalidad y tu historia.
              </p>
              <Link href="/sobre-mi">
                <Button
                  variant="outline"
                  className="gap-2 border-neutral-700 text-neutral-300"
                >
                  Conocer más
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="bg-neutral-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Lo que dicen nuestros amigos
            </h2>
            <p className="mt-2 text-neutral-400">
              Reseñas reales de personas reales
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
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-600"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mb-4 text-sm text-neutral-300">
                      &quot;{review.comment}&quot;
                    </p>
                    <p className="text-sm font-medium text-neutral-400">
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
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="mb-4 text-sm text-neutral-300">
                      &quot;Excelente experiencia. El mejor artista de la zona.
                      100% recomendado.&quot;
                    </p>
                    <p className="text-sm font-medium text-neutral-400">
                      — Cliente {i + 1}
                    </p>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="border-t border-neutral-800 bg-neutral-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            ¿Listo para tu próximo tatuaje?
          </h2>
          <p className="mb-8 text-neutral-400">
            Agenda tu consulta gratuita y platiquemos sobre tu idea. Sin
            compromiso, solo buena vibra.
          </p>
          <Link href="/agenda">
            <Button
              size="lg"
              className="gap-2 bg-white text-black hover:bg-neutral-200"
            >
              <Calendar className="h-5 w-5" />
              Agendar mi cita
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
