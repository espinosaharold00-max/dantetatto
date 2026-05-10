"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", image: "", sortOrder: "0" });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({ name: "", image: "", sortOrder: "0" });
    setEditing(null);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      image: form.image || null,
      sortOrder: parseInt(form.sortOrder) || 0,
    };

    try {
      const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const category = await res.json();
        if (editing) {
          setCategories((prev) => prev.map((c) => (c.id === category.id ? category : c)));
        } else {
          setCategories((prev) => [...prev, category].sort((a, b) => a.sortOrder - b.sortOrder));
        }
        setDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Categorías</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-brand-pink text-white hover:bg-brand-pink-dark" onClick={resetForm} />}>
            <Plus className="h-4 w-4" />
            Nueva categoría
          </DialogTrigger>
          <DialogContent className="dark border-neutral-800 bg-neutral-900">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editing ? "Editar categoría" : "Nueva categoría"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Cremas, Jabones..."
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div>
                <Label>Imagen URL (opcional)</Label>
                <Input
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div>
                <Label>Orden</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full bg-brand-pink text-white hover:bg-brand-pink-dark">
                {editing ? "Guardar cambios" : "Crear categoría"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="py-8 text-center text-neutral-400">Cargando...</p>
      ) : categories.length === 0 ? (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="py-8 text-center text-neutral-400">
            No hay categorías. Crea la primera.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="border-neutral-800 bg-neutral-900">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <GripVertical className="h-4 w-4 text-neutral-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{cat.name}</span>
                      {!cat.isActive && (
                        <Badge variant="outline" className="text-xs text-neutral-400">Inactiva</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-400">
                      <span>/{cat.slug}</span>
                      <span>{cat._count.products} productos</span>
                      <span>Orden: {cat.sortOrder}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(cat)}>
                    {cat.isActive ? (
                      <Eye className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-neutral-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(cat);
                      setForm({
                        name: cat.name,
                        image: cat.image || "",
                        sortOrder: cat.sortOrder.toString(),
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 text-neutral-400" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)}>
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
