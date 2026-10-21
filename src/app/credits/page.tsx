import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import credits from "@/data/image-credits.json";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Image credits",
  description: "Photography credits and licences for the KELVIN catalog.",
};

type Credit = (typeof credits)[number];

export default function CreditsPage() {
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  return (
    <div className="shell pt-8 pb-20 md:pt-10 md:pb-24">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-1.5 text-faint">/</span>
        <span className="text-ink">Image credits</span>
      </nav>

      <header className="mt-8 max-w-[70ch] border-b border-line pb-8">
        <p className="type-micro text-muted">Attribution</p>
        <h1 className="type-h1 mt-3">Image credits</h1>
        <p className="mt-5 text-sm leading-relaxed text-ink-2">
          Product photography is sourced from Wikimedia Commons under the licences listed below. Images have been
          cropped and placed on a transparent 1200 × 1200 canvas; no product has been retouched in a way that changes
          its appearance. Product names and trademarks belong to their respective owners, who are not affiliated
          with KELVIN.
        </p>
      </header>

      <ul className="mt-2 border-t border-line md:hidden">
        {(credits as Credit[]).map((credit) => {
          const product = bySlug.get(credit.slug);
          return (
            <li key={credit.slug} className="border-b border-line py-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm">
                  {product ? (
                    <Link href={`/products/${product.slug}`} className="hover:text-accent">
                      {product.name}
                    </Link>
                  ) : (
                    credit.slug
                  )}
                </p>
                <p className="type-micro shrink-0 text-muted">{credit.license}</p>
              </div>
              <a
                href={credit.page}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-flex items-start gap-1.5 text-sm leading-snug text-ink-2 hover:text-accent"
              >
                {credit.title.replace(/^File:/, "")}
                <ArrowUpRight size={12} strokeWidth={1.75} className="mt-1 shrink-0" />
              </a>
              <p className="mt-1.5 text-xs text-muted">{credit.artist}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="type-micro py-3 pr-4 font-normal text-muted">Product</th>
              <th className="type-micro py-3 pr-4 font-normal text-muted">Photograph</th>
              <th className="type-micro py-3 pr-4 font-normal text-muted">Photographer</th>
              <th className="type-micro py-3 font-normal text-muted">Licence</th>
            </tr>
          </thead>
          <tbody>
            {(credits as Credit[]).map((credit) => {
              const product = bySlug.get(credit.slug);
              return (
                <tr key={credit.slug} className="border-b border-line align-top">
                  <td className="py-4 pr-4 text-sm">
                    {product ? (
                      <Link href={`/products/${product.slug}`} className="hover:text-accent">
                        {product.name}
                      </Link>
                    ) : (
                      credit.slug
                    )}
                  </td>
                  <td className="py-4 pr-4 text-sm">
                    <a
                      href={credit.page}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 text-ink-2 hover:text-accent"
                    >
                      {credit.title.replace(/^File:/, "")}
                      <ArrowUpRight size={12} strokeWidth={1.75} />
                    </a>
                  </td>
                  <td className="py-4 pr-4 text-sm text-ink-2">{credit.artist}</td>
                  <td className="py-4 text-sm text-muted">{credit.license}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-8 max-w-[70ch] text-xs leading-relaxed text-muted">
        Licence texts: CC0 (public domain dedication), CC BY 3.0 / 4.0 and CC BY-SA 3.0 / 4.0. Where a licence
        requires share-alike, the derivative here is the cropped and re-staged product image used on this site.
        If you are a rights holder and would like an image removed, email{" "}
        <a href="mailto:hello@kelvin.store" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
          hello@kelvin.store
        </a>
        .
      </p>
    </div>
  );
}
