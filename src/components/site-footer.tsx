import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { site, socials } from "@/data/site";
import { whatsappSupportHref } from "@/lib/contact";
import type { Collection } from "@/lib/types";

const year = new Date().getFullYear();

export function SiteFooter({ collections }: { collections: Collection[] }) {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="shell grid gap-12 py-14 lg:grid-cols-12 lg:gap-10 lg:py-20">
        <div className="lg:col-span-5">
          <Link href="/" aria-label="Cloud home" className="inline-flex">
            <Image src="/brand/logo.svg" alt="Cloud" width={792} height={300} className="h-8 w-auto" />
          </Link>
          <p className="mt-6 max-w-[38ch] text-sm leading-relaxed text-muted">
            Cloud imports a short edit of electronics, home essentials and everyday wear. We handle sourcing,
            customs and delivery across Nigeria.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted transition-colors duration-150 hover:text-ink"
              >
                {social.label}
                <ArrowUpRight size={10} strokeWidth={1.8} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
          <nav aria-label="Shop">
            <h2 className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink">Shop</h2>
            <ul className="mt-5 space-y-3">
              {collections.map((collection) => (
                <li key={collection.slug}>
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="text-sm text-muted transition-colors duration-150 hover:text-ink"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/collections/all"
                  className="text-sm text-muted transition-colors duration-150 hover:text-ink"
                >
                  All products
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Help">
            <h2 className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink">Help</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href="/how-it-works" className="text-sm text-muted transition-colors duration-150 hover:text-ink">
                  About Cloud
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works#delivery"
                  className="text-sm text-muted transition-colors duration-150 hover:text-ink"
                >
                  Delivery
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works#returns"
                  className="text-sm text-muted transition-colors duration-150 hover:text-ink"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#contact" className="text-sm text-muted transition-colors duration-150 hover:text-ink">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/credits" className="text-sm text-muted transition-colors duration-150 hover:text-ink">
                  Credits
                </Link>
              </li>
            </ul>
          </nav>

          <div className="col-span-2 sm:col-span-1">
            <h2 className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink">Contact</h2>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2 transition-colors duration-150 hover:text-ink"
                >
                  <Mail size={14} strokeWidth={1.7} />
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsappSupportHref()}
                  className="inline-flex items-center gap-2 transition-colors duration-150 hover:text-ink"
                >
                  <span className="grid h-3.5 w-3.5 place-items-center" aria-hidden>
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  </span>
                  {site.whatsappNumber ? "Order on WhatsApp" : "WhatsApp support"}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} strokeWidth={1.7} className="mt-0.5 shrink-0" />
                <span>
                  {site.location}
                  <br />
                  <span className="text-xs">{site.hours}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="shell flex flex-col gap-3 py-5 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. All prices in Naira, customs included.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Genuine products. Delivered across Nigeria.</span>
            <Link href="/credits" className="underline decoration-border underline-offset-4 hover:text-ink">
              Credits
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
