"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/format";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="product-media product-media-hero relative aspect-square overflow-hidden">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-contain p-[6%] transition-transform duration-700 ease-[var(--ease-out-quint)] hover:scale-[1.04]"
        />
        <span className="absolute bottom-4 left-4 rounded-[var(--radius-xs)] bg-white/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2 backdrop-blur">
          {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </span>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3" role="tablist" aria-label={`${name} images`}>
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => setActive(index)}
              className={cn(
                "product-media relative h-20 w-20 shrink-0 transition-opacity",
                index === active ? "opacity-100" : "opacity-55 hover:opacity-90",
              )}
            >
              <Image src={image.src} alt={image.alt} fill sizes="80px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}

      <p className="mt-4 max-w-[52ch] text-xs leading-relaxed text-muted">{current.alt}</p>
    </div>
  );
}
