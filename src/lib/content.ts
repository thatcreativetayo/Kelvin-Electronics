import { createClient } from "@sanity/client";
import { cache } from "react";
import { collections as seedCollections } from "@/data/collections";
import { products as seedProducts } from "@/data/products";
import { imageUrl } from "@/lib/cloudinary";
import { integrations, sanityEnv } from "@/lib/env";
import type { Collection, CollectionSlug, Product, Variant } from "@/lib/types";

export type Catalog = {
  products: Product[];
  collections: Collection[];
  /** Where this request's content came from. Rendered in the footer note in dev. */
  source: "sanity" | "seed";
};

type SanityImageDoc = {
  publicId?: string;
  alt?: string;
  fallbackUrl?: string;
  width?: number;
  height?: number;
};

type SanityProductDoc = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  collection?: CollectionSlug;
  summary?: string;
  description?: string[];
  highlights?: string[];
  specs?: { label: string; value: string }[];
  images?: SanityImageDoc[];
  variants?: { id: string; sku: string; options?: { name: string; value: string }[]; price: number; stock: number }[];
  filters?: Record<string, string>;
  flags?: { featured?: boolean; newArrival?: boolean; bestseller?: boolean };
  releasedAt?: string;
};

type SanityCollectionDoc = {
  name: string;
  slug: string;
  eyebrow?: string;
  tagline?: string;
  description?: string;
  image?: SanityImageDoc;
};

const productQuery = `*[_type == "product" && status == "published"] | order(releasedAt desc) {
  "id": _id,
  name,
  "slug": slug.current,
  brand,
  "collection": collection->slug.current,
  summary,
  description,
  highlights,
  specs[]{ label, value },
  images[]{ publicId, alt, fallbackUrl, width, height },
  variants[]{ id, sku, options[]{ name, value }, price, stock },
  filters,
  flags,
  releasedAt
}`;

const collectionQuery = `*[_type == "collection"] | order(position asc) {
  name,
  "slug": slug.current,
  eyebrow,
  tagline,
  description,
  image{ publicId, alt, fallbackUrl, width, height }
}`;

function mapImages(images: SanityImageDoc[] | undefined, slug: string, fallbackAlt: string) {
  const local = `/products/${slug}.png`;
  const list = (images ?? []).filter((image) => image.publicId || image.fallbackUrl);
  if (!list.length) {
    return [{ src: local, alt: fallbackAlt, width: 1400, height: 1400 }];
  }
  return list.map((image) => ({
    src: imageUrl(image.publicId, image.fallbackUrl || local),
    alt: image.alt || fallbackAlt,
    width: image.width || 1400,
    height: image.height || 1400,
  }));
}

function mapProduct(doc: SanityProductDoc): Product | null {
  if (!doc.slug || !doc.name || !doc.collection) return null;

  const variants: Variant[] = (doc.variants ?? [])
    .filter((variant) => variant.id && variant.sku && Number.isFinite(variant.price))
    .map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      options: Object.fromEntries((variant.options ?? []).map((option) => [option.name, option.value])),
      price: Math.round(variant.price),
      stock: Math.max(0, Math.round(variant.stock ?? 0)),
    }));

  if (!variants.length) return null;

  return {
    id: doc.id,
    slug: doc.slug,
    name: doc.name,
    brand: doc.brand || "Cloud",
    collection: doc.collection,
    summary: doc.summary ?? "",
    description: doc.description?.length ? doc.description : [doc.summary ?? ""],
    highlights: doc.highlights ?? [],
    specs: (doc.specs ?? []).filter((spec) => spec.label && spec.value),
    images: mapImages(doc.images, doc.slug, doc.name),
    variants,
    filters: doc.filters ?? {},
    featured: Boolean(doc.flags?.featured),
    newArrival: Boolean(doc.flags?.newArrival),
    bestseller: Boolean(doc.flags?.bestseller),
    releasedAt: doc.releasedAt ?? "2024-01-01",
  };
}

function mapCollection(doc: SanityCollectionDoc): Collection | null {
  if (!doc.slug || !doc.name) return null;
  const seedCollection = seedCollections.find((collection) => collection.slug === doc.slug);
  return {
    slug: doc.slug as CollectionSlug,
    name: doc.name,
    eyebrow: doc.eyebrow || doc.name,
    tagline: doc.tagline || "",
    description: doc.description || "",
    image: imageUrl(doc.image?.publicId, doc.image?.fallbackUrl || seedCollection?.image || "/products/halo-bulb.png"),
  };
}

/**
 * The content adapter.
 *
 * Sanity is read only when it is configured; otherwise the local seed catalog
 * is returned unchanged. A failed or empty dataset never breaks the storefront
 * — it falls back and logs a single warning. Collections and products are read
 * in parallel, and the request is deduplicated by React's cache.
 */
export const getCatalog = cache(async (): Promise<Catalog> => {
  const seed: Catalog = { products: seedProducts, collections: seedCollections, source: "seed" };

  if (!integrations.sanity) return seed;

  try {
    const client = createClient({
      projectId: sanityEnv.projectId!,
      dataset: sanityEnv.dataset!,
      apiVersion: sanityEnv.apiVersion,
      useCdn: true,
      token: sanityEnv.readToken,
      perspective: "published",
    });

    const [productDocs, collectionDocs] = await Promise.all([
      client.fetch<SanityProductDoc[]>(productQuery),
      client.fetch<SanityCollectionDoc[]>(collectionQuery),
    ]);

    const mappedProducts = productDocs.map(mapProduct).filter((p): p is Product => Boolean(p));
    if (!mappedProducts.length) {
      console.warn("[content] Sanity returned no published products; using the seed catalog.");
      return seed;
    }

    const mappedCollections = collectionDocs.map(mapCollection).filter((c): c is Collection => Boolean(c));

    return {
      products: mappedProducts,
      collections: mappedCollections.length ? mappedCollections : seedCollections,
      source: "sanity",
    };
  } catch (error) {
    console.warn("[content] Sanity request failed; using the seed catalog.", error);
    return seed;
  }
});
