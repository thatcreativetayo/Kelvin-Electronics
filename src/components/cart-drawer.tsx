"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, shippingFor } from "@/lib/shipping";

export function CartDrawer() {
  const { isOpen, closeCart, lines, subtotal, count, setQuantity, removeItem } = useCart();
  const shipping = shippingFor(subtotal);
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
        style={{ animation: "scrimIn 180ms var(--ease-ui) both" }}
        onClick={closeCart}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l border-border bg-surface shadow-lift"
        style={{ animation: "drawerIn 220ms var(--ease-ui) both" }}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <p className="type-eyebrow">Your bag</p>
            <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
              {count === 0 ? "Empty" : `${count} ${count === 1 ? "item" : "items"}`}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink transition-colors duration-150 hover:bg-bg"
            aria-label="Close cart"
          >
            <X size={15} strokeWidth={1.9} />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-6">
            <p className="type-h3 max-w-[16ch]">Nothing in the bag yet.</p>
            <p className="max-w-[34ch] text-sm leading-relaxed text-muted">
              Start with the catalog. Every product page lists specifications, stock and delivery detail.
            </p>
            <Link href="/collections/all" onClick={closeCart} className="btn btn-sm">
              Browse the catalog
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto overscroll-contain px-5 sm:px-6">
              {lines.map((line) => (
                <li key={line.variantId} className="flex gap-4 py-4">
                  <Link
                    href={`/products/${line.product.slug}`}
                    onClick={closeCart}
                    className="product-media relative block h-[92px] w-[92px] shrink-0 border border-border bg-bg"
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
                          className="mt-1 block text-sm font-medium leading-snug tracking-[-0.01em] transition-colors duration-150 hover:text-primary-text"
                        >
                          {line.product.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted">
                          {Object.entries(line.variant.options)
                            .map(([, value]) => value)
                            .join(" / ")}
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
                        className="text-xs text-muted underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-border px-5 py-5 sm:px-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">Subtotal</span>
                <span className="num text-lg">{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between text-xs text-muted">
                <span>Delivery</span>
                <span className="num">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-sm font-medium">Total</span>
                <span className="num text-lg font-semibold">{formatPrice(subtotal + shipping)}</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {subtotal >= FREE_SHIPPING_THRESHOLD
                  ? "Free delivery applied. Orders leave our Lagos warehouse in 1-3 working days."
                  : `Free delivery over ${formatPrice(FREE_SHIPPING_THRESHOLD)}. Orders leave our Lagos warehouse in 1-3 working days.`}
              </p>
              <Link href="/checkout" onClick={closeCart} className="btn mt-4 w-full">
                Checkout
                <ArrowRight size={15} />
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="mt-3 w-full text-center text-xs text-muted underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-ink"
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
