import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CollectionControls } from "@/components/collection-controls";
import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import { getCollections, brandsFor, facetsFor, filterProducts, parseQuery, priceBands } from "@/lib/catalog";
import { getCatalog } from "@/lib/content";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 300;

export function generateStaticParams() {
  return [...getCollections().map((collection) => ({ slug: collection.slug })), { slug: "all" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { collections } = await getCatalog();
  const collection = collections.find((item) => item.slug === slug);
  if (slug !== "all" && !collection) return { title: "Collection not found" };
  return {
    title: collection ? collection.name : "All products",
    description:
      collection?.description ??
      "Every Cloud product currently in stock: electronics, home essentials and the Cloud Wear capsule.",
  };
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const raw = await searchParams;
  const { products: catalogProducts, collections } = await getCatalog();
  const collection = collections.find((item) => item.slug === slug);

  if (slug !== "all" && !collection) notFound();

  const query = parseQuery(raw);
  if (collection) query.collection = collection.slug;

  const result = filterProducts(query, catalogProducts);
  const facets = facetsFor(collection?.slug, catalogProducts);
  const brands = brandsFor(collection?.slug, catalogProducts);
  const basePath = `/collections/${slug}`;

  const flatParams = Object.fromEntries(
    Object.entries(raw)
      .filter(([, value]) => typeof value === "string")
      .map(([key, value]) => [key, value as string]),
  );

  return (
    <div className="shell pb-20 pt-5 md:pb-24 md:pt-7">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="transition-colors duration-150 hover:text-ink">
          Home
        </Link>
        <ChevronRight size={12} strokeWidth={1.8} />
        <span className="text-ink">{collection ? collection.name : "All products"}</span>
      </nav>

      <header className="mt-7 flex flex-col justify-between gap-8 border-b border-border pb-8 sm:pb-10 lg:flex-row lg:items-end">
        <div className="max-w-[680px]">
          <p className="type-eyebrow">{collection?.eyebrow ?? "The catalogue"}</p>
          <h1 className="type-h1 mt-3">{collection?.name ?? "All products"}</h1>
          <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted">
            {collection?.description ??
              "Every product we currently stock, across electronics, home and everyday wear. Filter by type, room, fit, price or availability."}
          </p>
        </div>

        {collection && (
          <div className="relative hidden aspect-square w-[180px] shrink-0 overflow-hidden rounded-2xl border border-border bg-bg lg:block xl:w-[210px]">
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface"
            />
            <Image
              src={collection.image}
              alt={`${collection.name} collection`}
              fill
              priority
              sizes="210px"
              className="object-contain p-5"
            />
          </div>
        )}
      </header>

      <nav aria-label="Categories" className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <Link
          href="/collections/all"
          aria-current={slug === "all" ? "page" : undefined}
          className={
            slug === "all"
              ? "shrink-0 rounded-full border border-ink bg-ink px-3.5 py-1.5 text-xs font-medium text-surface"
              : "shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted transition-colors duration-150 hover:border-ink hover:text-ink"
          }
        >
          All products
        </Link>
        {collections.map((item) => (
          <Link
            key={item.slug}
            href={`/collections/${item.slug}`}
            aria-current={slug === item.slug ? "page" : undefined}
            className={
              slug === item.slug
                ? "shrink-0 rounded-full border border-ink bg-ink px-3.5 py-1.5 text-xs font-medium text-surface"
                : "shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted transition-colors duration-150 hover:border-ink hover:text-ink"
            }
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-7">
        <CollectionControls
          basePath={basePath}
          params={flatParams}
          facets={facets}
          brands={brands}
          total={result.total}
          priceBands={priceBands}
        >
          {result.items.length === 0 ? (
            <div className="card mt-8 px-6 py-16 text-center">
              <p className="type-eyebrow">No matches</p>
              <h2 className="type-h3 mt-3">Nothing fits those filters.</h2>
              <p className="mx-auto mt-2 max-w-[44ch] text-sm leading-relaxed text-muted">
                Try widening the price range or clearing a filter. Everything we stock is listed here - there is
                no hidden inventory.
              </p>
              <Link href={basePath} className="btn mt-6">
                Clear filters
              </Link>
            </div>
          ) : (
            <div
              className={`mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-y-5 ${
                result.items.length > 3 ? "xl:grid-cols-4" : ""
              }`}
            >
              {result.items.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 3} />
              ))}
            </div>
          )}

          <Pagination basePath={basePath} params={flatParams} page={result.page} pageCount={result.pageCount} />
        </CollectionControls>
      </div>
    </div>
  );
}
