import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda — Productos de cuidado",
  description:
    "Productos profesionales para el cuidado de tu tatuaje: cremas, jabones, protectores y kits completos.",
};

async function getProducts(category?: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && { category }),
    },
    orderBy: { createdAt: "desc" },
  });
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">Tienda</h1>
        <p className="mt-2 text-neutral-400">
          Productos profesionales para el cuidado de tu tatuaje
        </p>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={
              cat.value ? `/tienda?category=${cat.value}` : "/tienda"
            }
          >
            <Badge
              variant={
                searchParams.category === cat.value ||
                (!searchParams.category && !cat.value)
                  ? "default"
                  : "outline"
              }
              className="cursor-pointer px-4 py-2 text-sm"
            >
              {cat.label}
            </Badge>
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-neutral-400">
            No hay productos disponibles en esta categoría.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} href={`/tienda/${product.slug}`}>
              <Card className="group overflow-hidden border-neutral-800 bg-neutral-900 transition-colors hover:border-neutral-700">
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
                  <Badge variant="outline" className="mb-2 text-xs">
                    {product.category}
                  </Badge>
                  <h3 className="mb-1 font-semibold text-white">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">
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
  );
}
