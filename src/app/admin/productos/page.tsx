"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Star, X } from "lucide-react";
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
import type { Product } from "@prisma/client";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    costPrice: "",
    category: "",
    stock: "",
    isFeatured: false,
    images: [] as string[],
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/products?active=false").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      compareAtPrice: "",
      costPrice: "",
      category: "",
      stock: "",
      isFeatured: false,
      images: [],
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
        setForm((f) => ({ ...f, images: [...f.images, url] }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      price: Math.round(parseFloat(form.price) * 100),
      compareAtPrice: form.compareAtPrice
        ? Math.round(parseFloat(form.compareAtPrice) * 100)
        : null,
      costPrice: form.costPrice
        ? Math.round(parseFloat(form.costPrice) * 100)
        : null,
      category: form.category,
      stock: parseInt(form.stock) || 0,
      isFeatured: form.isFeatured,
      images: form.images,
    };

    try {
      const url = editing ? `/api/products/${editing.id}` : "/api/products";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const product = await res.json();
        if (editing) {
          setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
        } else {
          setProducts((prev) => [product, ...prev]);
        }
        setDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !product.isFeatured }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const profitMargin =
    form.price && form.costPrice
      ? (
          ((parseFloat(form.price) - parseFloat(form.costPrice)) /
            parseFloat(form.price)) *
          100
        ).toFixed(1)
      : null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Productos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-brand-pink text-white hover:bg-brand-pink-dark" onClick={resetForm} />}>
            <Plus className="h-4 w-4" />
            Nuevo producto
          </DialogTrigger>
          <DialogContent className="dark max-h-[90vh] overflow-y-auto border-neutral-800 bg-neutral-900">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editing ? "Editar producto" : "Nuevo producto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="border-neutral-700 bg-neutral-800"
                  rows={3}
                />
              </div>

              <div>
                <Label>Imágenes</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-700">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute right-0.5 top-0.5 rounded-full bg-red-500 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-700 text-neutral-400 transition-colors hover:border-brand-pink hover:text-brand-pink">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Precio de venta (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
                <div>
                  <Label>Precio anterior (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
                    placeholder="Opcional"
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Costo de inversión (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
                    placeholder="Costo unitario"
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
                <div>
                  <Label>Margen de ganancia</Label>
                  <div className="flex h-9 items-center rounded-md border border-neutral-700 bg-neutral-800 px-3 text-sm">
                    {profitMargin ? (
                      <span className={parseFloat(profitMargin) > 0 ? "text-green-400" : "text-red-400"}>
                        {profitMargin}%
                      </span>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v: string | null) => { if (v) setForm((f) => ({ ...f, category: v })); }}
                  >
                    <SelectTrigger className="border-neutral-700 bg-neutral-800">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  className="rounded border-neutral-600"
                />
                <Star className="h-4 w-4 text-brand-amber" />
                <span className="text-sm text-neutral-300">Producto destacado</span>
              </label>

              <Button
                onClick={handleSubmit}
                className="w-full bg-brand-pink text-white hover:bg-brand-pink-dark"
              >
                {editing ? "Guardar cambios" : "Crear producto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="py-8 text-center text-neutral-400">Cargando...</p>
      ) : products.length === 0 ? (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="py-8 text-center text-neutral-400">
            No hay productos. Crea el primero.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id} className="border-neutral-800 bg-neutral-900">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-400">img</div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{product.name}</span>
                      {product.isFeatured && (
                        <Star className="h-3.5 w-3.5 fill-brand-amber text-brand-amber" />
                      )}
                      {!product.isActive && (
                        <Badge variant="outline" className="text-xs text-neutral-400">Inactivo</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                      <span>USD ${(product.price / 100).toFixed(2)}</span>
                      {product.costPrice && (
                        <span className="text-neutral-500">
                          Costo: ${(product.costPrice / 100).toFixed(2)}
                        </span>
                      )}
                      {product.costPrice && (
                        <span className={((product.price - product.costPrice) / product.price) * 100 > 0 ? "text-green-400" : "text-red-400"}>
                          {(((product.price - product.costPrice) / product.price) * 100).toFixed(0)}% margen
                        </span>
                      )}
                      <span>Stock: {product.stock}</span>
                      <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleFeatured(product)} title="Destacar">
                    <Star className={`h-4 w-4 ${product.isFeatured ? "fill-brand-amber text-brand-amber" : "text-neutral-400"}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(product)} title={product.isActive ? "Desactivar" : "Activar"}>
                    {product.isActive ? <Eye className="h-4 w-4 text-green-400" /> : <EyeOff className="h-4 w-4 text-neutral-400" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(product);
                      setForm({
                        name: product.name,
                        description: product.description,
                        price: (product.price / 100).toString(),
                        compareAtPrice: product.compareAtPrice ? (product.compareAtPrice / 100).toString() : "",
                        costPrice: product.costPrice ? (product.costPrice / 100).toString() : "",
                        category: product.category,
                        stock: product.stock.toString(),
                        isFeatured: product.isFeatured,
                        images: product.images,
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 text-neutral-400" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)}>
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
