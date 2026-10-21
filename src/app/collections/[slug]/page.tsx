import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CollectionControls } from "@/components/collection-controls";
import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import { getCollection, getCollections, brandsFor, facetsFor, filterProducts, parseQuery, priceBands } from "@/lib/catalog";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return [...getCollections().map((collection) => ({ slug: collection.slug })), { slug: "all" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (slug !== "all" && !collection) return { title: "Collection not found" };
  return {
    title: collection ? collection.name : "All products",
    description: collection?.description ?? "The complete KELVIN catalog of audio, computing, mobile, imaging and gaming products.",
  };
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const raw = await searchParams;
  const collection = getCollection(slug);

  if (slug !== "all" && !collection) notFound();

  const query = parseQuery(raw);
  if (collection) query.collection = collection.slug;

  const result = filterProducts(query);
  const facets = facetsFor(collection?.slug);
  const brands = brandsFor(collection?.slug);
  const basePath = `/collections/${slug}`;

  const flatParams = Object.fromEntries(
    Object.entries(raw)
      .filter(([, value]) => typeof value === "string")
      .map(([key, value]) => [key, value as string]),
  );

  return (
    <div className="shell pt-6 pb-20 md:pt-8 md:pb-24">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <ChevronRight size={12} strokeWidth={1.75} className="text-faint" />
        <span className="text-ink">{collection ? collection.name : "All products"}</span>
      </nav>

      <header className="mt-8 grid gap-6 border-b border-line pb-10 md:grid-cols-12 md:items-end md:gap-8">
        <div className="md:col-span-7">
          <p className="type-micro text-muted">{collection?.eyebrow ?? "Catalog / All"}</p>
          <h1 className="type-h1 mt-3">{collection?.name ?? "All products"}</h1>
        </div>
        <div className="md:col-span-5">
          <p className="max-w-[46ch] text-sm leading-relaxed text-ink-2">
            {collection?.description ??
              "Every product we currently stock, across five departments. Filter by brand, price, type or availability."}
          </p>
        </div>
      </header>

      <div className="mt-8">
        <CollectionControls
          basePath={basePath}
          params={flatParams}
          facets={facets}
          brands={brands}
          total={result.total}
          priceBands={priceBands}
        />
      </div>

      {result.items.length === 0 ? (
        <div className="mt-10 border border-line bg-paper px-6 py-16 text-center">
          <p className="type-micro text-muted">No matches</p>
          <h2 className="mt-3 text-xl font-medium tracking-[-0.02em]">Nothing fits those filters.</h2>
          <p className="mx-auto mt-2 max-w-[44ch] text-sm text-muted">
            Try widening the price range or clearing a brand. Everything we stock is listed here — there is no
            hidden inventory.
          </p>
          <Link href={basePath} className="btn btn-sm mt-6">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-3 lg:gap-y-12">
          {result.items.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 3} />
          ))}
        </div>
      )}

      <Pagination basePath={basePath} params={flatParams} page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
