import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronRight, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { products } from "@/data/products";
import { priceOf, relatedProducts } from "@/lib/catalog";
import { getCatalog } from "@/lib/content";
import { whatsappOrderHref } from "@/lib/contact";
import { formatPrice } from "@/lib/format";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { products: catalogProducts } = await getCatalog();
  const product = catalogProducts.find((item) => item.slug === slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.summary,
    openGraph: {
      title: `${product.name} | Cloud`,
      description: product.summary,
      images: [{ url: product.images[0].src, width: 1200, height: 1200, alt: product.images[0].alt }],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const { products: catalogProducts, collections } = await getCatalog();
  const product = catalogProducts.find((item) => item.slug === slug);
  if (!product) notFound();

  const collection = collections.find((item) => item.slug === product.collection);
  const lowest = priceOf(product);
  const highest = Math.max(...product.variants.map((variant) => variant.price));
  const related = relatedProducts(product, 4, catalogProducts);

  return (
    <div className="shell pb-20 pt-5 md:pb-24 md:pt-7">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="transition-colors duration-150 hover:text-ink">
          Home
        </Link>
        <ChevronRight size={12} strokeWidth={1.8} />
        <Link
          href={`/collections/${product.collection}`}
          className="transition-colors duration-150 hover:text-ink"
        >
          {collection?.name ?? "Shop"}
        </Link>
        <ChevronRight size={12} strokeWidth={1.8} />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
            <div className="flex items-center justify-between gap-4">
              <p className="type-eyebrow">{product.brand}</p>
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted">Imported by Cloud</span>
            </div>
            <h1 className="type-h1 mt-3">{product.name}</h1>
            <p className="type-body mt-4 max-w-[46ch] text-muted">{product.summary}</p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="num text-[28px] font-semibold leading-none tracking-[-0.03em]">
                {formatPrice(lowest)}
              </span>
              {highest > lowest && <span className="num text-xs text-muted">to {formatPrice(highest)}</span>}
            </div>
            <p className="mt-2 text-[11px] text-muted">Customs included. Free delivery over ₦150,000.</p>

            <div className="mt-7 border-t border-border pt-6">
              <AddToCart product={product} />
            </div>

            <a
              href={whatsappOrderHref(product.name)}
              className="btn btn-secondary mt-2.5 w-full"
              aria-label={`Order ${product.name} on WhatsApp`}
            >
              <WhatsAppIcon size={16} />
              Order on WhatsApp
            </a>

            <dl className="mt-8 divide-y divide-border border-y border-border">
              <div className="flex items-start gap-3 py-3.5">
                <Truck size={16} strokeWidth={1.7} className="mt-0.5 shrink-0 text-primary-text" />
                <div>
                  <dt className="text-[13px] font-medium">Delivery</dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-muted">
                    Free over ₦150,000. Lagos in 1-3 working days, nationwide in 2-5.
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3.5">
                <Undo2 size={16} strokeWidth={1.7} className="mt-0.5 shrink-0 text-primary-text" />
                <div>
                  <dt className="text-[13px] font-medium">Returns</dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-muted">
                    14 days from delivery, unused and in the original packaging.
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3.5">
                <ShieldCheck size={16} strokeWidth={1.7} className="mt-0.5 shrink-0 text-primary-text" />
                <div>
                  <dt className="text-[13px] font-medium">Support</dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-muted">
                    One year on electronics, handled by Cloud. Apparel follows the 14-day return window.
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <section className="mt-16 grid gap-10 border-t border-border pt-12 lg:grid-cols-12 lg:gap-16" aria-labelledby="detail">
        <div className="lg:col-span-5">
          <p className="type-eyebrow">In detail</p>
          <h2 id="detail" className="type-h2 mt-2.5">
            Why we stock it.
          </h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted">
            {product.description.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <ul className="mt-7 space-y-2.5 border-t border-border pt-5">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2.5 text-sm">
                <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <div className="card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink">Specifications</h3>
            </div>
            <dl className="divide-y divide-border">
              {product.specs.map((spec) => (
                <div key={spec.label} className="grid grid-cols-[minmax(120px,0.6fr)_1fr] gap-4 px-5 py-3">
                  <dt className="text-[13px] text-muted">{spec.label}</dt>
                  <dd className="text-[13px] text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Specifications are supplied by the manufacturer and checked against the unit we stock. If a number
            here matters to your decision, ask us before ordering.
          </p>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-12" aria-labelledby="related">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="type-eyebrow">Keep looking</p>
              <h2 id="related" className="type-h2 mt-2.5">
                Also worth a look.
              </h2>
            </div>
            <Link
              href={`/collections/${product.collection}`}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
            >
              All {collection?.name.toLowerCase() ?? "products"}
              <ArrowUpRight size={13} strokeWidth={1.9} />
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
