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
      <div className="product-stage relative aspect-square overflow-hidden">
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg"
        />
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-contain p-[8%] transition-transform duration-200 hover:scale-[1.015]"
        />
        <span className="num absolute bottom-4 left-4 rounded-full border border-border bg-surface/90 px-2.5 py-1 text-[10px] font-medium text-muted backdrop-blur-sm">
          {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </span>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5" role="tablist" aria-label={`${name} images`}>
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => setActive(index)}
              className={cn(
                "product-media relative h-20 w-20 shrink-0 border bg-bg transition-colors duration-150",
                index === active ? "border-primary" : "border-border hover:border-muted",
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
