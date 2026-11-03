"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { QuantityStepper } from "@/components/quantity-stepper";
import { defaultVariant, variantLabel } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function QuickAdd({
  product,
  label = "Add to cart",
  className,
  size = "sm",
  tone = "primary",
}: {
  product: Product;
  label?: string;
  className?: string;
  size?: "sm" | "md";
  tone?: "primary" | "secondary";
}) {
  const { addItem, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => defaultVariant(product)?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const single = product.variants.length === 1;
  const variant = product.variants.find((item) => item.id === selected) ?? product.variants[0];
  const triggerClass = cn("btn w-full", size === "sm" && "btn-sm", tone === "secondary" && "btn-secondary", className);

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
    setMessage(null);
    triggerRef.current?.focus();
  };

  const add = (chosen = variant) => {
    if (!chosen) return;
    const result = addItem(chosen.id, single ? 1 : quantity);
    if (!result.ok) {
      setMessage(result.reason ?? "Could not add this item.");
      return;
    }
    setOpen(false);
    setQuantity(1);
    setMessage(null);
    openCart();
  };

  if (single) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => add(product.variants[0])}
        className={triggerClass}
        aria-label={`Add ${product.name} to cart`}
      >
        <Plus size={14} strokeWidth={2} />
        {label}
      </button>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClass}
        aria-label={`Choose options for ${product.name}`}
        aria-expanded={open}
      >
        <Plus size={14} strokeWidth={2} />
        {label}
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
            className="relative w-full max-w-[460px] rounded-t-2xl border border-border bg-surface p-5 shadow-lift sm:rounded-2xl sm:p-6"
            style={{ animation: "toastIn 180ms var(--ease-ui) both" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="product-media relative h-20 w-20 shrink-0 border border-border bg-bg">
                  <Image src={product.images[0].src} alt="" fill sizes="80px" className="object-contain p-2" />
                </div>
                <div>
                  <p className="type-micro text-muted">{product.brand}</p>
                  <h2 className="mt-1 text-base font-medium tracking-[-0.01em]">{product.name}</h2>
                  <p className="num mt-1 text-sm text-muted">{formatPrice(variant.price)}</p>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border"
                aria-label="Close options"
              >
                <X size={14} strokeWidth={1.9} />
              </button>
            </div>

            <fieldset className="mt-6">
              <legend className="type-eyebrow">Options</legend>
              <div className="mt-3 space-y-2">
                {product.variants.map((option) => {
                  const disabled = option.stock <= 0;
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors duration-150",
                        selected === option.id ? "border-primary bg-primary/5" : "border-border hover:border-muted",
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
                          className="h-3.5 w-3.5 accent-[var(--color-primary)]"
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
              <p className="text-xs text-muted">{variant.stock <= 0 ? "Out of stock" : "In stock"}</p>
            </div>

            {message && (
              <p role="alert" className="mt-4 text-xs text-error">
                {message}
              </p>
            )}

            <button type="button" onClick={() => add()} className="btn mt-5 w-full">
              <ShoppingBag size={15} strokeWidth={1.9} />
              Add to cart - {formatPrice(variant.price * quantity)}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
