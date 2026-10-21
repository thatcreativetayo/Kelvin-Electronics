"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { QuantityStepper } from "@/components/quantity-stepper";
import { defaultVariant, variantLabel } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function QuickAdd({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => defaultVariant(product)?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const single = product.variants.length === 1;
  const variant = product.variants.find((v) => v.id === selected) ?? product.variants[0];

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setError(null);
    triggerRef.current?.focus();
  };

  const add = () => {
    if (!variant) return;
    const result = addItem(variant.id, quantity);
    if (!result.ok) {
      setError(result.reason ?? "Could not add this item.");
      return;
    }
    setOpen(false);
    setQuantity(1);
    openCart();
  };

  if (single) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          const result = addItem(product.variants[0].id, 1);
          if (result.ok) openCart();
        }}
        className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-paper/95 text-ink backdrop-blur transition-colors duration-150 hover:bg-ink hover:text-paper"
        aria-label={`Add ${product.name} to bag`}
      >
        <Plus size={15} strokeWidth={1.75} />
      </button>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-paper/95 text-ink backdrop-blur transition-colors duration-150 hover:bg-ink hover:text-paper"
        aria-label={`Choose options for ${product.name}`}
        aria-expanded={open}
      >
        <Plus size={15} strokeWidth={1.75} />
      </button>

      {open && variant && (
        <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center" role="presentation">
          <button
            type="button"
            aria-label="Close options"
            className="absolute inset-0 bg-ink/45"
            style={{ animation: "scrimIn 180ms var(--ease-ui) both" }}
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} options`}
            className="relative w-full max-w-[440px] bg-paper p-6 shadow-[0_24px_80px_rgba(11,12,13,0.2)] sm:rounded-[var(--radius-lg)]"
            style={{ animation: "rise 260ms var(--ease-out-quint) both" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="product-media relative h-20 w-20 shrink-0">
                  <Image src={product.images[0].src} alt="" fill sizes="80px" className="object-contain p-2" />
                </div>
                <div>
                  <p className="type-micro text-muted">{product.brand}</p>
                  <h2 className="mt-1 text-base font-medium tracking-[-0.02em]">{product.name}</h2>
                  <p className="num mt-1 text-sm text-ink-2">{formatPrice(variant.price)}</p>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-strong"
                aria-label="Close options"
              >
                <X size={14} strokeWidth={1.75} />
              </button>
            </div>

            <fieldset className="mt-6">
              <legend className="type-micro text-muted">Options</legend>
              <div className="mt-3 space-y-2">
                {product.variants.map((option) => {
                  const disabled = option.stock <= 0;
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm)] border px-3 py-2.5 text-sm transition-colors",
                        selected === option.id
                          ? "border-ink bg-canvas"
                          : "border-line hover:border-line-strong",
                        disabled && "cursor-not-allowed opacity-45",
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name={`variant-${product.id}`}
                          value={option.id}
                          checked={selected === option.id}
                          disabled={disabled}
                          onChange={() => setSelected(option.id)}
                          className="h-3.5 w-3.5 accent-[var(--color-accent)]"
                        />
                        <span>{variantLabel(option)}</span>
                      </span>
                      <span className="num text-xs text-muted">
                        {disabled ? "Sold out" : formatPrice(option.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-5 flex items-center justify-between">
              <QuantityStepper
                value={quantity}
                max={Math.min(variant.stock, 10)}
                onChange={setQuantity}
                label={`Quantity for ${product.name}`}
              />
              <p className="text-xs text-muted">
                {variant.stock <= 3 ? `Only ${variant.stock} left` : "In stock"}
              </p>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-xs text-danger">
                {error}
              </p>
            )}

            <button type="button" onClick={add} className="btn btn-accent mt-5 w-full">
              Add to bag — {formatPrice(variant.price * quantity)}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
