import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { filterProducts } from "@/lib/catalog";
import { getCatalog } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the KELVIN catalog by product, brand or specification.",
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
    <div className="shell pt-8 pb-20 md:pt-10 md:pb-24">
      <p className="type-micro text-muted">Search</p>
      <h1 className="type-h1 mt-3">{q ? `“${q}”` : "Find a product."}</h1>

      <form action="/search" method="get" role="search" className="mt-8 flex max-w-[640px] items-center gap-3 border-b border-ink pb-2">
        <Search size={18} className="shrink-0 text-muted" strokeWidth={1.6} />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products, brands, specifications"
          className="h-11 w-full bg-transparent text-[16px] outline-none placeholder:text-faint"
          aria-label="Search products"
        />
        <button type="submit" className="btn btn-sm shrink-0">
          Search
        </button>
      </form>

      {result ? (
        <>
          <div className="mt-8 flex items-baseline justify-between border-b border-line pb-3">
            <p className="type-small text-muted">
              {result.total} {result.total === 1 ? "result" : "results"} for “{q}”
            </p>
            <Link href="/collections/all" className="type-micro text-muted hover:text-ink">
              Browse everything
            </Link>
          </div>

          {result.items.length === 0 ? (
            <div className="mt-8 border border-line bg-paper px-6 py-16 text-center">
              <p className="type-micro text-muted">No matches</p>
              <h2 className="mt-3 text-xl font-medium tracking-[-0.02em]">Nothing matches that search.</h2>
              <p className="mx-auto mt-2 max-w-[46ch] text-sm text-muted">
                Try a brand (Apple, Sony, Fujifilm), a category (audio, imaging) or a specification such as
                “full-frame”.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {collections.map((collection) => (
                  <Link
                    key={collection.slug}
                    href={`/collections/${collection.slug}`}
                    className="rounded-[var(--radius-xs)] border border-line-strong bg-paper px-2.5 py-1.5 text-xs hover:border-ink"
                  >
                    {collection.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-ink-2">
              Every product we stock is in one of five departments. If you are not sure where to start, the
              shortlist on the homepage is a good place.
            </p>
            <Link href="/#shortlist" className="type-micro mt-5 inline-flex items-center gap-1.5 text-accent">
              The shortlist
              <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>
          <ul className="md:col-span-7 divide-y divide-line border-y border-line">
            {collections.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="group flex items-baseline justify-between gap-4 py-4"
                >
                  <span className="text-lg font-medium tracking-[-0.02em]">{collection.name}</span>
                  <span className="flex items-center gap-3 text-xs text-muted">
                    {collection.tagline}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
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
