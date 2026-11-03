import { collectionBySlug, collections } from "@/data/collections";
import { products } from "@/data/products";
import type { CatalogQuery, Collection, CollectionSlug, Product, SortKey, Variant } from "@/lib/types";

export const PER_PAGE = 12;

export const priceBands = [
  { id: "under-25k", label: "Under ₦25,000", min: 0, max: 2500000 },
  { id: "25-50k", label: "₦25,000 – ₦50,000", min: 2500000, max: 5000000 },
  { id: "50-100k", label: "₦50,000 – ₦100,000", min: 5000000, max: 10000000 },
  { id: "over-100k", label: "₦100,000 and up", min: 10000000, max: Number.MAX_SAFE_INTEGER },
] as const;

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Lowest price" },
  { value: "price-desc", label: "Highest price" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name, A–Z" },
];

const facetLabels: Record<string, string> = {
  type: "Type",
  room: "Room",
  fit: "Fit",
};

export const getCollection = (slug: string): Collection | undefined => collectionBySlug(slug);

export const getCollections = (): Collection[] => collections;

export const priceOf = (product: Product): number =>
  product.variants.length ? Math.min(...product.variants.map((v) => v.price)) : 0;

export const stockOf = (product: Product): number =>
  product.variants.reduce((total, v) => total + Math.max(0, v.stock), 0);

export const isAvailable = (product: Product): boolean => stockOf(product) > 0;

export const variantLabel = (variant: Variant): string =>
  Object.values(variant.options).join(" / ");

export const defaultVariant = (product: Product): Variant | undefined =>
  product.variants.find((v) => v.stock > 0) ?? product.variants[0];

/** Facets are derived from the products in a collection — no duplicated taxonomy. */
export function facetsFor(collectionSlug?: CollectionSlug, source: Product[] = products) {
  const scope = collectionSlug ? source.filter((p) => p.collection === collectionSlug) : source;
  const keys = new Set<string>();
  scope.forEach((p) => Object.keys(p.filters).forEach((k) => keys.add(k)));

  return [...keys].map((key) => {
    const options = [...new Set(scope.map((p) => p.filters[key]).filter(Boolean))].sort();
    return {
      key,
      label: facetLabels[key] ?? key.replace(/^\w/, (c) => c.toUpperCase()),
      options: options.map((value) => ({
        value,
        count: scope.filter((p) => p.filters[key] === value).length,
      })),
    };
  });
}

export function brandsFor(collectionSlug?: CollectionSlug, source: Product[] = products) {
  const scope = collectionSlug ? source.filter((p) => p.collection === collectionSlug) : source;
  return [...new Set(scope.map((p) => p.brand))].sort();
}

function matchesPrice(product: Product, bands: string[]): boolean {
  if (!bands.length) return true;
  const price = priceOf(product);
  return bands.some((id) => {
    const band = priceBands.find((b) => b.id === id);
    return band ? price >= band.min && price < band.max : false;
  });
}

export function filterProducts(query: CatalogQuery, source: Product[] = products) {
  const q = query.q?.trim().toLowerCase();

  const filtered = source.filter((product) => {
    if (query.collection && product.collection !== query.collection) return false;
    if (query.brands.length && !query.brands.includes(product.brand)) return false;
    if (!matchesPrice(product, query.priceBands)) return false;
    if (query.inStockOnly && !isAvailable(product)) return false;

    for (const [key, values] of Object.entries(query.facets)) {
      if (values.length && !values.includes(product.filters[key])) return false;
    }

    if (q) {
      const haystack = [
        product.name,
        product.brand,
        product.summary,
        product.collection,
        ...Object.values(product.filters),
        ...product.specs.map((s) => s.value),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (query.sort) {
      case "price-asc":
        return priceOf(a) - priceOf(b);
      case "price-desc":
        return priceOf(b) - priceOf(a);
      case "newest":
        return new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return Number(b.featured) - Number(a.featured) || Number(b.bestseller) - Number(a.bestseller);
    }
  });

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / query.perPage));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const start = (page - 1) * query.perPage;

  return {
    items: sorted.slice(start, start + query.perPage),
    total,
    page,
    pageCount,
    all: sorted,
  };
}

export function parseQuery(params: Record<string, string | string[] | undefined>): CatalogQuery {
  const read = (key: string): string[] => {
    const raw = params[key];
    if (!raw) return [];
    const value = Array.isArray(raw) ? raw.join(",") : raw;
    return value.split(",").map((v) => decodeURIComponent(v.trim())).filter(Boolean);
  };

  const sortRaw = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const sort = sortOptions.some((o) => o.value === sortRaw) ? (sortRaw as SortKey) : "featured";

  const facets: Record<string, string[]> = {};
  Object.keys(params)
    .filter((key) => key.startsWith("f_"))
    .forEach((key) => {
      const values = read(key);
      if (values.length) facets[key.slice(2)] = values;
    });

  return {
    brands: read("brand"),
    priceBands: read("price"),
    inStockOnly: params.stock === "in",
    facets,
    sort,
    q: (Array.isArray(params.q) ? params.q[0] : params.q) ?? undefined,
    page: Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1,
    perPage: PER_PAGE,
  };
}

export function countActiveFilters(query: CatalogQuery): number {
  return (
    query.brands.length +
    query.priceBands.length +
    (query.inStockOnly ? 1 : 0) +
    Object.values(query.facets).reduce((n, values) => n + values.length, 0)
  );
}

export function relatedProducts(product: Product, limit = 4, source: Product[] = products): Product[] {
  return source
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const score = (p: Product) =>
        Number(p.collection === product.collection) * 2 + Number(p.brand === product.brand);
      return score(b) - score(a);
    })
    .slice(0, limit);
}
