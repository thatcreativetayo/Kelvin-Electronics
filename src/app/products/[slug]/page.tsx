import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronRight, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { productBySlug, products } from "@/data/products";
import { collectionBySlug } from "@/data/collections";
import { isAvailable, priceOf, relatedProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.summary,
    openGraph: {
      title: `${product.name} · KELVIN`,
      description: product.summary,
      images: [{ url: product.images[0].src, width: 1400, height: 1400, alt: product.images[0].alt }],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const collection = collectionBySlug(product.collection);
  const available = isAvailable(product);
  const lowest = priceOf(product);
  const highest = Math.max(...product.variants.map((variant) => variant.price));
  const related = relatedProducts(product);

  return (
    <div className="shell pt-6 pb-20 md:pt-8 md:pb-24">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <ChevronRight size={12} strokeWidth={1.75} className="text-faint" />
        <Link href={`/collections/${product.collection}`} className="transition-colors hover:text-ink">
          {collection?.name}
        </Link>
        <ChevronRight size={12} strokeWidth={1.75} className="text-faint" />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
            <p className="type-micro text-muted">{product.brand}</p>
            <h1 className="mt-2 text-[clamp(1.875rem,3.4vw,2.75rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
              {product.name}
            </h1>
            <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink-2">{product.summary}</p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="num text-2xl tracking-[-0.02em]">{formatPrice(lowest)}</span>
              {highest > lowest && <span className="text-xs text-muted">– {formatPrice(highest)}</span>}
              <span className="ml-auto text-xs text-muted">{available ? "In stock" : "Sold out"}</span>
            </div>

            <div className="mt-6">
              <AddToCart product={product} />
            </div>

            <dl className="mt-7 divide-y divide-line border-y border-line">
              <div className="flex items-start gap-3 py-3.5">
                <Truck size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-2" />
                <div>
                  <dt className="text-[13px] font-medium">Delivery</dt>
                  <dd className="text-xs text-muted">Free over $150. Lagos and Abuja in 1–2 business days.</dd>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3.5">
                <Undo2 size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-2" />
                <div>
                  <dt className="text-[13px] font-medium">Returns</dt>
                  <dd className="text-xs text-muted">Thirty days from delivery, unopened or faulty.</dd>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3.5">
                <ShieldCheck size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-2" />
                <div>
                  <dt className="text-[13px] font-medium">Warranty</dt>
                  <dd className="text-xs text-muted">Two years, handled in-house. Repairs before replacement.</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Detail */}
      <section className="mt-20 grid gap-12 border-t border-line pt-12 lg:grid-cols-12 lg:gap-16" aria-labelledby="detail">
        <div className="lg:col-span-5">
          <p className="type-micro text-muted">In detail</p>
          <h2 id="detail" className="type-h2 mt-2">
            Why we stock it.
          </h2>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-2">
            {product.description.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <ul className="mt-8 space-y-2.5 border-t border-line pt-6">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2.5 text-sm">
                <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <div className="border border-line bg-paper">
            <div className="border-b border-line px-5 py-4">
              <h3 className="type-micro text-muted">Specifications</h3>
            </div>
            <dl className="divide-y divide-line">
              {product.specs.map((spec) => (
                <div key={spec.label} className="grid grid-cols-[minmax(120px,0.6fr)_1fr] gap-4 px-5 py-3.5">
                  <dt className="text-[13px] text-muted">{spec.label}</dt>
                  <dd className="text-[13px] text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Specifications are supplied by the manufacturer and checked against the unit we stock. If a number
            here matters to your decision and you want it confirmed, email us before ordering.
          </p>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-12" aria-labelledby="related">
          <div className="flex items-end justify-between gap-6">
            <h2 id="related" className="type-h3">
              Also worth a look
            </h2>
            <Link
              href={`/collections/${product.collection}`}
              className="type-micro inline-flex items-center gap-1.5 text-muted transition-colors hover:text-ink"
            >
              All {collection?.name.toLowerCase()}
              <ArrowUpRight size={12} strokeWidth={1.75} />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-5">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
