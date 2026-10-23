import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Lock,
  Mail,
  MessageCircle,
  Truck,
} from "lucide-react";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductCard } from "@/components/product-card";
import { QuickAdd } from "@/components/quick-add";
import { site } from "@/data/site";
import { isAvailable, priceOf } from "@/lib/catalog";
import { whatsappSupportHref } from "@/lib/contact";
import { getCatalog } from "@/lib/content";
import { formatPrice, pluralize } from "@/lib/format";

export const revalidate = 300;

const promises = [
  {
    icon: BadgeCheck,
    title: "Genuine products",
    body: "Sourced from authorised suppliers.",
  },
  {
    icon: Truck,
    title: "Fast delivery",
    body: "Lagos in 1-3 days. Nationwide in 2-5.",
  },
  {
    icon: Lock,
    title: "Secure payment",
    body: "Naira checkout. No card details stored.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp support",
    body: "Real people, Monday to Friday.",
  },
];

const steps = [
  {
    number: "01",
    title: "We choose it.",
    body: "A short edit of electronics, home and everyday wear, bought from makers we trust.",
  },
  {
    number: "02",
    title: "We clear it.",
    body: "Customs and duties are handled before it reaches you. The Naira price is the final price.",
  },
  {
    number: "03",
    title: "We deliver it.",
    body: "Dispatch from Lagos in 1-3 working days, with tracking when the parcel leaves us.",
  },
];

