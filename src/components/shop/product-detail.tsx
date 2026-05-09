"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@prisma/client";
import { useCartStore } from "@/lib/cart-store";

export function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-neutral-800">
          {product.images[selectedImage] ? (
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              Sin imagen
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`h-20 w-20 overflow-hidden rounded-lg border-2 ${
                  selectedImage === i
                    ? "border-white"
                    : "border-neutral-700"
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <Badge variant="outline" className="mb-3">
          {product.category}
        </Badge>
        <h1 className="mb-2 text-3xl font-bold text-white">{product.name}</h1>

        <div className="mb-4 flex items-center gap-3">
          <span className="text-3xl font-bold text-white">
            ${(product.price / 100).toFixed(2)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xl text-neutral-400 line-through">
              ${(product.compareAtPrice / 100).toFixed(2)}
            </span>
          )}
        </div>

        <p className="mb-6 text-neutral-400">{product.description}</p>

        {product.stock > 0 ? (
          <>
            <div className="mb-4 flex items-center gap-4">
              <span className="text-sm text-neutral-400">Cantidad:</span>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-700">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-neutral-400 hover:text-white"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-white">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="p-2 text-neutral-400 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-neutral-400">
                {product.stock} disponibles
              </span>
            </div>

            <Button
              onClick={handleAdd}
              className="w-full gap-2 bg-white text-black hover:bg-neutral-200"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5" />
              {added ? "Agregado al carrito" : "Agregar al carrito"}
            </Button>
          </>
        ) : (
          <Button disabled className="w-full" size="lg">
            Agotado
          </Button>
        )}
      </div>
    </div>
  );
}
