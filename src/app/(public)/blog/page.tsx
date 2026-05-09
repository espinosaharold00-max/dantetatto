import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Consejos de cuidado, proceso creativo y noticias del estudio de tatuaje.",
};

async function getPosts(category?: string) {
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      ...(category && { category }),
    },
    orderBy: { publishedAt: "desc" },
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const posts = await getPosts(searchParams.category);

  const categories = [
    { value: "", label: "Todos" },
    { value: "cuidados", label: "Cuidados" },
    { value: "proceso", label: "Proceso creativo" },
    { value: "noticias", label: "Noticias" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">Blog</h1>
        <p className="mt-2 text-neutral-400">
          Consejos, historias y novedades del estudio
        </p>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value ? `/blog?category=${cat.value}` : "/blog"}
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

      {posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-neutral-400">No hay publicaciones aún.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="group overflow-hidden border-neutral-800 bg-neutral-900 transition-colors hover:border-neutral-700">
                <div className="aspect-video overflow-hidden bg-neutral-800">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-400">
                      Sin imagen
                    </div>
                  )}
                </div>
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    {post.publishedAt && (
                      <span className="text-xs text-neutral-400">
                        {format(post.publishedAt, "d MMM yyyy", {
                          locale: es,
                        })}
                      </span>
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="line-clamp-2 text-sm text-neutral-400">
                      {post.excerpt}
                    </p>
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
