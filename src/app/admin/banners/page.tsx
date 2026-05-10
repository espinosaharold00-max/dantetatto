"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Upload } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  position: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    position: "home",
    sortOrder: "0",
  });

  useEffect(() => {
    fetch("/api/banners?active=false")
      .then((r) => r.json())
      .then(setBanners)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      position: "home",
      sortOrder: "0",
    });
    setEditing(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm((f) => ({ ...f, imageUrl: url }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const payload = {
      title: form.title,
      subtitle: form.subtitle || null,
      imageUrl: form.imageUrl,
      linkUrl: form.linkUrl || null,
      position: form.position,
      sortOrder: parseInt(form.sortOrder) || 0,
    };

    try {
      const url = editing ? `/api/banners/${editing.id}` : "/api/banners";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const banner = await res.json();
        if (editing) {
          setBanners((prev) =>
            prev.map((b) => (b.id === banner.id ? banner : b))
          );
        } else {
          setBanners((prev) => [banner, ...prev]);
        }
        setDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBanners((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("¿Eliminar este banner?")) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Banners</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                className="gap-2 bg-brand-pink text-white hover:bg-brand-pink-dark"
                onClick={resetForm}
              />
            }
          >
            <Plus className="h-4 w-4" />
            Nuevo banner
          </DialogTrigger>
          <DialogContent className="dark max-h-[90vh] overflow-y-auto border-neutral-800 bg-neutral-900">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editing ? "Editar banner" : "Nuevo banner"}
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
                <Label>Subtítulo</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subtitle: e.target.value }))
                  }
                  placeholder="Opcional"
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>

              <div>
                <Label>Imagen</Label>
                <div className="mt-2 flex items-center gap-3">
                  {form.imageUrl ? (
                    <div className="relative h-24 w-40 overflow-hidden rounded-lg border border-neutral-700">
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-neutral-700 px-4 py-3 text-neutral-400 transition-colors hover:border-brand-pink hover:text-brand-pink">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <span className="text-sm">Subiendo...</span>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">
                          {form.imageUrl ? "Cambiar imagen" : "Subir imagen"}
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <Label>Enlace (URL)</Label>
                <Input
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, linkUrl: e.target.value }))
                  }
                  placeholder="Opcional, ej: /tienda"
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Posición</Label>
                  <Select
                    value={form.position}
                    onValueChange={(v: string | null) => {
                      if (v) setForm((f) => ({ ...f, position: v }));
                    }}
                  >
                    <SelectTrigger className="border-neutral-700 bg-neutral-800">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="shop">Shop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Orden</Label>
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sortOrder: e.target.value }))
                    }
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-brand-pink text-white hover:bg-brand-pink-dark"
              >
                {editing ? "Guardar cambios" : "Crear banner"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="py-8 text-center text-neutral-400">Cargando...</p>
      ) : banners.length === 0 ? (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="py-8 text-center text-neutral-400">
            No hay banners. Crea el primero.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <Card key={banner.id} className="border-neutral-800 bg-neutral-900">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                        img
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {banner.title}
                      </span>
                      {!banner.isActive && (
                        <Badge
                          variant="outline"
                          className="text-xs text-neutral-400"
                        >
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                      {banner.subtitle && <span>{banner.subtitle}</span>}
                      <Badge variant="outline" className="text-xs">
                        {banner.position}
                      </Badge>
                      <span>Orden: {banner.sortOrder}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(banner)}
                    title={banner.isActive ? "Desactivar" : "Activar"}
                  >
                    {banner.isActive ? (
                      <Eye className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-neutral-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(banner);
                      setForm({
                        title: banner.title,
                        subtitle: banner.subtitle || "",
                        imageUrl: banner.imageUrl,
                        linkUrl: banner.linkUrl || "",
                        position: banner.position,
                        sortOrder: banner.sortOrder.toString(),
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 text-neutral-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBanner(banner.id)}
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
