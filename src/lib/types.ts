export type CollectionSlug = "audio" | "computing" | "mobile" | "imaging" | "gaming";

export type Collection = {
  slug: CollectionSlug;
  name: string;
  eyebrow: string;
  tagline: string;
  description: string;
  image: string;
};

export type Variant = {
  /** Stable identifier shared with Supabase inventory rows. */
  id: string;
  sku: string;
  /** Option values, e.g. { colour: "Silver", storage: "512GB" } */
  options: Record<string, string>;
  price: number;
  stock: number;
};

export type ProductImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Spec = { label: string; value: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  collection: CollectionSlug;
  summary: string;
  description: string[];
  highlights: string[];
  specs: Spec[];
  images: ProductImage[];
  variants: Variant[];
  /** Facet values used by collection filtering. */
  filters: Record<string, string>;
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
  releasedAt: string;
};

export type CartLine = {
  variantId: string;
  productSlug: string;
  quantity: number;
};

export type CartLineResolved = {
  variantId: string;
  product: Product;
  variant: Variant;
  quantity: number;
  lineTotal: number;
};

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest" | "name";

export type CatalogQuery = {
  collection?: CollectionSlug;
  brands: string[];
  priceBands: string[];
  inStockOnly: boolean;
  facets: Record<string, string[]>;
  q?: string;
  sort: SortKey;
  page: number;
  perPage: number;
};
