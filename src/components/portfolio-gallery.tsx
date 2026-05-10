"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  category?: string | null;
}

export function PortfolioGallery({ items }: { items: PortfolioItem[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  const close = () => setSelected(null);
  const prev = () =>
    setSelected((i) => (i !== null ? (i - 1 + items.length) % items.length : null));
  const next = () =>
    setSelected((i) => (i !== null ? (i + 1) % items.length : null));

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="mb-4 cursor-pointer break-inside-avoid overflow-hidden rounded-lg"
            onClick={() => setSelected(i)}
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {selected !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
        >
          <button
            onClick={(e) => { e.stopPropagation(); close(); }}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="mx-4 max-h-[85vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={items[selected].imageUrl}
              alt={items[selected].title}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
            <div className="mt-3 text-center">
              <p className="text-lg font-semibold text-white">
                {items[selected].title}
              </p>
              {items[selected].description && (
                <p className="mt-1 text-sm text-neutral-400">
                  {items[selected].description}
                </p>
              )}
              {items[selected].category && (
                <span className="mt-2 inline-block rounded-full border border-brand-amber/30 px-3 py-1 text-xs text-brand-amber">
                  {items[selected].category}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
