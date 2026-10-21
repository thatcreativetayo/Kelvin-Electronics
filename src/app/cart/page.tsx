"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatPrice } from "@/lib/format";

const FREE_SHIPPING = 15000;

export default function CartPage() {
  const { lines, subtotal, hydrated, setQuantity, removeItem, count } = useCart();

  const shipping = subtotal >= FREE_SHIPPING || subtotal === 0 ? 0 : 1200;

  return (
    <div className="shell pt-8 pb-20 md:pt-10 md:pb-24">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span className="mx-1.5 text-faint">/</span>
        <span className="text-ink">Bag</span>
      </nav>

      <header className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="type-micro text-muted">Order summary</p>
          <h1 className="type-h1 mt-3">Your bag</h1>
        </div>
        <p className="type-small pb-2 text-muted">
          {hydrated ? `${count} ${count === 1 ? "item" : "items"}` : "\u00a0"}
        </p>
      </header>

      {!hydrated ? (
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4" aria-hidden>
            {[0, 1].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-[var(--radius-md)] bg-line/50" />
            ))}
          </div>
        </div>
      ) : lines.length === 0 ? (
        <div className="mt-10 border border-line bg-paper px-6 py-20 text-center">
          <p className="type-micro text-muted">Empty bag</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">There is nothing here yet.</h2>
          <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-muted">
            Every product page lists live stock, specifications and delivery detail. Start with the shortlist if
            you would like a recommendation.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/collections/all" className="btn">
              Shop the catalog
              <ArrowRight size={15} />
            </Link>
            <Link href="/#shortlist" className="btn btn-outline">
              The shortlist
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            <ul className="divide-y divide-line border-b border-line">
              {lines.map((line) => (
                <li key={line.variantId} className="grid grid-cols-[96px_1fr] gap-5 py-6 sm:grid-cols-[128px_1fr] sm:gap-6">
                  <Link href={`/products/${line.product.slug}`} className="product-media block aspect-square">
                    <Image
                      src={line.product.images[0].src}
                      alt={line.product.images[0].alt}
                      fill
                      sizes="128px"
                      className="object-contain p-2.5"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="type-micro text-muted">{line.product.brand}</p>
                        <h2 className="mt-1 text-[17px] font-medium tracking-[-0.02em]">
                          <Link href={`/products/${line.product.slug}`} className="hover:text-accent">
                            {line.product.name}
                          </Link>
                        </h2>
                        <p className="mt-1 text-xs text-muted">
                          {Object.entries(line.variant.options)
                            .map(([, value]) => value)
                            .join(" · ")}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                          {line.variant.sku}
                        </p>
                      </div>
                      <p className="num shrink-0 text-[15px]">{formatPrice(line.lineTotal)}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <QuantityStepper
                        value={line.quantity}
                        max={Math.min(line.variant.stock, 10)}
                        onChange={(next) => setQuantity(line.variantId, next)}
                        label={`Quantity for ${line.product.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(line.variantId)}
                        className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-danger"
                      >
                        <Trash2 size={13} strokeWidth={1.6} />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/collections/all" className="type-micro inline-flex items-center gap-1.5 text-muted hover:text-ink">
                Continue shopping
                <ArrowUpRight size={12} strokeWidth={1.75} />
              </Link>
              <p className="text-xs text-muted">Stock is reserved when an order is confirmed, not when added.</p>
            </div>
          </div>

          <aside className="lg:col-span-4" aria-label="Order total">
            <div className="sticky top-[calc(var(--header-h)+24px)] border border-line bg-paper p-6">
              <h2 className="type-micro text-muted">Summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-2">Subtotal</dt>
                  <dd className="num">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-2">Shipping</dt>
                  <dd className="num">{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <dt className="text-[15px] font-medium">Total</dt>
                  <dd className="num text-lg">{formatPrice(subtotal + shipping)}</dd>
                </div>
              </dl>

              {subtotal < FREE_SHIPPING && subtotal > 0 && (
                <p className="mt-4 border-l-2 border-accent pl-3 text-xs leading-relaxed text-muted">
                  Add {formatPrice(FREE_SHIPPING - subtotal)} for complimentary delivery.
                </p>
              )}

              <Link href="/checkout" className="btn btn-accent mt-6 w-full">
                Continue to checkout
                <ArrowRight size={15} />
              </Link>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
                Taxes are not calculated in this build.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
