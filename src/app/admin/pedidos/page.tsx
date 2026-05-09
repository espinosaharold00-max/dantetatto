"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderWithItems } from "@/types";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500",
  PAID: "bg-green-500/10 text-green-500",
  SHIPPED: "bg-blue-500/10 text-blue-500",
  DELIVERED: "bg-emerald-500/10 text-emerald-500",
  CANCELLED: "bg-red-500/10 text-red-500",
  REFUNDED: "bg-neutral-500/10 text-neutral-400",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-neutral-400">Cargando...</div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Pedidos</h1>

      {orders.length === 0 ? (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="py-8 text-center text-neutral-400">
            No hay pedidos aún
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="border-neutral-800 bg-neutral-900"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <Badge
                        variant="outline"
                        className={statusColors[order.status]}
                      >
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-400">
                      {order.user.name || order.user.email} •{" "}
                      {format(new Date(order.createdAt), "d MMM yyyy HH:mm", {
                        locale: es,
                      })}
                    </p>
                    <div className="mt-2 space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-xs text-neutral-400">
                          {item.product.name} x{item.quantity} — $
                          {((item.price * item.quantity) / 100).toFixed(2)}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      ${(order.total / 100).toFixed(2)}
                    </p>
                    <Select
                      value={order.status}
                      onValueChange={(v: string | null) => { if (v) updateOrderStatus(order.id, v); }}
                    >
                      <SelectTrigger className="mt-2 w-32 border-neutral-700 bg-neutral-800 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
