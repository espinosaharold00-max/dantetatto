"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Printer, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; images: string[] };
}

interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  invoiceNumber: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  notes: string | null;
  whatsappSent: boolean;
  createdAt: string;
  user: { id: string; name: string | null; email: string; phone?: string | null };
  items: OrderItem[];
}

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

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
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendInvoiceEmail = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`, { method: "POST" });
      if (res.ok) {
        alert("Factura enviada por email");
      } else {
        alert("Error al enviar la factura");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  const printInvoice = (order: Order) => {
    const clientName = order.customerName || order.user.name || "Cliente";
    const clientEmail = order.customerEmail || order.user.email;
    const clientPhone = order.customerPhone || order.user.phone || "";

    const itemRows = order.items
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee">${item.product.name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${(item.price / 100).toFixed(2)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${((item.price * item.quantity) / 100).toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const html = `
      <html><head><title>Factura ${order.invoiceNumber}</title>
      <style>body{font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px}
      .header{text-align:center;margin-bottom:30px;border-bottom:3px solid #F0A030;padding-bottom:20px}
      .header h1{color:#F0A030;margin:0;font-size:24px;letter-spacing:2px}
      .header p{color:#666;margin:4px 0 0;font-size:12px}
      .info{display:flex;justify-content:space-between;margin-bottom:20px}
      .info div{font-size:13px;color:#333}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th{background:#f5f5f5;padding:10px 8px;text-align:left;font-size:13px;border-bottom:2px solid #ddd}
      .total{text-align:right;font-size:18px;font-weight:bold;margin-top:10px;color:#F0A030}
      .footer{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;color:#999;font-size:11px}
      @media print{body{margin:0}}</style>
      </head><body>
      <div class="header">
        <h1>DANTE TATTOO</h1>
        <p>Estudio de Tatuaje — PolyLove After Care</p>
      </div>
      <div class="info">
        <div>
          <strong>Factura:</strong> ${order.invoiceNumber || "—"}<br>
          <strong>Fecha:</strong> ${format(new Date(order.createdAt), "d 'de' MMMM yyyy", { locale: es })}<br>
          <strong>Estado:</strong> ${statusLabels[order.status]}
        </div>
        <div style="text-align:right">
          <strong>Cliente:</strong> ${clientName}<br>
          <strong>Email:</strong> ${clientEmail}<br>
          ${clientPhone ? `<strong>Tel:</strong> ${clientPhone}` : ""}
        </div>
      </div>
      <table>
        <thead><tr>
          <th>Producto</th><th style="text-align:center">Cant.</th>
          <th style="text-align:right">Precio</th><th style="text-align:right">Subtotal</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      ${order.discountAmount > 0 ? `<p style="text-align:right;color:#666">Descuento: -USD $${(order.discountAmount / 100).toFixed(2)}</p>` : ""}
      <p class="total">Total: USD $${(order.total / 100).toFixed(2)}</p>
      <div class="footer">
        <p>Dante Tattoo — "Haciendo amigos, no clientes"</p>
        <p>dantetattoo.com</p>
      </div>
      </body></html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-neutral-400">Cargando...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Pedidos</h1>

      {orders.length === 0 ? (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="py-8 text-center text-neutral-400">No hay pedidos aún</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="border-neutral-800 bg-neutral-900">
              <CardContent className="p-4">
                <div
                  className="flex cursor-pointer items-center justify-between"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        #{order.invoiceNumber || order.id.slice(-8).toUpperCase()}
                      </span>
                      <Badge variant="outline" className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                      {order.whatsappSent && (
                        <Badge variant="outline" className="border-green-700 text-green-400">
                          <MessageCircle className="mr-1 h-3 w-3" />
                          WhatsApp
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-400">
                      {order.customerName || order.user.name || order.user.email} •{" "}
                      {format(new Date(order.createdAt), "d MMM yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-white">USD ${(order.total / 100).toFixed(2)}</p>
                    <Select
                      value={order.status}
                      onValueChange={(v: string | null) => { if (v) updateOrderStatus(order.id, v); }}
                    >
                      <SelectTrigger className="w-32 border-neutral-700 bg-neutral-800 text-xs" onClick={(e) => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="mt-4 border-t border-neutral-800 pt-4">
                    <div className="mb-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-neutral-300">Datos del cliente</h4>
                        <div className="space-y-1 text-sm text-neutral-400">
                          <p><span className="text-neutral-500">Nombre:</span> {order.customerName || order.user.name || "—"}</p>
                          <p><span className="text-neutral-500">Email:</span> {order.customerEmail || order.user.email}</p>
                          <p><span className="text-neutral-500">Teléfono:</span> {order.customerPhone || order.user.phone || "—"}</p>
                          {order.notes && <p><span className="text-neutral-500">Notas:</span> {order.notes}</p>}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-neutral-300">Productos</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-neutral-800">
                                {item.product.images[0] ? (
                                  <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[8px] text-neutral-500">img</div>
                                )}
                              </div>
                              <span className="text-neutral-300">{item.product.name}</span>
                              <span className="text-neutral-500">x{item.quantity}</span>
                              <span className="ml-auto text-neutral-300">
                                USD ${((item.price * item.quantity) / 100).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-neutral-700 text-neutral-300"
                        onClick={() => printInvoice(order)}
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Imprimir factura
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-neutral-700 text-neutral-300"
                        onClick={() => sendInvoiceEmail(order.id)}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Enviar factura por email
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div ref={printRef} className="hidden" />
    </div>
  );
}
