/** Collection slugs come from content, not a fixed code list. */
export type CollectionSlug = string;

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
  /** Option values, e.g. { colour: "Sand", size: "M" } */
  options: Record<string, string>;
  /** Price in kobo (NGN minor units). */
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

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest" | "name";

export type CatalogQuery = {
  brands: string[];
  priceBands: string[];
  inStockOnly: boolean;
  facets: Record<string, string[]>;
  sort: SortKey;
  q?: string;
  page: number;
  perPage: number;
  collection?: CollectionSlug;
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
