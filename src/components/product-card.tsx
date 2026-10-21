import Image from "next/image";
import Link from "next/link";
import { QuickAdd } from "@/components/quick-add";
import { isAvailable, priceOf } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const available = isAvailable(product);
  const from = priceOf(product);
  const variable = new Set(product.variants.map((v) => v.price)).size > 1;

  return (
    <article className={cn("group relative", className)}>
      <div className="product-media relative aspect-square">
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-offset-4"
          aria-label={`View ${product.name}`}
        >
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 24vw"
            className="object-contain p-[7%]"
            priority={priority}
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col items-start gap-1.5">
          {product.newArrival && (
            <span className="rounded-[var(--radius-xs)] border border-ink/15 bg-paper/90 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-ink">
              New
            </span>
          )}
        </div>

        {!available && (
          <span className="absolute bottom-3 left-3 z-20 rounded-[var(--radius-xs)] bg-ink/90 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-paper">
            Sold out
          </span>
        )}

        {available && (
          <div className="absolute bottom-2 right-2 z-20">
            <QuickAdd product={product} />
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="type-micro text-muted">{product.brand}</p>
        <h3 className="mt-1 text-[15px] font-medium leading-snug tracking-[-0.015em]">
          <Link href={`/products/${product.slug}`} className="transition-colors hover:text-accent">
            {product.name}
          </Link>
        </h3>
        <p className="num mt-1 text-[14px] text-ink-2">
          {variable && <span className="mr-1 text-xs text-muted">from</span>}
          {formatPrice(from)}
        </p>
      </div>
    </article>
  );
}
