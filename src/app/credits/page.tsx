import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Credits",
  description: "Photography, typeface and software credits for the Cloud storefront.",
};

const fonts = [
  {
    name: "Poppins",
    role: "Interface, headings and commerce type",
    license: "SIL Open Font License 1.1",
    href: "/licenses/Poppins-OFL.txt",
  },
];

const photographs = [
  { asset: "Halo smart bulb", source: "Pexels", id: "20713462", href: "https://www.pexels.com/photo/20713462/" },
  { asset: "Arc floor lamp", source: "Vecteezy", id: "50038322", href: "https://www.vecteezy.com/photo/50038322" },
  { asset: "Line light strip", source: "Pexels", id: "34195903", href: "https://www.pexels.com/photo/34195903/" },
  { asset: "Plug mini", source: "Vecteezy", id: "59981040", href: "https://www.vecteezy.com/photo/59981040" },
  { asset: "Current 4-way strip", source: "Pexels", id: "39234197", href: "https://www.pexels.com/photo/39234197/" },
  { asset: "Orbit power cube", source: "Pexels", id: "35921904", href: "https://www.pexels.com/photo/35921904/" },
  { asset: "Kettle one", source: "Vecteezy", id: "50631875", href: "https://www.vecteezy.com/photo/50631875" },
  { asset: "Air four", source: "Vecteezy", id: "44813044", href: "https://www.vecteezy.com/photo/44813044" },
  { asset: "Blend mini", source: "Vecteezy", id: "51495767", href: "https://www.vecteezy.com/photo/51495767" },
  { asset: "Everyday tee", source: "Vecteezy", id: "50631973", href: "https://www.vecteezy.com/photo/50631973" },
  { asset: "Cloud hoodie", source: "Vecteezy", id: "48773958", href: "https://www.vecteezy.com/photo/48773958" },
  { asset: "Day tote", source: "Vecteezy", id: "66523849", href: "https://www.vecteezy.com/photo/66523849" },
];

export default function CreditsPage() {
  return (
    <div className="shell pt-5 pb-20 md:pt-7 md:pb-24">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link href="/" className="transition-colors duration-150 hover:text-ink">
          Home
        </Link>
        <span className="mx-1.5 text-border">/</span>
        <span className="text-ink">Credits</span>
      </nav>

      <header className="card mt-6 max-w-[860px] p-6 sm:p-8">
        <p className="type-eyebrow">Credits</p>
        <h1 className="type-h1 mt-2">Made for this store.</h1>
        <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-muted">
          Product photography is licensed from Vecteezy and Pexels. Backgrounds were removed and images were
          colour-corrected for this storefront. Product names and specifications are Cloud catalogue content.
        </p>
      </header>

      <section className="mt-10 grid gap-8 border-b border-border pb-10 md:grid-cols-12" aria-labelledby="photography">
        <div className="md:col-span-4">
          <p className="type-eyebrow">01 / Photography</p>
          <h2 id="photography" className="type-h3 mt-3">
            Licensed product images
          </h2>
        </div>
        <div className="md:col-span-8">
          <ul className="divide-y divide-border border-y border-border">
            {photographs.map((photo) => (
              <li key={photo.asset} className="flex flex-wrap items-baseline justify-between gap-2 py-3.5">
                <span className="text-sm font-medium">{photo.asset}</span>
                <a
                  href={photo.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors duration-150 hover:text-ink"
                >
                  {photo.source} / {photo.id}
                  <ArrowUpRight size={11} strokeWidth={1.9} />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[62ch] text-xs leading-relaxed text-muted">
            Images are illustrative. Finish and small details on the units that ship may differ. Background removal
            was done in-house; no stock watermark is present in the delivered assets.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-8 border-b border-border pb-10 md:grid-cols-12" aria-labelledby="typefaces">
        <div className="md:col-span-4">
          <p className="type-eyebrow">02 / Typeface</p>
          <h2 id="typefaces" className="type-h3 mt-3">
            Self-hosted, openly licensed
          </h2>
        </div>
        <div className="md:col-span-8">
          <ul className="divide-y divide-border border-y border-border">
            {fonts.map((font) => (
              <li key={font.name} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
                <div>
                  <p className="text-[15px] font-medium">{font.name}</p>
                  <p className="mt-1 text-xs text-muted">{font.role}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted">{font.license}</span>
                  <a
                    href={font.href}
                    className="inline-flex items-center gap-1.5 underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-ink"
                  >
                    Licence text
                    <ArrowUpRight size={11} strokeWidth={1.9} />
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Poppins is self-hosted from <code className="font-mono text-[11px]">src/app/fonts</code>. No third-party
            font CDN is used at runtime.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-8 border-b border-border pb-10 md:grid-cols-12" aria-labelledby="software">
        <div className="md:col-span-4">
          <p className="type-eyebrow">03 / Software</p>
          <h2 id="software" className="type-h3 mt-3">
            Built with
          </h2>
        </div>
        <div className="md:col-span-8">
          <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium">Next.js</dt>
              <dd className="mt-0.5 text-xs text-muted">MIT licence</dd>
            </div>
            <div>
              <dt className="font-medium">React</dt>
              <dd className="mt-0.5 text-xs text-muted">MIT licence</dd>
            </div>
            <div>
              <dt className="font-medium">Tailwind CSS</dt>
              <dd className="mt-0.5 text-xs text-muted">MIT licence</dd>
            </div>
            <div>
              <dt className="font-medium">Lucide icons</dt>
              <dd className="mt-0.5 text-xs text-muted">ISC licence</dd>
            </div>
            <div>
              <dt className="font-medium">rembg</dt>
              <dd className="mt-0.5 text-xs text-muted">MIT licence</dd>
            </div>
          </dl>
        </div>
      </section>

      <p className="mt-8 max-w-[70ch] text-xs leading-relaxed text-muted">
        If you believe something here is misattributed, email{" "}
        <a
          href={`mailto:${site.email}`}
          className="underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-ink"
        >
          {site.email}
        </a>{" "}
        and we will correct it.
      </p>
    </div>
  );
}
