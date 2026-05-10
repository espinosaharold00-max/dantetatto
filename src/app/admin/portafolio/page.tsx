"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, GripVertical } from "lucide-react";
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

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    sortOrder: "0",
  });

  const fetchItems = () => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", imageUrl: "", category: "", sortOrder: "0" });
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
      description: form.description || null,
      imageUrl: form.imageUrl,
      category: form.category || null,
      sortOrder: parseInt(form.sortOrder) || 0,
    };

    try {
      const url = editing ? `/api/portfolio/${editing.id}` : "/api/portfolio";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchItems();
        setDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (item: PortfolioItem) => {
    try {
      const res = await fetch(`/api/portfolio/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("¿Eliminar esta foto del portafolio?")) return;
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portafolio</h1>
          <p className="text-sm text-neutral-400">Administra las fotos de tu trabajo</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                className="gap-2 bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
                onClick={resetForm}
              />
            }
          >
            <Plus className="h-4 w-4" />
            Agregar foto
          </DialogTrigger>
          <DialogContent className="dark max-h-[90vh] overflow-y-auto border-neutral-800 bg-neutral-900">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editing ? "Editar foto" : "Agregar foto al portafolio"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Imagen</Label>
                <div className="mt-2 flex items-center gap-3">
                  {form.imageUrl ? (
                    <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-neutral-700">
                      <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-neutral-700 px-4 py-3 text-neutral-400 transition-colors hover:border-brand-amber hover:text-brand-amber">
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
                        <span className="text-sm">{form.imageUrl ? "Cambiar" : "Subir imagen"}</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-white">Título</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Diseño realista en brazo"
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>

              <div>
                <Label className="text-white">Descripción (opcional)</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Detalles del trabajo..."
                  rows={3}
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Categoría (opcional)</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="Ej: Realismo, Blackwork"
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
                <div>
                  <Label className="text-white">Orden</Label>
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!form.imageUrl || !form.title}
                className="w-full bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
              >
                {editing ? "Guardar cambios" : "Agregar al portafolio"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="py-8 text-center text-neutral-400">Cargando...</p>
      ) : items.length === 0 ? (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="py-12 text-center">
            <GripVertical className="mx-auto mb-3 h-10 w-10 text-neutral-600" />
            <p className="text-neutral-400">No hay fotos en el portafolio.</p>
            <p className="text-sm text-neutral-500">Agrega tu primera foto para que aparezca en la página principal.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="group overflow-hidden border-neutral-800 bg-neutral-900">
              <div className="relative aspect-[3/4] overflow-hidden bg-neutral-800">
                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                {!item.isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Badge variant="outline" className="text-neutral-300">Oculto</Badge>
                  </div>
                )}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-black/60 text-white hover:bg-black/80"
                    onClick={() => toggleActive(item)}
                    title={item.isActive ? "Ocultar" : "Mostrar"}
                  >
                    {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-black/60 text-white hover:bg-black/80"
                    onClick={() => {
                      setEditing(item);
                      setForm({
                        title: item.title,
                        description: item.description || "",
                        imageUrl: item.imageUrl,
                        category: item.category || "",
                        sortOrder: item.sortOrder.toString(),
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-black/60 text-red-400 hover:bg-black/80"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="truncate text-sm font-medium text-white">{item.title}</p>
                {item.category && (
                  <Badge variant="outline" className="mt-1 text-xs text-brand-amber border-brand-amber/30">
                    {item.category}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
