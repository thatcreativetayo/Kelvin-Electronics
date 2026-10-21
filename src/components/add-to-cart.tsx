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

  const variant = product.variants.find((v) => v.id === selected) ?? product.variants[0];
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
        <legend className="type-micro text-muted">
          {Object.keys(product.variants[0]?.options ?? {}).join(" / ") || "Option"}
        </legend>
        <div className="mt-3 grid gap-2">
          {product.variants.map((option) => {
            const disabled = option.stock <= 0;
            return (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm)] border px-3.5 py-3 text-sm transition-colors",
                  selected === option.id ? "border-ink bg-paper" : "border-line hover:border-line-strong",
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

      <div className="mt-5 flex items-center gap-3">
        <QuantityStepper
          value={quantity}
          max={maxQuantity}
          onChange={setQuantity}
          label={`Quantity for ${product.name}`}
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={soldOut || quantity > maxQuantity}
          className="btn btn-accent flex-1"
        >
          {added ? (
            <>
              <Check size={16} strokeWidth={2} /> Added to bag
            </>
          ) : (
            <>
              <ShoppingBag size={15} strokeWidth={1.75} />
              {soldOut ? "Sold out" : `Add to bag — ${formatPrice((variant?.price ?? 0) * quantity)}`}
            </>
          )}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={cn("inline-flex items-center gap-1.5", soldOut ? "text-danger" : "text-success")}>
          <span className={cn("h-1.5 w-1.5 rounded-full", soldOut ? "bg-danger" : "bg-success")} aria-hidden />
          {soldOut ? "Out of stock" : variant && variant.stock <= 3 ? `Only ${variant.stock} left` : "In stock"}
        </span>
        <span className="text-muted">SKU {variant?.sku}</span>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
