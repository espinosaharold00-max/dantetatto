"use client";

import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart-store";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } =
    useCartStore();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Error al procesar el pago");
      }
    } catch {
      alert("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-brand-pink/30" />
        <h1 className="mb-2 text-2xl font-bold text-white">
          Tu carrito esta vacio
        </h1>
        <p className="mb-6 text-neutral-400">
          Explora nuestros productos Poly Love para el cuidado de tu tatuaje
        </p>
        <Button render={<Link href="/tienda" />} className="bg-brand-pink text-white hover:bg-brand-pink-dark">
          Ver productos
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-white">Carrito</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card
              key={item.product.id}
              className="border-neutral-800 bg-neutral-900"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                  {item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                      Sin img
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    ${(item.product.price / 100).toFixed(2)} c/u
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-neutral-700">
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="p-1.5 text-neutral-400 hover:text-brand-pink"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    className="p-1.5 text-neutral-400 hover:text-brand-pink"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <p className="w-20 text-right font-semibold text-brand-pink">
                  ${((item.product.price * item.quantity) / 100).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-neutral-400 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="ghost"
            onClick={clearCart}
            className="text-sm text-neutral-400"
          >
            Vaciar carrito
          </Button>
        </div>

        <Card className="h-fit border-brand-pink/20 bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-white">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Subtotal</span>
              <span className="text-white">
                ${(total() / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Envio</span>
              <span className="text-neutral-400">Por calcular</span>
            </div>
            <div className="border-t border-neutral-800 pt-4">
              <div className="flex justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="text-xl font-bold text-brand-pink">
                  ${(total() / 100).toFixed(2)}
                </span>
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-brand-pink text-white hover:bg-brand-pink-dark"
              size="lg"
            >
              {loading ? "Procesando..." : "Pagar con Stripe"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
