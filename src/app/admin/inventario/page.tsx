"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { Product } from "@prisma/client";

interface StockMovement {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  unitCost: number | null;
  note: string | null;
  createdAt: string;
  product: { id: string; name: string; images: string[] };
}

const typeConfig = {
  IN: { label: "Entrada", icon: ArrowUpCircle, color: "text-green-400", bg: "bg-green-500/10" },
  OUT: { label: "Salida", icon: ArrowDownCircle, color: "text-red-400", bg: "bg-red-500/10" },
  ADJUSTMENT: { label: "Ajuste", icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/10" },
};

export default function InventoryPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    type: "IN" as "IN" | "OUT" | "ADJUSTMENT",
    quantity: "",
    unitCost: "",
    note: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/stock-movements").then((r) => r.json()),
      fetch("/api/products?active=false").then((r) => r.json()),
    ])
      .then(([movs, prods]) => {
        setMovements(movs);
        setProducts(prods);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({ productId: "", type: "IN", quantity: "", unitCost: "", note: "" });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/stock-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const movement = await res.json();
        setMovements((prev) => [movement, ...prev]);
        const updatedProducts = await fetch("/api/products?active=false").then((r) => r.json());
        setProducts(updatedProducts);
        setDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalInvestment = products.reduce((sum, p) => {
    return sum + (p.costPrice || 0) * p.stock;
  }, 0);

  const totalRetailValue = products.reduce((sum, p) => {
    return sum + p.price * p.stock;
  }, 0);

  const lowStockProducts = products.filter((p) => p.isActive && p.stock <= 5);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Inventario</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-brand-amber text-brand-dark hover:bg-brand-amber-dark" onClick={resetForm} />}>
            <Plus className="h-4 w-4" />
            Nuevo movimiento
          </DialogTrigger>
          <DialogContent className="dark border-neutral-800 bg-neutral-900">
            <DialogHeader>
              <DialogTitle className="text-white">Registrar movimiento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Producto</Label>
                <Select
                  value={form.productId}
                  onValueChange={(v: string | null) => { if (v) setForm((f) => ({ ...f, productId: v })); }}
                >
                  <SelectTrigger className="border-neutral-700 bg-neutral-800">
                    <SelectValue placeholder="Seleccionar producto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de movimiento</Label>
                <Select
                  value={form.type}
                  onValueChange={(v: string | null) => { if (v) setForm((f) => ({ ...f, type: v as "IN" | "OUT" | "ADJUSTMENT" })); }}
                >
                  <SelectTrigger className="border-neutral-700 bg-neutral-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Entrada (compra/restock)</SelectItem>
                    <SelectItem value="OUT">Salida (venta/pérdida)</SelectItem>
                    <SelectItem value="ADJUSTMENT">Ajuste (corregir stock)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{form.type === "ADJUSTMENT" ? "Nuevo stock" : "Cantidad"}</Label>
                  <Input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="border-neutral-700 bg-neutral-800"
                  />
                </div>
                {form.type === "IN" && (
                  <div>
                    <Label>Costo unitario (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.unitCost}
                      onChange={(e) => setForm((f) => ({ ...f, unitCost: e.target.value }))}
                      className="border-neutral-700 bg-neutral-800"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Nota (opcional)</Label>
                <Input
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Motivo del movimiento..."
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!form.productId || !form.quantity}
                className="w-full bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
              >
                Registrar movimiento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Valor de inversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">USD ${(totalInvestment / 100).toFixed(2)}</div>
            <p className="text-xs text-neutral-400">costo total en stock</p>
          </CardContent>
        </Card>
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Valor de venta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-amber">USD ${(totalRetailValue / 100).toFixed(2)}</div>
            <p className="text-xs text-neutral-400">precio retail total</p>
          </CardContent>
        </Card>
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Ganancia potencial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              USD ${((totalRetailValue - totalInvestment) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-neutral-400">
              {totalInvestment > 0 ? `${(((totalRetailValue - totalInvestment) / totalInvestment) * 100).toFixed(0)}% margen` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="mb-6 border-yellow-800/50 bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Productos con stock bajo (≤5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map((p) => (
                <Badge key={p.id} variant="outline" className="border-yellow-700 text-yellow-400">
                  {p.name}: {p.stock} uds
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-neutral-800 bg-neutral-900">
        <CardHeader>
          <CardTitle className="text-white">Historial de movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-neutral-400">Cargando...</p>
          ) : movements.length === 0 ? (
            <p className="py-8 text-center text-neutral-400">No hay movimientos registrados</p>
          ) : (
            <div className="space-y-3">
              {movements.map((mov) => {
                const cfg = typeConfig[mov.type];
                const Icon = cfg.icon;
                return (
                  <div key={mov.id} className="flex items-center justify-between rounded-lg bg-neutral-950 p-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-1.5 ${cfg.bg}`}>
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{mov.product.name}</span>
                          <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                            {cfg.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-400">
                          <span>
                            {mov.type === "ADJUSTMENT" ? `Stock → ${mov.quantity}` : `${mov.type === "IN" ? "+" : "-"}${mov.quantity} uds`}
                          </span>
                          {mov.unitCost && <span>USD ${(mov.unitCost / 100).toFixed(2)} c/u</span>}
                          {mov.note && <span>• {mov.note}</span>}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {format(new Date(mov.createdAt), "d MMM yyyy HH:mm", { locale: es })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
