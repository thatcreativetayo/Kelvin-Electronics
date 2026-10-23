"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { priceOf } from "@/lib/catalog";
import { formatPrice, pluralize } from "@/lib/format";
import type { Product } from "@/lib/types";

export function HeroCarousel({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  if (!products.length) return null;
  const product = products[active] ?? products[0];
  const count = products.length;

  const go = (direction: number) => {
    setActive((current) => (current + direction + count) % count);
  };

  return (
    <div className="relative flex min-h-[440px] flex-col overflow-hidden bg-surface sm:min-h-[500px] lg:min-h-[620px]">
      <div className="absolute inset-x-4 top-4 z-20 flex items-center justify-between sm:inset-x-6 sm:top-6">
        <span className="tag">{product.newArrival ? "New in" : "Cloud edit"}</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => go(-1)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface/90 text-ink backdrop-blur-sm transition-colors duration-150 hover:border-ink"
            aria-label="Previous featured product"
          >
            <ArrowLeft size={14} strokeWidth={1.7} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface/90 text-ink backdrop-blur-sm transition-colors duration-150 hover:border-ink"
            aria-label="Next featured product"
          >
            <ArrowRight size={14} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      <Link
        href={`/products/${product.slug}`}
        className="group absolute inset-x-0 bottom-[126px] top-0 sm:bottom-[138px]"
        aria-label={`View ${product.name}`}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 aspect-square w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg"
        />
        <Image
          key={product.images[0].src}
          src={product.images[0].src}
          alt={product.images[0].alt}
          fill
          priority={active === 0}
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-contain px-[12%] py-[9%] transition-transform duration-200 group-hover:scale-[1.015] sm:px-[15%]"
          style={{ animation: "fadeIn 180ms var(--ease-ui) both" }}
        />
      </Link>

      <div className="relative z-10 mt-auto border-t border-border bg-surface/95 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="type-micro text-muted">{product.brand}</p>
            <h2 className="mt-0.5 truncate text-[17px] font-medium tracking-[-0.02em] sm:text-lg">
              <Link href={`/products/${product.slug}`} className="transition-colors duration-150 hover:text-primary-text">
                {product.name}
              </Link>
            </h2>
            <p className="num mt-1 text-sm font-medium text-ink">{formatPrice(priceOf(product))}</p>
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary transition-colors duration-150 hover:bg-primary-hover"
            aria-label={`Shop ${product.name}`}
          >
            <ArrowRight size={15} strokeWidth={1.9} />
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="num type-micro text-muted">
            {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </p>
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Featured products">
            {products.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Show ${item.name}`}
                onClick={() => setActive(index)}
                className={
                  index === active
                    ? "h-1 w-6 rounded-full bg-primary transition-all duration-200"
                    : "h-1 w-1.5 rounded-full bg-border transition-all duration-200 hover:bg-muted"
                }
              />
            ))}
          </div>
          <p className="type-micro text-muted">{pluralize(count, "pick")}</p>
        </div>
      </div>
    </div>
  );
}
