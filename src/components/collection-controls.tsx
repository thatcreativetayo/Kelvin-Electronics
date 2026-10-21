"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn, pluralize } from "@/lib/format";
import { sortOptions } from "@/lib/catalog";

type Facet = { key: string; label: string; options: { value: string; count: number }[] };

type Props = {
  basePath: string;
  params: Record<string, string>;
  facets: Facet[];
  brands: string[];
  total: number;
  priceBands: readonly { id: string; label: string }[];
  children: React.ReactNode;
};

const readList = (params: Record<string, string>, key: string) =>
  (params[key] ?? "")
    .split(",")
    .map((value) => decodeURIComponent(value.trim()))
    .filter(Boolean);

export function CollectionControls({ basePath, params, facets, brands, total, priceBands, children }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const selected = {
    brand: readList(params, "brand"),
    price: readList(params, "price"),
    facets: Object.fromEntries(facets.map((facet) => [facet.key, readList(params, `f_${facet.key}`)])),
    stock: params.stock === "in",
    sort: params.sort ?? "featured",
  };

  const activeCount =
    selected.brand.length +
    selected.price.length +
    (selected.stock ? 1 : 0) +
    Object.values(selected.facets).reduce((sum, values) => sum + values.length, 0);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const update = (mutate: (sp: URLSearchParams) => void) => {
    const sp = new URLSearchParams(params);
    mutate(sp);
    sp.delete("page");
    const qs = sp.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  };

  const toggle = (key: string, value: string, current: string[]) => {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update((sp) => {
      if (next.length) sp.set(key, next.join(","));
      else sp.delete(key);
    });
  };

  const clearAll = () => update((sp) => {
    ["brand", "price", "stock", "sort", "page"].forEach((key) => sp.delete(key));
    facets.forEach((facet) => sp.delete(`f_${facet.key}`));
  });

  const sortLabel = sortOptions.find((option) => option.value === selected.sort)?.label ?? "Featured";

  const panel = (idPrefix: string) => (
    <div className="space-y-8">
      <fieldset>
        <legend className="type-micro text-muted">Brand</legend>
        <div className="mt-3 space-y-0.5">
          {brands.map((brand) => (
            <label key={`${idPrefix}-${brand}`} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={selected.brand.includes(brand)}
                onChange={() => toggle("brand", brand, selected.brand)}
                className="h-3.5 w-3.5 accent-[var(--color-accent)]"
              />
              <span className="flex-1">{brand}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="type-micro text-muted">Price</legend>
        <div className="mt-3 space-y-0.5">
          {priceBands.map((band) => (
            <label key={`${idPrefix}-${band.id}`} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={selected.price.includes(band.id)}
                onChange={() => toggle("price", band.id, selected.price)}
                className="h-3.5 w-3.5 accent-[var(--color-accent)]"
              />
              <span className="flex-1">{band.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {facets.map((facet) => (
        <fieldset key={`${idPrefix}-${facet.key}`}>
          <legend className="type-micro text-muted">{facet.label}</legend>
          <div className="mt-3 space-y-0.5">
            {facet.options.map((option) => (
              <label
                key={`${idPrefix}-${facet.key}-${option.value}`}
                className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.facets[facet.key]?.includes(option.value) ?? false}
                  onChange={() => toggle(`f_${facet.key}`, option.value, selected.facets[facet.key] ?? [])}
                  className="h-3.5 w-3.5 accent-[var(--color-accent)]"
                />
                <span className="flex-1">{option.value}</span>
                <span className="num text-[11px] text-faint">{option.count}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset>
        <legend className="type-micro text-muted">Availability</legend>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 py-1.5 text-sm">
          <input
            type="checkbox"
            checked={selected.stock}
            onChange={() =>
              update((sp) => {
                if (selected.stock) sp.delete("stock");
                else sp.set("stock", "in");
              })
            }
            className="h-3.5 w-3.5 accent-[var(--color-accent)]"
          />
          <span>In stock only</span>
        </label>
      </fieldset>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
      <aside className="hidden lg:block" aria-label="Product filters">
        <div className="sticky top-[calc(var(--header-h)+24px)]">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="type-micro text-ink">Filters</h2>
            {activeCount > 0 && (
              <button type="button" onClick={clearAll} className="text-[11px] text-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
                Clear all
              </button>
            )}
          </div>
          {panel("desktop")}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-4 border-y border-line py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 text-[13px] font-medium lg:hidden"
              aria-expanded={open}
            >
              <SlidersHorizontal size={15} strokeWidth={1.6} />
              Filter
              {activeCount > 0 && (
                <span className="num grid h-[17px] min-w-[17px] place-items-center rounded-full bg-ink px-1 text-[10px] leading-none text-paper">
                  {activeCount}
                </span>
              )}
            </button>
            <p className="type-small text-muted">
              {pluralize(total, "product")}
            </p>
          </div>

          <label className="relative flex items-center gap-2 text-[13px]">
            <span className="hidden text-muted sm:inline">Sort</span>
            <span className="relative inline-flex items-center">
              <select
                value={selected.sort}
                onChange={(event) =>
                  update((sp) => {
                    if (event.target.value === "featured") sp.delete("sort");
                    else sp.set("sort", event.target.value);
                  })
                }
                className="h-8 appearance-none bg-transparent pr-6 text-[13px] font-medium text-ink outline-none"
                aria-label="Sort products"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} strokeWidth={1.75} className="pointer-events-none absolute right-0 text-muted" />
            </span>
          </label>
        </div>

        {activeCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line py-3">
            {[
              ...selected.brand.map((value) => ({ key: "brand", value, label: value })),
              ...selected.price.map((value) => ({
                key: "price",
                value,
                label: priceBands.find((band) => band.id === value)?.label ?? value,
              })),
              ...Object.entries(selected.facets).flatMap(([facetKey, values]) =>
                values.map((value) => ({ key: `f_${facetKey}`, value, label: value })),
              ),
              ...(selected.stock ? [{ key: "stock", value: "in", label: "In stock" }] : []),
            ].map((chip) => (
              <button
                key={`${chip.key}-${chip.value}`}
                type="button"
                onClick={() =>
                  chip.key === "stock"
                    ? update((sp) => sp.delete("stock"))
                    : toggle(chip.key, chip.value, readList(params, chip.key))
                }
                className="group inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] border border-line-strong bg-paper px-2 py-1 text-[11px] text-ink-2 transition-colors hover:border-ink"
              >
                {chip.label}
                <X size={11} strokeWidth={2} className="text-muted group-hover:text-ink" />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="ml-1 text-[11px] text-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
              Clear all
            </button>
          </div>
        )}

        <div className="sr-only" aria-live="polite">
          {pluralize(total, "product")} shown, sorted by {sortLabel}
        </div>

        {children}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-y-0 left-0 flex w-[90%] max-w-[380px] flex-col bg-paper"
            style={{ animation: "drawerIn 320ms var(--ease-out-quint) both" }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-[15px] font-medium">Filters</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-line-strong" aria-label="Close filters">
                <X size={15} strokeWidth={1.75} />
              </button>
            </div>
            <div className={cn("flex-1 overflow-y-auto overscroll-contain px-5 py-6")}>{panel("mobile")}</div>
            <div className="border-t border-line p-5">
              <button type="button" onClick={() => setOpen(false)} className="btn w-full">
                Show {pluralize(total, "product")}
              </button>
              {activeCount > 0 && (
                <button type="button" onClick={clearAll} className="mt-3 w-full text-xs text-muted underline decoration-line-strong underline-offset-4">
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
