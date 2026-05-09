"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Post } from "@prisma/client";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "cuidados",
    metaTitle: "",
    metaDescription: "",
    coverImage: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
  });

  useEffect(() => {
    fetch("/api/posts?status=all")
      .then((r) => r.json())
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      excerpt: "",
      category: "cuidados",
      metaTitle: "",
      metaDescription: "",
      coverImage: "",
      status: "DRAFT",
    });
    setEditing(null);
  };

  const handleSubmit = async () => {
    try {
      const url = editing ? `/api/posts/${editing.slug}` : "/api/posts";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const post = await res.json();
        if (editing) {
          setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
        } else {
          setPosts((prev) => [post, ...prev]);
        }
        setDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deletePost = async (slug: string) => {
    if (!confirm("¿Eliminar este post?")) return;
    try {
      const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.slug !== slug));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-neutral-800 text-neutral-400",
      PUBLISHED: "bg-green-500/10 text-green-500",
      ARCHIVED: "bg-neutral-800 text-neutral-400",
    };
    const labels: Record<string, string> = {
      DRAFT: "Borrador",
      PUBLISHED: "Publicado",
      ARCHIVED: "Archivado",
    };
    return (
      <Badge variant="outline" className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Blog</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-white text-black hover:bg-neutral-200" onClick={resetForm} />}>
              <Plus className="h-4 w-4" />
              Nuevo post
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto border-neutral-800 bg-neutral-900 sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editing ? "Editar post" : "Nuevo post"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div>
                <Label>Contenido (HTML)</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  rows={10}
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div>
                <Label>Extracto</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, excerpt: e.target.value }))
                  }
                  rows={2}
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v: string | null) => {
                      if (v) setForm((f) => ({ ...f, category: v }));
                    }}
                  >
                    <SelectTrigger className="border-neutral-700 bg-neutral-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cuidados">Cuidados</SelectItem>
                      <SelectItem value="proceso">Proceso creativo</SelectItem>
                      <SelectItem value="noticias">Noticias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v: string | null) => {
                      if (v) setForm((f) => ({
                        ...f,
                        status: v as "DRAFT" | "PUBLISHED",
                      }));
                    }}
                  >
                    <SelectTrigger className="border-neutral-700 bg-neutral-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Borrador</SelectItem>
                      <SelectItem value="PUBLISHED">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Imagen de portada (URL)</Label>
                <Input
                  value={form.coverImage}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, coverImage: e.target.value }))
                  }
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div>
                <Label>Meta título (SEO)</Label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, metaTitle: e.target.value }))
                  }
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div>
                <Label>Meta descripción (SEO)</Label>
                <Textarea
                  value={form.metaDescription}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      metaDescription: e.target.value,
                    }))
                  }
                  rows={2}
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full bg-white text-black hover:bg-neutral-200"
              >
                {editing ? "Guardar cambios" : "Crear post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="py-8 text-center text-neutral-400">Cargando...</p>
      ) : posts.length === 0 ? (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="py-8 text-center text-neutral-400">
            No hay posts. Crea el primero.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="border-neutral-800 bg-neutral-900"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {post.title}
                    </span>
                    {statusBadge(post.status)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    {post.publishedAt && (
                      <span>
                        {format(new Date(post.publishedAt), "d MMM yyyy", {
                          locale: es,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" render={<a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" />}>
                      <Eye className="h-4 w-4 text-neutral-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(post);
                      setForm({
                        title: post.title,
                        content: post.content,
                        excerpt: post.excerpt || "",
                        category: post.category,
                        metaTitle: post.metaTitle || "",
                        metaDescription: post.metaDescription || "",
                        coverImage: post.coverImage || "",
                        status: post.status as "DRAFT" | "PUBLISHED",
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 text-neutral-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePost(post.slug)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
