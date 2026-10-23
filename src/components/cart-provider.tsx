"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { products } from "@/data/products";
import type { CartLine, CartLineResolved, Product, Variant } from "@/lib/types";

const STORAGE_KEY = "cloud.cart.v1";
const MAX_PER_LINE = 10;

type CartContextValue = {
  lines: CartLineResolved[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => { ok: boolean; reason?: string };
  setQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const index = new Map<string, { product: Product; variant: Variant }>();
for (const product of products) {
  for (const variant of product.variants) index.set(variant.id, { product, variant });
}

function read(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((line) => index.has(line.variantId) && Number.isFinite(line.quantity))
      .map((line) => ({ ...line, quantity: Math.min(Math.max(1, Math.round(line.quantity)), MAX_PER_LINE) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setLines(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage may be unavailable in private mode — cart still works in memory */
    }
  }, [lines, hydrated]);

  const openCart = useCallback(() => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  const addItem = useCallback((variantId: string, quantity = 1) => {
    const entry = index.get(variantId);
    if (!entry) return { ok: false, reason: "This item is no longer stocked." };
    if (entry.variant.stock <= 0) return { ok: false, reason: "That variant is out of stock." };

    let result = { ok: true as boolean, reason: undefined as string | undefined };
    setLines((current) => {
      const existing = current.find((line) => line.variantId === variantId);
      if (existing) {
        const next = Math.min(existing.quantity + quantity, entry.variant.stock, MAX_PER_LINE);
        if (next === existing.quantity) {
          result = { ok: false, reason: `Only ${entry.variant.stock} available.` };
          return current;
        }
        return current.map((line) => (line.variantId === variantId ? { ...line, quantity: next } : line));
      }
      return [...current, { variantId, productSlug: entry.product.slug, quantity: Math.min(quantity, entry.variant.stock) }];
    });
    return result;
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    const stock = index.get(variantId)?.variant.stock ?? MAX_PER_LINE;
    setLines((current) =>
      current
        .map((line) =>
          line.variantId === variantId
            ? { ...line, quantity: Math.min(Math.max(0, Math.round(quantity)), Math.min(stock, MAX_PER_LINE)) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setLines((current) => current.filter((line) => line.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const resolved = useMemo<CartLineResolved[]>(() => {
    return lines.flatMap((line) => {
      const entry = index.get(line.variantId);
      if (!entry) return [];
      return [
        {
          variantId: line.variantId,
          product: entry.product,
          variant: entry.variant,
          quantity: line.quantity,
          lineTotal: entry.variant.price * line.quantity,
        },
      ];
    });
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const count = resolved.reduce((total, line) => total + line.quantity, 0);
    const subtotal = resolved.reduce((total, line) => total + line.lineTotal, 0);
    return {
      lines: resolved,
      count,
      subtotal,
      hydrated,
      isOpen,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clear,
    };
  }, [resolved, hydrated, isOpen, openCart, closeCart, addItem, setQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
