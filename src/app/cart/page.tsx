"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, shippingFor } from "@/lib/shipping";

export default function CartPage() {
  const { lines, subtotal, hydrated, setQuantity, removeItem, count } = useCart();
  const shipping = shippingFor(subtotal);

  return (
    <div className="shell pt-5 pb-20 md:pt-7 md:pb-24">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link href="/" className="transition-colors duration-150 hover:text-ink">
          Home
        </Link>
        <span className="mx-1.5 text-border">/</span>
        <span className="text-ink">Bag</span>
      </nav>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="type-eyebrow">Order summary</p>
          <h1 className="type-h1 mt-2">Your bag</h1>
        </div>
        <p className="pb-1 text-sm text-muted">
          {hydrated ? `${count} ${count === 1 ? "item" : "items"}` : "\u00a0"}
        </p>
      </header>

      {!hydrated ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-8" aria-hidden>
            {[0, 1].map((index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />
            ))}
          </div>
        </div>
      ) : lines.length === 0 ? (
        <div className="card mt-8 px-6 py-16 text-center sm:py-20">
          <p className="type-eyebrow">Nothing here yet</p>
          <h2 className="type-h2 mt-3">Your bag is empty.</h2>
          <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-muted">
            Start with better light, a tidier desk or the first Cloud Wear capsule. Every product page lists
            specifications, stock and delivery detail.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            <Link href="/collections/all" className="btn">
              Shop all products
              <ArrowRight size={15} />
            </Link>
            <Link href="/how-it-works" className="btn btn-secondary">
              How Cloud works
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface px-4 sm:px-6">
              {lines.map((line) => (
                <li
                  key={line.variantId}
                  className="grid grid-cols-[92px_1fr] gap-4 py-5 sm:grid-cols-[124px_1fr] sm:gap-6"
                >
                  <Link
                    href={`/products/${line.product.slug}`}
                    className="product-media relative aspect-square border border-border bg-bg"
                  >
                    <Image
                      src={line.product.images[0].src}
                      alt={line.product.images[0].alt}
                      fill
                      sizes="124px"
                      className="object-contain p-2.5"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="type-micro text-muted">{line.product.brand}</p>
                        <h2 className="mt-1 text-[16px] font-medium tracking-[-0.01em] sm:text-[17px]">
                          <Link
                            href={`/products/${line.product.slug}`}
                            className="transition-colors duration-150 hover:text-primary-text"
                          >
                            {line.product.name}
                          </Link>
                        </h2>
                        <p className="mt-1 text-xs text-muted">
                          {Object.entries(line.variant.options)
                            .map(([, value]) => value)
                            .join(" / ")}
                        </p>
                        <p className="mt-1 text-[10px] tracking-[0.02em] text-muted">SKU {line.variant.sku}</p>
                      </div>
                      <p className="num shrink-0 text-[15px] font-semibold">{formatPrice(line.lineTotal)}</p>
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
                        className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors duration-150 hover:text-error"
                      >
                        <Trash2 size={13} strokeWidth={1.8} />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/collections/all"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
              >
                Continue shopping
                <ArrowUpRight size={12} strokeWidth={1.9} />
              </Link>
              <p className="text-xs text-muted">Stock is reserved when an order is confirmed, not when added.</p>
            </div>
          </div>

          <aside className="lg:col-span-4" aria-label="Order total">
            <div className="card sticky top-[calc(var(--header-h)+20px)] p-5 sm:p-6">
              <h2 className="type-eyebrow">Summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-baseline justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="num">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd className="num">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-3">
                  <dt className="text-[15px] font-medium">Total</dt>
                  <dd className="num text-lg font-semibold">{formatPrice(subtotal + shipping)}</dd>
                </div>
              </dl>

              {subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 && (
                <p className="mt-4 border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} for free delivery.
                </p>
              )}

              <Link href="/checkout" className="btn mt-5 w-full">
                Continue to checkout
                <ArrowRight size={15} />
              </Link>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
                Prices include customs duties. Lagos delivery in 1-3 working days, nationwide in 2-5.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