export default async function HomePage() {
  const { products, collections } = await getCatalog();

  const available = products.filter(isAvailable);
  const featured = available.filter((product) => product.featured);
  const heroProducts = (featured.length >= 2 ? featured : available).slice(0, 3);
  const newIn = [...products]
    .filter((product) => product.newArrival)
    .sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime());

  const spotlight =
    featured.find((product) => product.collection === "kitchen") ??
    featured.find((product) => !heroProducts.some((item) => item.id === product.id)) ??
    featured[0] ??
    available[0];

  const countFor = (slug: string) => products.filter((product) => product.collection === slug).length;

  return (
    <>
      <section className="shell pb-10 pt-3 sm:pt-5 md:pb-14" aria-labelledby="hero-title">
        <div className="grid items-stretch gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 xl:gap-16">
          <div className="flex flex-col justify-center py-3 sm:py-6 lg:py-12">
            <p className="type-eyebrow">Trusted Nigerian importer</p>
            <h1 id="hero-title" className="type-hero mt-5 max-w-[11ch]">
              The good stuff, brought home.
            </h1>
            <p className="type-lead mt-6 max-w-[38ch]">
              Electronics, home essentials and everyday wear. Genuine stock, Naira prices, customs already
              handled.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <Link href="/collections/all" className="btn">
                Shop the catalogue
                <ArrowRight size={16} strokeWidth={1.9} />
              </Link>
              <Link href="/how-it-works" className="btn btn-secondary">
                How Cloud works
              </Link>
            </div>

            <dl className="mt-10 grid max-w-[460px] grid-cols-3 gap-5 border-t border-border pt-5">
              <div>
                <dt className="type-micro text-muted">In stock</dt>
                <dd className="num mt-1 text-[22px] font-semibold leading-none">{products.length}</dd>
              </div>
              <div>
                <dt className="type-micro text-muted">Categories</dt>
                <dd className="num mt-1 text-[22px] font-semibold leading-none">{collections.length}</dd>
              </div>
              <div>
                <dt className="type-micro text-muted">Customs</dt>
                <dd className="mt-1 text-[22px] font-semibold leading-none">Included</dd>
              </div>
            </dl>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
            <HeroCarousel products={heroProducts} />
          </div>
        </div>
      </section>

      <section aria-label="Why shop with Cloud" className="border-y border-border bg-surface">
        <div className="shell grid grid-cols-2 gap-x-5 gap-y-6 py-6 md:grid-cols-4 md:gap-x-0 md:py-7">
          {promises.map((promise, index) => (
            <div
              key={promise.title}
              className={
                index === 0
                  ? "flex items-start gap-3 md:pr-7"
                  : "flex items-start gap-3 md:border-l md:border-border md:pl-7 md:pr-7 md:last:pr-0"
              }
            >
              <promise.icon size={18} strokeWidth={1.7} className="mt-0.5 shrink-0 text-primary-text" />
              <div>
                <h2 className="text-[12.5px] font-semibold leading-tight tracking-[-0.01em]">{promise.title}</h2>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{promise.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="shell section" aria-labelledby="categories-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="type-eyebrow">Shop by category</p>
            <h2 id="categories-title" className="type-h2 mt-2.5">
              Find what you came for.
            </h2>
          </div>
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
          >
            All products
            <ArrowUpRight size={14} strokeWidth={1.9} />
          </Link>
        </div>

        <div className="rail-bleed mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="card card-hover group relative w-[74vw] max-w-[310px] shrink-0 snap-start overflow-hidden sm:w-auto sm:max-w-none"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-bg">
                <span
                  aria-hidden
                  className="absolute left-1/2 top-[44%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface"
                />
                <Image
                  src={collection.image}
                  alt={`${collection.name} collection`}
                  fill
                  sizes="(max-width: 640px) 74vw, (max-width: 1024px) 45vw, 25vw"
                  className="object-contain p-[8%] pb-[18%] transition-transform duration-200 group-hover:scale-[1.025]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface via-surface/90 to-transparent px-4 pb-4 pt-16">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="type-micro text-muted">{pluralize(countFor(collection.slug), "piece")}</p>
                      <h3 className="type-h3 mt-1">{collection.name}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted">{collection.tagline}</p>
                    </div>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-surface text-ink transition-colors duration-150 group-hover:border-primary group-hover:text-primary-text">
                      <ArrowUpRight size={15} strokeWidth={1.9} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface" aria-labelledby="new-in-title">
        <div className="shell section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="type-eyebrow">Just landed</p>
              <h2 id="new-in-title" className="type-h2 mt-2.5">
                New in.
              </h2>
            </div>
            <Link
              href="/collections/all?sort=newest"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
            >
              Everything new
              <ArrowUpRight size={14} strokeWidth={1.9} />
            </Link>
          </div>

          <div className="rail-bleed mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {newIn.slice(0, 4).map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 2}
                className="w-[76vw] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none"
              />
            ))}
          </div>
        </div>
      </section>

      {spotlight && (
        <section className="shell section" aria-labelledby="spotlight-title">
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-bg">
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 aspect-square w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface"
                />
                <Image
                  src={spotlight.images[0].src}
                  alt={spotlight.images[0].alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-[9%]"
                />
                <span className="tag absolute left-4 top-4">In focus</span>
              </div>
            </div>

            <div className="lg:col-span-6 lg:pl-4">
              <p className="type-eyebrow">{spotlight.brand}</p>
              <h2 id="spotlight-title" className="type-h1 mt-3 max-w-[12ch]">
                {spotlight.name}
              </h2>
              <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-muted">{spotlight.summary}</p>

              <p className="num mt-6 text-xl font-semibold">{formatPrice(priceOf(spotlight))}</p>
              <p className="mt-1 text-[11px] text-muted">Customs included. Free delivery over ₦150,000.</p>

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <QuickAdd product={spotlight} label="Add to cart" size="md" className="w-full sm:w-auto sm:px-5" />
                <Link href={`/products/${spotlight.slug}`} className="btn btn-secondary">
                  View details
                  <ArrowRight size={15} strokeWidth={1.9} />
                </Link>
              </div>

              <ul className="mt-8 grid gap-2.5 border-t border-border pt-5 text-sm">
                {spotlight.highlights.slice(0, 3).map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5">
                    <Check size={14} strokeWidth={2.2} className="mt-1 shrink-0 text-primary-text" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="bg-ink text-surface" aria-labelledby="promise-title">
        <div className="shell section">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="type-eyebrow text-primary">The Cloud promise</p>
              <h2 id="promise-title" className="type-h2 mt-3 max-w-[12ch]">
                Imported properly, from start to finish.
              </h2>
              <p className="mt-5 max-w-[38ch] text-sm leading-relaxed text-surface/65">
                Cloud is an importer, not a marketplace. We buy the stock, carry the customs risk and stand
                behind what arrives at your door.
              </p>
              <Link href="/how-it-works" className="btn mt-7">
                Read the full promise
                <ArrowRight size={15} strokeWidth={1.9} />
              </Link>
            </div>

            <div className="lg:col-span-7">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="grid grid-cols-[36px_1fr] gap-4 border-t border-surface/15 py-5 sm:grid-cols-[56px_1fr] sm:gap-6 sm:py-6"
                >
                  <span className="num text-sm font-medium text-primary">{step.number}</span>
                  <div>
                    <h3 className="text-[15px] font-medium tracking-[-0.01em]">{step.title}</h3>
                    <p className="mt-1.5 max-w-[48ch] text-xs leading-relaxed text-surface/60">{step.body}</p>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-surface/15 pt-5 text-xs text-surface/60">
                {["Genuine stock", "Customs included", "14-day returns"].map((line) => (
                  <span key={line} className="inline-flex items-center gap-1.5">
                    <Check size={12} strokeWidth={2.2} className="text-primary" />
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface" aria-labelledby="help-title">
        <div className="shell grid gap-6 py-10 sm:py-12 md:grid-cols-12 md:items-center md:gap-10">
          <div className="md:col-span-7">
            <p className="type-eyebrow">Need a hand?</p>
            <h2 id="help-title" className="type-h2 mt-2.5">
              Ask us before you order.
            </h2>
            <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-muted">
              Send the product name and your city. We will confirm stock, delivery and the final price before
              you commit.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 md:col-span-5 md:justify-end">
            <a href={whatsappSupportHref()} className="btn">
              <MessageCircle size={16} strokeWidth={1.9} />
              WhatsApp us
            </a>
            <a href={`mailto:${site.email}`} className="btn btn-secondary">
              <Mail size={15} strokeWidth={1.9} />
              Email
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
