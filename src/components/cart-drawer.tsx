"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { isOpen, closeCart, lines, subtotal, count, setQuantity, removeItem } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 h-full w-full cursor-default bg-ink/45"
        style={{ animation: "scrimIn 200ms var(--ease-ui) both" }}
        onClick={closeCart}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-paper shadow-[-24px_0_60px_rgba(11,12,13,0.12)]"
        style={{ animation: "drawerIn 380ms var(--ease-out-quint) both" }}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <p className="type-micro text-muted">Your bag</p>
            <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
              {count === 0 ? "Empty" : `${count} ${count === 1 ? "item" : "items"}`}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:bg-canvas"
            aria-label="Close cart"
          >
            <X size={15} strokeWidth={1.75} />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-5 px-6">
            <p className="type-h3 max-w-[16ch]">Nothing in the bag yet.</p>
            <p className="type-small max-w-[34ch] text-muted">
              Start with the catalog — every product page has specifications, stock and delivery detail.
            </p>
            <Link href="/collections/all" onClick={closeCart} className="btn btn-sm btn-outline">
              Browse the catalog
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto overscroll-contain divide-y divide-line px-6">
              {lines.map((line) => (
                <li key={line.variantId} className="flex gap-4 py-5">
                  <Link
                    href={`/products/${line.product.slug}`}
                    onClick={closeCart}
                    className="product-media block h-[92px] w-[92px] shrink-0"
                  >
                    <Image
                      src={line.product.images[0].src}
                      alt={line.product.images[0].alt}
                      fill
                      sizes="92px"
                      className="object-contain p-1.5"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="type-micro text-muted">{line.product.brand}</p>
                        <Link
                          href={`/products/${line.product.slug}`}
                          onClick={closeCart}
                          className="mt-1 block text-sm font-medium leading-snug tracking-[-0.01em] hover:text-accent"
                        >
                          {line.product.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted">
                          {Object.entries(line.variant.options)
                            .map(([, value]) => value)
                            .join(" · ")}
                        </p>
                      </div>
                      <p className="num shrink-0 text-sm">{formatPrice(line.lineTotal)}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <QuantityStepper
                        compact
                        value={line.quantity}
                        max={Math.min(line.variant.stock, 10)}
                        onChange={(next) => setQuantity(line.variantId, next)}
                        label={`Quantity for ${line.product.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(line.variantId)}
                        className="text-xs text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="type-small text-muted">Subtotal</span>
                <span className="num text-lg">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Complimentary delivery over $150. Orders ship from our Lagos warehouse in 1-2 business days. Taxes
                are not calculated in this build.
              </p>
              <Link href="/checkout" onClick={closeCart} className="btn btn-accent mt-4 w-full">
                Checkout
                <ArrowRight size={15} />
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="mt-3 w-full text-center text-xs text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
              >
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
