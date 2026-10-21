import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getCatalog } from "@/lib/content";
import { formatPrice, pluralize } from "@/lib/format";

export const revalidate = 300;

const services = [
  {
    icon: Truck,
    title: "Delivery",
    body: "Complimentary over $150. Lagos and Abuja in 1–2 business days, international in 3–5. Every parcel is insured and tracked.",
  },
  {
    icon: RotateCcw,
    title: "Returns",
    body: "Thirty days from delivery, unopened or faulty. We cover return shipping on anything that arrives damaged or not as described.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty",
    body: "Two years on every product we sell, handled in-house. Repairs first, replacement if a repair is not possible.",
  },
];

export default async function HomePage() {
  const { products: catalogProducts, collections: departments } = await getCatalog();

  const hero = catalogProducts.find((product) => product.slug === "airpods-max") ?? catalogProducts[0]!;
  const pick = (slugs: string[]) =>
    slugs
      .map((slug) => catalogProducts.find((product) => product.slug === slug))
      .filter((product): product is (typeof catalogProducts)[number] => Boolean(product));

  const newArrivals = pick(["airpods-pro", "kindle-paperwhite", "fujifilm-x-t5", "steam-deck"]);
  const shortlist = pick(["macbook-air", "iphone-15-pro", "sony-a7r-iv", "nintendo-switch-oled"]);

  return (
    <>
      {/* Hero */}
      <section className="shell pt-8 pb-14 md:pt-12 md:pb-20">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-6">
            <p className="type-micro text-muted">Est. 2026 — Precision electronics</p>
            <h1 className="type-display mt-5">
              Built to be
              <br />
              lived with.
            </h1>
            <p className="type-lead mt-6 max-w-[40ch]">
              Audio, computing, imaging and gaming — chosen for how they hold up after the unboxing.
              Measured, not hyped.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/collections/all" className="btn">
                Shop the catalog
                <ArrowRight size={15} strokeWidth={1.75} />
              </Link>
              <Link href="#point-of-view" className="btn btn-outline">
                Our point of view
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="product-media product-media-hero relative aspect-[5/4] md:aspect-[4/3]">
              <Image
                src={hero.images[0].src}
                alt={hero.images[0].alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain p-[2%]"
              />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <p className="type-micro text-muted">
                01 — {hero.name}
                {Object.values(hero.variants[0].options).length
                  ? ` / ${Object.values(hero.variants[0].options).join(" / ")}`
                  : ""}
              </p>
              <p className="type-micro text-ink">{formatPrice(hero.variants[0].price)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="shell pb-20 md:pb-28" aria-labelledby="departments">
        <div className="flex items-end justify-between gap-6 border-b border-line pb-4">
          <h2 id="departments" className="type-h3">
            Five departments
          </h2>
          <Link
            href="/collections/all"
            className="type-micro inline-flex items-center gap-1.5 text-muted transition-colors hover:text-ink"
          >
            {pluralize(catalogProducts.length, "product")}
            <ArrowUpRight size={12} strokeWidth={1.75} />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-5">
          {departments.map((collection) => (
            <Link key={collection.slug} href={`/collections/${collection.slug}`} className="group">
              <div className="product-media relative aspect-square">
                <Image
                  src={collection.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 45vw, 18vw"
                  className="object-contain p-[4%]"
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <h3 className="text-[15px] font-medium tracking-[-0.015em]">{collection.name}</h3>
                <span className="type-micro text-faint">{collection.eyebrow.split("/")[0].trim()}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{collection.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* New this week */}
      <section className="border-y border-line bg-paper py-16 md:py-20" aria-labelledby="new">
        <div className="shell">
          <div className="flex items-end justify-between gap-6 border-b border-line pb-4">
            <div>
              <p className="type-micro text-muted">Just landed</p>
              <h2 id="new" className="type-h2 mt-2">
                New this week
              </h2>
            </div>
            <Link
              href="/collections/all?sort=newest"
              className="type-micro hidden items-center gap-1.5 text-muted transition-colors hover:text-ink sm:inline-flex"
            >
              Everything new
              <ArrowUpRight size={12} strokeWidth={1.75} />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Point of view */}
      <section id="point-of-view" className="bg-ink py-16 text-paper md:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <p className="type-micro text-white/50">Our point of view</p>
            <h2 className="type-h2 mt-4 text-paper">
              Measured,
              <br />
              not hyped.
            </h2>
            <p className="mt-6 max-w-[44ch] text-[15px] leading-relaxed text-white/70">
              Most electronics are sold on launch-week adjectives. We would rather tell you the driver size,
              the battery chemistry and what a product is actually like on the fourth month. If a specification
              does not change how you use the thing, we leave it out.
            </p>
            <div className="mt-10 grid max-w-[420px] grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {[
                { value: "02 yr", label: "Warranty" },
                { value: "30 day", label: "Returns" },
                { value: String(catalogProducts.length), label: "Products" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="num text-2xl tracking-[-0.03em]">{stat.value}</p>
                  <p className="type-micro mt-1 text-white/45">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-start lg:col-span-7 lg:justify-end">
            <figure className="w-full max-w-[440px]">
              <div className="relative aspect-square bg-[#f4f2ec]">
                <Image
                  src="/products/sony-a7r-iv.png"
                  alt="Sony Alpha 7R IV with its sensor exposed, front view"
                  fill
                  sizes="(max-width: 1024px) 100vw, 440px"
                  className="object-contain p-[3%]"
                />
                <span className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
                  Plate 04
                </span>
              </div>
              <figcaption className="mt-3 flex items-center justify-between">
                <span className="type-micro text-white/45">Alpha 7R IV — 61 MP full-frame</span>
                <Link
                  href="/collections/imaging"
                  className="type-micro inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white"
                >
                  Imaging
                  <ArrowUpRight size={12} strokeWidth={1.75} />
                </Link>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Shortlist */}
      <section className="shell py-16 md:py-24" aria-labelledby="shortlist">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+32px)]">
              <p className="type-micro text-muted">The shortlist</p>
              <h2 id="shortlist" className="type-h2 mt-2">
                What we
                <br />
                recommend first.
              </h2>
              <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-ink-2">
                Four products we hand to people who ask what to buy, without a brief. Each one is in stock and
                has been here longer than a season.
              </p>
              <Link
                href="/collections/all?sort=featured"
                className="type-micro mt-8 inline-flex items-center gap-1.5 text-accent"
              >
                See the full catalog
                <ArrowUpRight size={12} strokeWidth={2} />
              </Link>
            </div>
          </div>

          <ol className="lg:col-span-8">
            {shortlist.map((product, index) => (
              <li key={product.id} className="border-t border-line last:border-b">
                <Link href={`/products/${product.slug}`} className="group grid grid-cols-[auto_84px_1fr_auto] items-center gap-4 py-5 sm:gap-6">
                  <span className="type-micro w-6 text-faint">{String(index + 1).padStart(2, "0")}</span>
                  <div className="product-media relative h-[84px] w-[84px]">
                    <Image
                      src={product.images[0].src}
                      alt=""
                      fill
                      sizes="84px"
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="type-micro text-muted">{product.brand}</p>
                    <h3 className="mt-0.5 truncate text-[17px] font-medium tracking-[-0.02em] transition-colors group-hover:text-accent">
                      {product.name}
                    </h3>
                    <p className="mt-0.5 hidden text-xs text-muted sm:block">{product.summary}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="num text-sm">{formatPrice(product.variants[0].price)}</span>
                    <ArrowRight
                      size={16}
                      strokeWidth={1.5}
                      className="text-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ink"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Service */}
      <section id="service" className="border-t border-line bg-paper py-16 md:py-20" aria-labelledby="service-heading">
        <div className="shell">
          <h2 id="service-heading" className="type-micro text-muted">
            Before you order
          </h2>
          <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
            {services.map((service) => (
              <div key={service.title} className="border-t border-line pt-6 md:border-t-0 md:border-l md:pl-8 md:pt-0">
                <service.icon size={20} strokeWidth={1.4} className="text-ink" />
                <h3 className="mt-4 text-[15px] font-medium">{service.title}</h3>
                <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-ink-2">{service.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
