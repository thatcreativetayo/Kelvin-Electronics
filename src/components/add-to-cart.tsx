"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { QuantityStepper } from "@/components/quantity-stepper";
import { defaultVariant, variantLabel } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const [selected, setSelected] = useState(() => defaultVariant(product)?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((item) => item.id === selected) ?? product.variants[0];
  const maxQuantity = Math.min(variant?.stock ?? 1, 10);
  const soldOut = (variant?.stock ?? 0) <= 0;

  const onAdd = () => {
    if (!variant) return;
    const result = addItem(variant.id, quantity);
    if (!result.ok) {
      setError(result.reason ?? "Could not add this item.");
      return;
    }
    setError(null);
    setAdded(true);
    openCart();
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div>
      <fieldset>
        <legend className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
          {Object.keys(product.variants[0]?.options ?? {})
            .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
            .join(" / ") || "Option"}
        </legend>
        <div className="mt-3 grid gap-2">
          {product.variants.map((option) => {
            const disabled = option.stock <= 0;
            return (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-sm transition-colors duration-150",
                  selected === option.id ? "border-primary bg-primary/5" : "border-border hover:border-muted",
                  disabled && "cursor-not-allowed opacity-45",
                )}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="variant"
                    value={option.id}
                    checked={selected === option.id}
                    disabled={disabled}
                    onChange={() => {
                      setSelected(option.id);
                      setQuantity(1);
                      setError(null);
                    }}
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

      <div className="mt-5 flex items-center justify-between gap-3">
        <QuantityStepper
          value={quantity}
          max={maxQuantity}
          onChange={setQuantity}
          label={`Quantity for ${product.name}`}
        />
        <span className={cn("inline-flex items-center gap-1.5 text-xs", soldOut ? "text-error" : "text-success")}>
          <span className={cn("h-1.5 w-1.5 rounded-full", soldOut ? "bg-error" : "bg-success")} aria-hidden />
          {soldOut ? "Out of stock" : "In stock"}
        </span>
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={soldOut || quantity > maxQuantity}
        className="btn mt-3 w-full"
      >
        {added ? (
          <>
            <Check size={16} strokeWidth={2.2} /> Added to cart
          </>
        ) : (
          <>
            <ShoppingBag size={15} strokeWidth={1.9} />
            {soldOut ? (
              "Sold out"
            ) : (
              <>
                Add to cart <span className="hidden sm:inline">- {formatPrice((variant?.price ?? 0) * quantity)}</span>
              </>
            )}
          </>
        )}
      </button>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
        <span>Free returns within 14 days</span>
        <span className="num">SKU {variant?.sku}</span>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
