import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
  });

  if (!post) return {};

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || "",
      images: post.ogImage || post.coverImage ? [post.ogImage || post.coverImage!] : [],
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
  });

  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: post.authorName || "Dante Tatto",
    },
    image: post.coverImage,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <Link
            href="/blog"
            className="mb-4 inline-block text-sm text-neutral-400 hover:text-white"
          >
            &larr; Volver al blog
          </Link>
          <div className="mb-3 flex items-center gap-3">
            <Badge variant="outline">{post.category}</Badge>
            {post.publishedAt && (
              <span className="text-sm text-neutral-500">
                {format(post.publishedAt, "d 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-white">{post.title}</h1>
          {post.authorName && (
            <p className="mt-2 text-neutral-400">
              Por {post.authorName}
            </p>
          )}
        </div>

        {post.coverImage && (
          <div className="mb-8 overflow-hidden rounded-xl">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-neutral-300 prose-a:text-amber-400 prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </>
  );
}
