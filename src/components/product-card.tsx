import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { QuickAdd } from "@/components/quick-add";
import { isAvailable, priceOf } from "@/lib/catalog";
import { whatsappOrderHref } from "@/lib/contact";
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
  const variable = new Set(product.variants.map((variant) => variant.price)).size > 1;

  return (
    <article className={cn("card card-hover group flex flex-col overflow-hidden", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-bg">
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 z-10"
          aria-label={`View ${product.name}`}
        >
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 aspect-square w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface"
          />
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 23vw"
            className="object-contain p-[7%] transition-transform duration-200 group-hover:scale-[1.025]"
            priority={priority}
          />
        </Link>

        <div className="pointer-events-none absolute left-2.5 top-2.5 z-20 flex flex-col items-start gap-1.5">
          {product.newArrival && <span className="tag">New</span>}
          {!available && <span className="tag tag-neutral bg-surface">Sold out</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="type-micro truncate text-muted">{product.brand}</p>
        <h3 className="mt-1.5 min-h-[2.7em] text-[14px] font-medium leading-snug tracking-[-0.015em] sm:text-[15px]">
          <Link href={`/products/${product.slug}`} className="transition-colors duration-150 hover:text-primary-text">
            {product.name}
          </Link>
        </h3>
        <p className="num mt-2 text-[15px] font-semibold text-ink sm:text-base">
          {variable && <span className="mr-1 text-[10px] font-normal uppercase tracking-[0.06em] text-muted">from</span>}
          {formatPrice(from)}
        </p>

        <div className="mt-auto flex items-center gap-1.5 pt-3">
          {available ? (
            <QuickAdd product={product} label="Add" className="flex-1" />
          ) : (
            <span className="btn btn-sm flex-1 cursor-not-allowed bg-border text-muted">Sold out</span>
          )}
          <a
            href={whatsappOrderHref(product.name)}
            className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-lg border border-border bg-transparent text-ink transition-colors duration-150 hover:border-ink hover:bg-bg"
            aria-label={`Order ${product.name} on WhatsApp`}
            title="Order on WhatsApp"
          >
            <MessageCircle size={15} strokeWidth={1.8} />
          </a>
        </div>
      </div>
    </article>
  );
}
