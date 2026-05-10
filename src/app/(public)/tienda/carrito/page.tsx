"use client";

import { Trash2, Minus, Plus, ShoppingBag, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/lib/cart-store";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: session?.user?.name || "",
    phone: "",
    email: session?.user?.email || "",
    notes: "",
  });

  const handleWhatsAppOrder = async () => {
    if (!customerForm.name || !customerForm.phone) {
      alert("Por favor completa tu nombre y teléfono");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          customerName: customerForm.name,
          customerPhone: customerForm.phone,
          customerEmail: customerForm.email,
          notes: customerForm.notes,
          sendWhatsApp: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al crear el pedido");
        setLoading(false);
        return;
      }

      const order = await res.json();

      const itemLines = items
        .map(
          (item) =>
            `• ${item.product.name} x${item.quantity} — USD $${((item.product.price * item.quantity) / 100).toFixed(2)}`
        )
        .join("\n");

      const message = encodeURIComponent(
        `🛒 *Nuevo Pedido — Dante Tattoo*\n\n` +
          `📋 *Pedido:* #${order.id.slice(-8).toUpperCase()}\n` +
          `👤 *Cliente:* ${customerForm.name}\n` +
          `📱 *Teléfono:* ${customerForm.phone}\n` +
          `📧 *Email:* ${customerForm.email}\n\n` +
          `*Productos:*\n${itemLines}\n\n` +
          `💰 *Total: USD $${(total() / 100).toFixed(2)}*\n\n` +
          (customerForm.notes ? `📝 *Notas:* ${customerForm.notes}\n\n` : "") +
          `¡Gracias por tu compra! 🙏`
      );

      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50760000000";
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");

      clearCart();
    } catch {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-brand-pink/30" />
        <h1 className="mb-2 text-2xl font-bold text-white">Tu carrito está vacío</h1>
        <p className="mb-6 text-neutral-400">
          Explora nuestros productos Poly Love para el cuidado de tu tatuaje
        </p>
        <Link href="/tienda" className={cn(buttonVariants(), "bg-brand-pink text-white hover:bg-brand-pink-dark")}>
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-white">Carrito</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.product.id} className="border-neutral-800 bg-neutral-900">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                  {item.product.images[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-400">Sin img</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{item.product.name}</h3>
                  <p className="text-sm text-neutral-400">USD ${(item.product.price / 100).toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-neutral-700">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1.5 text-neutral-400 hover:text-brand-pink"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1.5 text-neutral-400 hover:text-brand-pink"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <p className="w-24 text-right font-semibold text-brand-pink">
                  USD ${((item.product.price * item.quantity) / 100).toFixed(2)}
                </p>
                <button onClick={() => removeItem(item.product.id)} className="text-neutral-400 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}

          <Button variant="ghost" onClick={clearCart} className="text-sm text-neutral-400">
            Vaciar carrito
          </Button>
        </div>

        <div className="space-y-4">
          <Card className="border-neutral-800 bg-neutral-900">
            <CardHeader>
              <CardTitle className="text-white">Datos del cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-neutral-400">Nombre *</Label>
                <Input
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm((f) => ({ ...f, name: e.target.value }))}
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div>
                <Label className="text-neutral-400">Teléfono / WhatsApp *</Label>
                <Input
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+507 6000-0000"
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div>
                <Label className="text-neutral-400">Email</Label>
                <Input
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm((f) => ({ ...f, email: e.target.value }))}
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div>
                <Label className="text-neutral-400">Notas (opcional)</Label>
                <Input
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Instrucciones especiales..."
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit border-brand-pink/20 bg-neutral-900">
            <CardHeader>
              <CardTitle className="text-white">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Subtotal</span>
                <span className="text-white">USD ${(total() / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-neutral-800 pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-brand-pink">USD ${(total() / 100).toFixed(2)}</span>
                </div>
              </div>
              <Button
                onClick={handleWhatsAppOrder}
                disabled={loading || !customerForm.name || !customerForm.phone}
                className="w-full gap-2 bg-green-600 text-white hover:bg-green-700"
                size="lg"
              >
                <MessageCircle className="h-5 w-5" />
                {loading ? "Procesando..." : "Pedir por WhatsApp"}
              </Button>
              <p className="text-center text-xs text-neutral-500">
                Tu pedido se enviará por WhatsApp para coordinar el pago y entrega
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
