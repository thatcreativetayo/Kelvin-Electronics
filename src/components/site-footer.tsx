import Link from "next/link";
import { collections } from "@/data/collections";

const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="shell grid gap-12 py-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-semibold tracking-[-0.06em]">KELVIN</span>
            <span className="text-[14px] leading-none text-accent">°</span>
          </Link>
          <p className="mt-5 max-w-[36ch] text-sm leading-relaxed text-ink-2">
            An independent electronics retailer. We stock a short list of audio, computing, imaging and gaming
            products — chosen for how they hold up after the unboxing, not the launch week.
          </p>
          <p className="type-micro mt-6 text-muted">Lagos · London · Shipping worldwide</p>
        </div>

        <nav aria-label="Shop" className="md:col-span-2">
          <h2 className="type-micro text-muted">Shop</h2>
          <ul className="mt-4 space-y-2.5">
            {collections.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="text-sm text-ink-2 transition-colors hover:text-accent"
                >
                  {collection.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/collections/all" className="text-sm text-ink-2 transition-colors hover:text-accent">
                All products
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Company" className="md:col-span-2">
          <h2 className="type-micro text-muted">Company</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href="/#point-of-view" className="text-sm text-ink-2 transition-colors hover:text-accent">
                Our point of view
              </Link>
            </li>
            <li>
              <Link href="/#service" className="text-sm text-ink-2 transition-colors hover:text-accent">
                Delivery &amp; returns
              </Link>
            </li>
            <li>
              <Link href="/credits" className="text-sm text-ink-2 transition-colors hover:text-accent">
                Image credits
              </Link>
            </li>
            <li>
              <Link href="/studio" className="text-sm text-ink-2 transition-colors hover:text-accent">
                Store admin
              </Link>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h2 className="type-micro text-muted">Contact</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-2">
            <li>
              <a href="mailto:hello@kelvin.store" className="transition-colors hover:text-accent">
                hello@kelvin.store
              </a>
            </li>
            <li>
              <a href="tel:+2341000000000" className="transition-colors hover:text-accent">
                +234 100 000 0000
              </a>
            </li>
            <li className="pt-2 text-xs leading-relaxed text-muted">
              Monday to Friday, 09:00–18:00 WAT.
              <br />
              Replies within one business day.
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-3 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Kelvin Electronics Ltd. Prices shown in USD.</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Product photography: Wikimedia Commons contributors</span>
            <Link href="/credits" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
              Credits
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
