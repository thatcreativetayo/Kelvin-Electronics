import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { filterProducts } from "@/lib/catalog";
import { getCatalog } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Cloud for electronics, home essentials and everyday wear.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";
  const { products: catalogProducts, collections } = await getCatalog();

  const result = q
    ? filterProducts(
        {
          brands: [],
          priceBands: [],
          inStockOnly: false,
          facets: {},
          q,
          sort: "featured",
          page: 1,
          perPage: 48,
        },
        catalogProducts,
      )
    : null;

  return (
    <div className="shell pt-7 pb-20 md:pt-9 md:pb-24">
      <p className="type-eyebrow">Search</p>
      <h1 className="type-h1 mt-2">{q ? `Results for "${q}"` : "Find a product."}</h1>

      <form
        action="/search"
        method="get"
        role="search"
        className="card mt-6 flex max-w-[640px] items-center gap-2 p-2"
      >
        <Search size={18} className="ml-2 shrink-0 text-muted" strokeWidth={1.8} />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products"
          className="h-10 w-full bg-transparent px-1 text-[16px] placeholder:text-muted"
          aria-label="Search products"
        />
        <button type="submit" className="btn btn-sm shrink-0">
          Search
        </button>
      </form>

      {result ? (
        <>
          <div className="mt-8 flex items-baseline justify-between border-b border-border pb-3">
            <p className="text-sm text-muted">
              {result.total} {result.total === 1 ? "result" : "results"} for "{q}"
            </p>
            <Link
              href="/collections/all"
              className="text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
            >
              Browse everything
            </Link>
          </div>

          {result.items.length === 0 ? (
            <div className="card mt-8 px-6 py-16 text-center">
              <p className="type-eyebrow">No matches</p>
              <h2 className="type-h3 mt-3">Nothing matches that search.</h2>
              <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-relaxed text-muted">
                Try a room, a product type or a material. The full catalogue is a short one.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {collections.map((collection) => (
                  <Link
                    key={collection.slug}
                    href={`/collections/${collection.slug}`}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors duration-150 hover:border-ink hover:text-ink"
                  >
                    {collection.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 ${
                result.items.length > 3 ? "lg:grid-cols-4" : ""
              }`}
            >
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mt-8 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-muted">
              Every product we stock sits in one of our categories. If you are not sure where to start, the full
              catalogue is a short one.
            </p>
            <Link
              href="/collections/all"
              className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-text"
            >
              Shop all products
              <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </div>
          <ul className="divide-y divide-border border-y border-border md:col-span-7">
            {collections.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="group flex items-baseline justify-between gap-4 py-4"
                >
                  <span className="text-lg font-medium tracking-[-0.02em]">{collection.name}</span>
                  <span className="flex items-center gap-3 text-xs text-muted">
                    {collection.tagline}
                    <ArrowRight size={14} className="transition-transform duration-150 group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
