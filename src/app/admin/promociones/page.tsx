"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
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
import type { Promotion } from "@prisma/client";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    value: "",
    code: "",
    startDate: "",
    endDate: "",
    minPurchase: "",
    maxUses: "",
  });

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then(setPromotions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      type: "PERCENTAGE",
      value: "",
      code: "",
      startDate: "",
      endDate: "",
      minPurchase: "",
      maxUses: "",
    });
    setEditing(null);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      type: form.type,
      value: parseInt(form.value) || 0,
      code: form.code || null,
      startDate: form.startDate,
      endDate: form.endDate,
      minPurchase: form.minPurchase ? parseInt(form.minPurchase) : null,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
    };

    try {
      const url = editing
        ? `/api/promotions/${editing.id}`
        : "/api/promotions";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const promotion = await res.json();
        if (editing) {
          setPromotions((prev) =>
            prev.map((p) => (p.id === promotion.id ? promotion : p))
          );
        } else {
          setPromotions((prev) => [promotion, ...prev]);
        }
        setDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (promo: Promotion) => {
    try {
      const res = await fetch(`/api/promotions/${promo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPromotions((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deletePromotion = async (id: string) => {
    if (!confirm("¿Eliminar esta promoción?")) return;
    try {
      const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPromotions((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatValue = (type: string, value: number) => {
    if (type === "PERCENTAGE") return `${value}%`;
    return `$${(value / 100).toFixed(2)} USD`;
  };

  const toInputDate = (date: string | Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Promociones</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                className="gap-2 bg-brand-amber text-black hover:bg-amber-500"
                onClick={resetForm}
              />
            }
          >
            <Plus className="h-4 w-4" />
            Nueva promoción
          </DialogTrigger>
          <DialogContent className="dark max-h-[90vh] overflow-y-auto border-neutral-800 bg-neutral-900">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editing ? "Editar promoción" : "Nueva promoción"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Opcional"
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v: string | null) => {
                      if (v)
                        setForm((f) => ({
                          ...f,
                          type: v as "PERCENTAGE" | "FIXED_AMOUNT",
                        }));
                    }}
                  >
                    <SelectTrigger className="border-neutral-700 bg-neutral-800">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">
                        Monto fijo (USD)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>
                    {form.type === "PERCENTAGE"
                      ? "Valor (%)"
                      : "Valor (centavos USD)"}
                  </Label>
                  <Input
                    type="number"
                    value={form.value}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, value: e.target.value }))
                    }
                    placeholder={
                      form.type === "PERCENTAGE" ? "Ej: 15" : "Ej: 500"
                    }
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
              </div>
              <div>
                <Label>Código promocional</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Opcional, ej: VERANO2026"
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha inicio</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startDate: e.target.value }))
                    }
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
                <div>
                  <Label>Fecha fin</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Compra mínima (centavos)</Label>
                  <Input
                    type="number"
                    value={form.minPurchase}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, minPurchase: e.target.value }))
                    }
                    placeholder="Opcional"
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
                <div>
                  <Label>Usos máximos</Label>
                  <Input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maxUses: e.target.value }))
                    }
                    placeholder="Opcional"
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full bg-brand-amber text-black hover:bg-amber-500"
              >
                {editing ? "Guardar cambios" : "Crear promoción"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="py-8 text-center text-neutral-400">Cargando...</p>
      ) : promotions.length === 0 ? (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="py-8 text-center text-neutral-400">
            No hay promociones. Crea la primera.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => (
            <Card key={promo.id} className="border-neutral-800 bg-neutral-900">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{promo.name}</span>
                    <Badge
                      variant="outline"
                      className="border-brand-amber text-brand-amber"
                    >
                      {formatValue(promo.type, promo.value)}
                    </Badge>
                    {promo.code && (
                      <Badge
                        variant="outline"
                        className="font-mono text-xs text-neutral-300"
                      >
                        {promo.code}
                      </Badge>
                    )}
                    {!promo.isActive && (
                      <Badge
                        variant="outline"
                        className="text-xs text-neutral-400"
                      >
                        Inactiva
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                    <span>
                      {formatDate(promo.startDate)} -{" "}
                      {formatDate(promo.endDate)}
                    </span>
                    {promo.minPurchase && (
                      <span>
                        Min: ${(promo.minPurchase / 100).toFixed(2)}
                      </span>
                    )}
                    <span>
                      Usos: {promo.usedCount}
                      {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(promo)}
                    title={promo.isActive ? "Desactivar" : "Activar"}
                  >
                    {promo.isActive ? (
                      <Eye className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-neutral-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(promo);
                      setForm({
                        name: promo.name,
                        description: promo.description || "",
                        type: promo.type,
                        value: promo.value.toString(),
                        code: promo.code || "",
                        startDate: toInputDate(promo.startDate),
                        endDate: toInputDate(promo.endDate),
                        minPurchase: promo.minPurchase
                          ? promo.minPurchase.toString()
                          : "",
                        maxUses: promo.maxUses ? promo.maxUses.toString() : "",
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 text-neutral-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePromotion(promo.id)}
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
