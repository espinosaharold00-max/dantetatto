import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poly Love — Tattoo After Care",
  description:
    "Productos profesionales para el cuidado de tu tatuaje: cremas, jabones, protectores y kits completos.",
};

async function getProducts(category?: string) {
  try {
    return await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

const categories = [
  { value: "", label: "Todos" },
  { value: "cremas", label: "Cremas" },
  { value: "jabones", label: "Jabones" },
  { value: "protectores", label: "Protectores" },
  { value: "kits", label: "Kits" },
];

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const products = await getProducts(searchParams.category);

  return (
    <div className="min-h-screen">
      <div className="bg-brand-pink py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-dark/50">
            タトゥー用品
          </p>
          <h1 className="text-4xl font-black text-brand-dark sm:text-5xl">
            Poly Love
          </h1>
          <p className="mt-1 text-sm font-medium uppercase tracking-widest text-brand-dark/60">
            Tattoo After Care
          </p>
          <p className="mx-auto mt-4 max-w-md text-brand-dark/70">
            Productos profesionales para el cuidado de tu tatuaje
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const isActive =
              searchParams.category === cat.value ||
              (!searchParams.category && !cat.value);
            return (
              <Link
                key={cat.value}
                href={
                  cat.value ? `/tienda?category=${cat.value}` : "/tienda"
                }
              >
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm ${
                    isActive
                      ? "bg-brand-pink text-white hover:bg-brand-pink-dark"
                      : "border-brand-pink/30 text-brand-pink hover:bg-brand-pink/10"
                  }`}
                >
                  {cat.label}
                </Badge>
              </Link>
            );
          })}
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-neutral-400">
              No hay productos disponibles en esta categoria.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Link key={product.id} href={`/tienda/${product.slug}`}>
                <Card className="group overflow-hidden border-neutral-800 bg-neutral-900 transition-all hover:border-brand-pink/40">
                  <div className="aspect-square overflow-hidden bg-neutral-800">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-neutral-600">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Badge
                      variant="outline"
                      className="mb-2 border-brand-pink/30 text-xs text-brand-pink"
                    >
                      {product.category}
                    </Badge>
                    <h3 className="mb-1 font-semibold text-white">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-brand-pink">
                        ${(product.price / 100).toFixed(2)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-neutral-500 line-through">
                          ${(product.compareAtPrice / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {product.stock <= 0 && (
                      <p className="mt-1 text-xs text-red-400">Agotado</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
